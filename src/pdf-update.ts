import { degrees, PDFDocument, rgb, StandardFonts } from "pdf-lib";
import * as fs from "fs";
import * as path from "path";

// This should be a Uint8Array or ArrayBuffer
// This data can be obtained in a number of different ways
// If your running in a Node environment, you could use fs.readFile()
// In the browser, you could make a fetch() call and use res.arrayBuffer()
async function updateFile(existingPdfBytes: Buffer, target: string) {
  // Load a PDFDocument from the existing PDF bytes
  const pdfDoc = await PDFDocument.load(existingPdfBytes);

  // Embed the Helvetica font
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Get the first page of the document
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];

  // Get the width and height of the first page
  const { width, height } = firstPage.getSize();

  // Draw a string of text diagonally across the first page
  firstPage.drawText("This text was added with JavaScript!", {
    x: 5,
    y: height / 2 + 300,
    size: 50,
    font: helveticaFont,
    color: rgb(0.95, 0.1, 0.1),
    rotate: degrees(-45),
  });
  // Serialize the PDFDocument to bytes (a Uint8Array)
  const pdfBytes = await pdfDoc.save();
  await fs.promises.writeFile(target, pdfBytes);
}

async function main() {
  const folder = path.join(__dirname, "..", "files");
  const csv = path.join(folder, "data.csv");
  const pdf = path.join(folder, "template.pdf");
  const pdfTarget = path.join(folder, "target.pdf");

  console.log(`Looking for ${pdf}, writing to ${pdfTarget}`);

  fs.promises.readFile(pdf).then((vuffer) => updateFile(vuffer, pdfTarget));
}

main()
  .then(() => {
    console.log("done");
  })
  .catch((err) => {
    console.error(err);
  });
