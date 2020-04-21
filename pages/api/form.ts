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

function csvIntoArray(
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

function parseForm(req: NextApiRequest): Promise<Files> {
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

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const files = await parseForm(req);
  const firstFile = Object.values(files)[0];
  if (!firstFile) {
    return Promise.resolve(res.status(200).send("No file found."));
  }

  const stream = parseFile(firstFile.path, { headers: true });

  const values = await csvIntoArray(stream);
  const pdfBytes = await buildPdf(values);
  return res.status(200).send(pdfBytes);
};
