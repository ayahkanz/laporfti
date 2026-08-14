import PDFDocument from "pdfkit";
import { divisionForCategory } from "../../src/lib/divisions";
import { DIVISION_LABELS } from "../../src/lib/divisions";
import type { Report } from "../../src/types";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short" });
}

// Truncates to fit a fixed-width table cell, measured against the doc's
// current font/size so a single truncated line never wraps or bleeds into
// the next column (full untruncated detail is always in the Excel export).
function truncate(doc: PDFKit.PDFDocument, text: string, widthPt: number): string {
  if (doc.widthOfString(text) <= widthPt) return text;
  let result = text;
  while (result.length > 0 && doc.widthOfString(result + "…") > widthPt) {
    result = result.slice(0, -1);
  }
  return result + "…";
}

export type SummaryRow = {
  id: string;
  title: string;
  category: string;
  status: string;
  urgency: string;
  reporter_name: string;
  created_at: string;
};

// Landscape rekap table of many reports — mirrors the Excel export's scope
// and filters, just rendered as a printable PDF instead of a spreadsheet.
export function generateReportsSummaryPdf(rows: SummaryRow[], filterLabel: string): PDFKit.PDFDocument {
  const doc = new PDFDocument({ size: "A4", layout: "landscape", margin: 40 });

  const columns = [
    { key: "id", label: "Kode Tiket", width: 75 },
    { key: "title", label: "Judul", width: 210 },
    { key: "category", label: "Kategori", width: 100 },
    { key: "status", label: "Status", width: 85 },
    { key: "urgency", label: "Urgensi", width: 60 },
    { key: "reporter_name", label: "Pelapor", width: 100 },
    { key: "created_at", label: "Tanggal Masuk", width: 90 },
  ] as const;

  doc.fontSize(14).font("Helvetica-Bold").text("Rekap Laporan — Lapor FIT FTI UII", { align: "center" });
  doc.fontSize(9).font("Helvetica").text(filterLabel, { align: "center" });
  doc.text(`Dicetak: ${formatDate(new Date().toISOString())} · Total: ${rows.length} laporan`, { align: "center" });
  doc.moveDown(1);

  const tableLeft = doc.page.margins.left;
  const rowHeight = 20;
  const fontSize = 8;

  function drawHeaderRow() {
    let x = tableLeft;
    const y = doc.y;
    doc.font("Helvetica-Bold").fontSize(fontSize);
    for (const col of columns) {
      doc.text(col.label, x, y, { width: col.width });
      x += col.width;
    }
    doc.moveDown(0.6);
    doc
      .moveTo(tableLeft, doc.y)
      .lineTo(tableLeft + columns.reduce((sum, c) => sum + c.width, 0), doc.y)
      .strokeColor("#999999")
      .stroke();
    doc.moveDown(0.3);
  }

  drawHeaderRow();

  doc.font("Helvetica").fontSize(fontSize);
  for (const row of rows) {
    if (doc.y + rowHeight > doc.page.height - doc.page.margins.bottom) {
      doc.addPage();
      drawHeaderRow();
      doc.font("Helvetica").fontSize(fontSize);
    }
    let x = tableLeft;
    const y = doc.y;
    for (const col of columns) {
      const raw = row[col.key as keyof SummaryRow] ?? "";
      const value = col.key === "created_at" ? formatDate(String(raw)) : String(raw);
      doc.text(truncate(doc, value, col.width - 6), x, y, { width: col.width, lineBreak: false });
      x += col.width;
    }
    doc.moveDown(0.9);
  }

  doc.end();
  return doc;
}

