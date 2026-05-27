import PDFDocument from "pdfkit";
import type { GeneratedPaper } from "../ai/schema.js";

const DIFF: Record<string, string> = {
  easy: "Easy",
  moderate: "Moderate",
  challenging: "Challenging",
};

export function renderPaperPdf(paper: GeneratedPaper): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 56 });
    const chunks: Buffer[] = [];
    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const ink = "#222222";
    doc.fillColor(ink);

    doc.font("Helvetica-Bold").fontSize(18).text(paper.schoolName, { align: "center" });
    doc.fontSize(12).text(`Subject: ${paper.subject}`, { align: "center" });
    doc.text(`Class: ${paper.className}`, { align: "center" });
    doc.moveDown(0.8);

    doc
      .font("Helvetica")
      .fontSize(11)
      .text(`Time Allowed: ${paper.durationMins} minutes`, { continued: true })
      .text(`Maximum Marks: ${paper.totalMarks}`, { align: "right" });
    doc.moveDown(0.5);
    doc.text(paper.generalInstructions);
    doc.moveDown(0.6);

    doc.text("Name: ______________________");
    doc.text("Roll Number: ________________");
    doc.text(`Class: ${paper.className}     Section: __________`);
    doc.moveDown(0.6);

    let n = 0;
    for (const section of paper.sections) {
      doc.moveDown(0.4);
      doc.font("Helvetica-Bold").fontSize(13).text(section.name, { align: "center" });
      doc.fontSize(11).text(`${section.title} — ${section.instruction}`);
      doc.moveDown(0.3);
      doc.font("Helvetica").fontSize(11);
      for (const q of section.questions) {
        n += 1;
        const gap = q.options && q.options.length > 0 ? 2 : 5;
        doc.text(`${n}. [${DIFF[q.difficulty] ?? q.difficulty}] ${q.text} [${q.marks} Marks]`, {
          paragraphGap: gap,
        });
        if (q.options) {
          q.options.forEach((opt, i) => {
            doc.text(`${String.fromCharCode(65 + i)}. ${opt}`, { indent: 16, paragraphGap: 2 });
          });
          doc.moveDown(0.2);
        }
      }
    }

    doc.moveDown(0.6);
    doc.font("Helvetica-Bold").fontSize(11).text("— End of Question Paper —", { align: "center" });

    if (paper.answerKey.length > 0) {
      doc.moveDown(1);
      doc.font("Helvetica-Bold").fontSize(13).text("Answer Key");
      doc.moveDown(0.3);
      doc.font("Helvetica").fontSize(11);
      for (const a of paper.answerKey) {
        doc.text(`${a.n}. ${a.answer}`, { paragraphGap: 5 });
      }
    }

    doc.end();
  });
}
