import { IncomingForm, Files, Fields, File as FFile } from "formidable";
import { NextApiRequest, NextApiResponse } from "next";
import { parseFile, CsvParserStream } from "fast-csv";
import { Row } from "@fast-csv/parse";
import { LabelData, buildPdf } from "../../lib/pdf-update";
import { sanitizeString } from "../../lib/text";

export const config = {
  api: {
    bodyParser: false,
  },
};

async function csvIntoArray(
  stream: CsvParserStream<Row, Row>
): Promise<Array<LabelData>> {
  return new Promise((resolve, reject) => {
    const rows: Array<LabelData> = [];
    stream
      .on("data", (data) => {
        const raw = data["Notes - From Buyer"];
        const id = data["Order - Number"].trim();
        const message = sanitizeString(raw);
        if (message && message.length > 0) {
          rows.push({ id, message });
        }
      })
      .on("end", () => {
        resolve(rows);
      })
      .on("error", (error) => reject(error));
  });
}

async function parseForm(req: NextApiRequest): Promise<Files> {
  const form = new IncomingForm();
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields: Fields, files: Files) => {
      if (err) {
        reject(err);
      } else {
        resolve(files);
      }
    });
  });
}

async function process(req: NextApiRequest): Promise<Uint8Array> {
  const files = await parseForm(req);
  let firstFile: FFile | undefined;
  const temp = Object.values(files)[0];
  if (temp) {
    if (Array.isArray(temp)) {
      if (temp.length >= 0) {
        firstFile = temp[0];
      }
    } else {
      firstFile = temp;
    }
  }

  if (!firstFile) {
    return Promise.reject({
      code: 302,
      loc: "/?error=file_not_found",
    });
  }

  const stream = parseFile(firstFile.path, { headers: true });
  const values = await csvIntoArray(stream);
  return buildPdf(values);
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  return process(req)
    .then((pdfBytes) => {
      res.writeHead(200, {
        "Content-disposition": 'attachment; filename="labels.pdf',
        "Content-Type": "application/pdf",
      });
      res.end(Buffer.from(pdfBytes));
      return;
    })
    .catch((err) => {
      if (err.code && err.loc) {
        console.log("Not found");
        res.writeHead(err.code, {
          Location: err.loc,
        });
        res.end();
      } else {
        console.error(err);
        res.writeHead(500);
        res.end("Oops");
      }
    });
};