// Formal single-ticket printout for physical filing/signature: letterhead,
// full detail, handling timeline, and a signature block.
export function generateReportDetailPdf(report: Report): PDFKit.PDFDocument {
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const division = divisionForCategory(report.category);

  doc.fontSize(14).font("Helvetica-Bold").text("FAKULTAS TEKNOLOGI INDUSTRI", { align: "center" });
  doc.fontSize(12).text("UNIVERSITAS ISLAM INDONESIA", { align: "center" });
  doc.moveDown(0.5);
  doc
    .moveTo(doc.page.margins.left, doc.y)
    .lineTo(doc.page.width - doc.page.margins.right, doc.y)
    .lineWidth(1.5)
    .strokeColor("#000000")
    .stroke();
  doc.moveDown(0.8);

  doc.fontSize(12).font("Helvetica-Bold").text("LAPORAN PENANGANAN ADUAN / ASPIRASI", { align: "center" });
  doc.fontSize(10).font("Helvetica").text(`Kode Tiket: ${report.id}`, { align: "center" });
  doc.moveDown(1);

  function field(label: string, value: string) {
    doc.font("Helvetica-Bold").fontSize(9).text(label, { continued: true }).font("Helvetica").text(` ${value}`);
  }

  doc.fontSize(11).font("Helvetica-Bold").text("Informasi Laporan");
  doc.moveDown(0.3);
  field("Judul:", report.title);
  field("Kategori:", report.category);
  field("Divisi Penanggung Jawab:", division ? DIVISION_LABELS[division] : "Belum ditentukan (kategori Lainnya)");
  field("Urgensi:", report.urgency);
  field("Status Saat Ini:", report.status);
  field("Visibilitas:", report.isPublic ? `Publik (${report.moderationStatus === "APPROVED" ? "tayang" : "belum/tidak tayang"})` : "Privat");
  field("Tanggal Masuk:", formatDate(report.createdAt));
  field("Terakhir Diperbarui:", formatDate(report.updatedAt));
  doc.moveDown(0.8);

  doc.fontSize(11).font("Helvetica-Bold").text("Data Pelapor");
  doc.moveDown(0.3);
  field("Nama:", report.reporterName || "Anonim");
  if (report.reporterRole) field("Peran:", report.reporterRole);
  field("Email:", report.reporterEmail);
  field("WhatsApp:", report.reporterWhatsapp || "-");
  doc.moveDown(0.8);

  doc.fontSize(11).font("Helvetica-Bold").text("Isi Aduan");
  doc.moveDown(0.3);
  doc.font("Helvetica").fontSize(9).text(report.description, { align: "justify" });
  doc.moveDown(0.8);

  if (report.disposedToEmail) {
    doc.fontSize(11).font("Helvetica-Bold").text("Disposisi");
    doc.moveDown(0.3);
    field("Didisposisikan kepada:", report.disposedToEmail);
    if (report.disposedBy) field("Oleh:", report.disposedBy);
    if (report.disposedAt) field("Pada:", formatDate(report.disposedAt));
    if (report.dispositionNote) field("Catatan:", report.dispositionNote);
    doc.moveDown(0.8);
  }

  doc.fontSize(11).font("Helvetica-Bold").text("Linimasa Penanganan");
  doc.moveDown(0.3);
  doc.font("Helvetica").fontSize(9);
  for (const entry of report.timeline) {
    doc.font("Helvetica-Bold").text(`${formatDate(entry.timestamp)} — ${entry.status}`, { continued: false });
    doc.font("Helvetica").text(entry.note);
    doc.moveDown(0.4);
  }

  const staffReplies = report.comments.filter((c) => c.senderRole === "Admin");
  if (staffReplies.length > 0) {
    doc.moveDown(0.4);
    doc.fontSize(11).font("Helvetica-Bold").text("Balasan Resmi Staf");
    doc.moveDown(0.3);
    doc.font("Helvetica").fontSize(9);
    for (const reply of staffReplies) {
      doc.font("Helvetica-Bold").text(`${formatDate(reply.createdAt)} — ${reply.senderName}`, { continued: false });
      doc.font("Helvetica").text(reply.content);
      doc.moveDown(0.4);
    }
  }

  // Signature block — always start on the current position, adding a page
  // first only if there isn't enough room left for it.
  const signatureBlockHeight = 150;
  if (doc.y + signatureBlockHeight > doc.page.height - doc.page.margins.bottom) {
    doc.addPage();
  }
  doc.moveDown(1.5);
  const colWidth = (doc.page.width - doc.page.margins.left - doc.page.margins.right) / 2;
  const leftX = doc.page.margins.left;
  const rightX = doc.page.margins.left + colWidth;
  const sigY = doc.y;

  doc.font("Helvetica").fontSize(9);
  doc.text("Diperiksa oleh,", leftX, sigY, { width: colWidth, align: "center" });
  doc.text("Mengetahui,", rightX, sigY, { width: colWidth, align: "center" });
  doc.text("Staf Administrasi FTI", leftX, sigY + 60, { width: colWidth, align: "center" });
  doc.text("Dekanat FTI UII", rightX, sigY + 60, { width: colWidth, align: "center" });
  doc.text("(_________________________)", leftX, sigY + 75, { width: colWidth, align: "center" });
  doc.text("(_________________________)", rightX, sigY + 75, { width: colWidth, align: "center" });

  doc.moveDown(1.5);
  doc.fontSize(8).fillColor("#666666").text(`Dokumen dicetak otomatis dari Portal Lapor FIT pada ${formatDate(new Date().toISOString())}.`, {
    align: "center",
  });

  doc.end();
  return doc;
}
