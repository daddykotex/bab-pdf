import { PDFDocument, rgb, StandardFonts, PDFPage, PDFFont } from "pdf-lib";
import { splitString } from "./text";

export type LabelData = {
  message: string;
  id: string;
};

type Label = {
  data: LabelData;
  x: number;
  y: number;
};

const topPadding = 70;
const leftPadding = 145;
const maxWidthCharacters = 40;

async function addOne(label: Label, page: PDFPage, font: PDFFont) {
  const textSize = 12;
  const fromTop = topPadding + label.x * 250;
  const fromLeft = leftPadding + label.y * 300;

  splitString(label.data.message, maxWidthCharacters).forEach((line, index) => {
    const alphanumericLine = line.replace(/[^a-z0-9]/gi, " "); //only alpha to check the length
    const lineWidth = font.widthOfTextAtSize(alphanumericLine, textSize);
    const lineY = index * 15;
    try {
      page.drawText(line, {
        x: fromLeft - lineWidth / 2,
        y: page.getHeight() - fromTop - lineY,
        size: textSize,
        font: font,
        color: rgb(0, 0, 0),
      });
    } catch (err) {
      // the line contains nonvalid characters, best effort to keep only relevant stuff
      const clean = line.replace(/[^a-zA-Z0-9A-zÀ-ú _\-]/g, " ");
      page.drawText(clean, {
        x: fromLeft - lineWidth / 2,
        y: page.getHeight() - fromTop - lineY,
        size: textSize,
        font: font,
        color: rgb(0, 0, 0),
      });
    }
  });

  const lineWidth = font.widthOfTextAtSize(label.data.id, textSize);
  page.drawText(label.data.id, {
    x: fromLeft - lineWidth / 2,
    y: page.getHeight() - fromTop - 200,
    size: textSize,
    font: font,
    color: rgb(0.756, 0.756, 0.756),
  });
}

async function preparePdf(
  font: StandardFonts
): Promise<[PDFDocument, PDFFont]> {
  const pdf = await PDFDocument.create();
  const pdfFont = await pdf.embedFont(font);
  return [pdf, pdfFont];
}

export async function buildPdf(payload: Array<LabelData>): Promise<Uint8Array> {
  const [pdf, pdfFont] = await preparePdf(StandardFonts.Helvetica);
  const nbColPerPage = 2;
  const nbRowPerPage = 3;
  const perPage = nbColPerPage * nbRowPerPage;

  payload.map((labelData, index) => {
    const currentPageIdx = Math.floor(index / perPage);
    const tryPage = pdf.getPages()[currentPageIdx];
    const page = tryPage || pdf.addPage();
    addOne(toLabel(labelData, index), page, pdfFont);
  });

  function toLabel(label: LabelData, index: number): Label {
    const perPageIndex = index - perPage * Math.floor(index / perPage);
    const y = perPageIndex % 2;
    const x = Math.floor(perPageIndex / 2);
    return {
      data: label,
      x,
      y,
    };
  }

  return await pdf.save();
}

// async function main() {
//   const folder = path.join(__dirname, "..", "files");
//   const csv = path.join(folder, "data.csv");
//   const pdfTarget = path.join(folder, "target.pdf");

//   const labels: Array<LabelData> = [
//     {
//       id: "123",
//       message:
//         "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum eu egestas ex, eu varius metus. Morbi lobortis diam nisl, in mattis tellus consectetur blandit.",
//     },
//     {
//       id: "15462323",
//       message:
//         "Nulla ac turpis est. In vehicula sapien at gravida vehicula. Vestibulum bibendum nulla ut velit euismod maximus. Morbi viverra dolor posuere, tempus metus vitae, posuere arcu. Morbi quis arcu magna. In ut hendrerit odio. Pellentesque sed nisi mauris.",
//     },
//     {
//       id: "1267583",
//       message:
//         "Etiam ut eros eu felis euismod sollicitudin. Etiam felis lacus, malesuada eget massa sit amet, lobortis fermentum lacus. Ut vel purus ut urna sollicitudin tempor. ",
//     },
//     {
//       id: "1223453",
//       message:
//         "Morbi quis tincidunt leo. Praesent elementum ligula libero, eu imperdiet orci viverra et. Aenean elementum pellentesque varius. Integer sed nunc nisl. Nunc arcu odio, efficitur at purus nec, congue volutpat sem.",
//     },
//     {
//       id: "14564623",
//       message:
//         "Donec velit lectus, elementum id purus sit amet, commodo malesuada libero. Donec at luctus mi, nec pellentesque magna. Interdum et malesuada fames ac ante ipsum primis in faucibus.",
//     },
//     {
//       id: "12123",
//       message:
//         "Vivamus condimentum non diam varius placerat. Suspendisse mollis ornare tellus.",
//     },
//     {
//       id: "122133",
//       message:
//         "Vivamus condimentum non diam varius placerat. Suspendisse mollis ornare tellus.",
//     },
//   ];

//   const bytes = await buildPdf(labels);
//   return fs.promises.writeFile(pdfTarget, bytes);
// }

// main()
//   .then(() => {
//     console.log("done");
//   })
//   .catch((err) => {
//     console.error(err);
//   });
