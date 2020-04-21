import { IncomingForm, Files, Fields } from "formidable";
import { NextApiRequest, NextApiResponse } from "next";
import { parseFile, CsvParserStream } from "fast-csv";
import { Row } from "@fast-csv/parse";
import { LabelData, buildPdf } from "../../lib/pdf-update";

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
        const message = data["Notes - From Buyer"].trim();
        const id = data["Order - Number"].trim();
        rows.push({ id, message });
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
  const firstFile = Object.values(files)[0];
  if (!firstFile || firstFile.size <= 0) {
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
