import { jsPDF } from "jspdf";
import { formatCurrency } from "./formatters";

/**
 * Genera y descarga un comprobante bancario oficial en PDF para una transferencia.
 */
export function downloadTransferReceiptPdf({
  operationId = "TX-0001",
  date = new Date().toLocaleString("es-AR"),
  amount = 0,
  motive = "Varios",
  origin = {},
  destination = {},
  status = "Completada / Exitosa",
}) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // ─── ENCABEZADO CON COLOR INSTITUCIONAL ───
  doc.setFillColor(0, 86, 210); // #0056D2
  doc.rect(0, 0, pageWidth, 38, "F");

  // Logo / Nombre de la entidad
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("DigitalArs", 15, 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Billetera Virtual & Servicios Financieros", 15, 25);
  doc.text("Comprobante Oficial de Transferencia", 15, 31);

  // Fecha y Nro de Operación a la derecha del banner
  doc.setFontSize(9);
  doc.text(`Operación: ${operationId}`, pageWidth - 15, 18, { align: "right" });
  doc.text(`Emisión: ${date}`, pageWidth - 15, 25, { align: "right" });

  let currentY = 50;

  // ─── MONTO DESTACADO ───
  doc.setFillColor(240, 246, 255); // #F0F6FF
  doc.roundedRect(15, currentY, pageWidth - 30, 26, 3, 3, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139); // #64748B
  doc.text("MONTO TRANSFERIDO", 22, currentY + 9);

  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42); // #0F172A
  doc.text(formatCurrency(amount), 22, currentY + 19);

  doc.setFontSize(9);
  doc.setTextColor(22, 163, 74); // Verde exitoso
  doc.text(`✓ ${status}`, pageWidth - 22, currentY + 15, { align: "right" });

  currentY += 34;

  // Helper para dibujar tablas de dos columnas
  const drawSection = (title, items) => {
    // Encabezado de sección
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(0, 86, 210);
    doc.text(title, 15, currentY);

    // Línea separadora
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.line(15, currentY + 2, pageWidth - 15, currentY + 2);

    currentY += 8;

    items.forEach(([label, value]) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(label, 15, currentY);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text(String(value || "---"), 75, currentY);

      currentY += 6.5;
    });

    currentY += 4;
  };

  // ─── SECCIÓN 1: DATOS DE LA CUENTA ORIGEN (DE QUÉ CUENTA) ───
  drawSection("DATOS DE LA CUENTA DE ORIGEN (EMISOR)", [
    ["Titular:", origin.name || "---"],
    ["Nº de Cuenta:", origin.accountNumber ? `Cuenta #${origin.accountId} (${origin.accountNumber})` : `Cuenta #${origin.accountId || "---"}`],
    ["Email:", origin.email || "---"],
    ["CVU:", origin.cvu || "---"],
    ["Alias:", origin.alias || "---"],
    ["Entidad / Banco:", origin.bank || "DigitalArs Billetera Virtual"],
  ]);

  // ─── SECCIÓN 2: DATOS DE LA CUENTA DESTINO (A QUIÉN / A QUÉ CUENTA) ───
  drawSection("DATOS DE LA CUENTA DE DESTINO (RECEPTOR)", [
    ["A quién (Titular):", destination.name || "---"],
    ["Nº de Cuenta:", destination.accountNumber ? `Cuenta #${destination.accountId} (${destination.accountNumber})` : `Cuenta #${destination.accountId || "---"}`],
    ["Email:", destination.email || "---"],
    ["CVU:", destination.cvu || "---"],
    ["Alias:", destination.alias || "---"],
    ["Entidad / Banco:", destination.bank || "DigitalArs Billetera Virtual"],
  ]);

  // ─── SECCIÓN 3: DETALLE DE LA OPERACIÓN ───
  drawSection("DETALLES DE LA OPERACIÓN", [
    ["Motivo / Concepto:", motive || "Varios"],
    ["Comisión:", "Gratis ($ 0,00)"],
    ["Total debitado:", formatCurrency(amount)],
    ["Canal:", "DigitalArs Web Banking"],
    ["Estado:", status],
  ]);

  // ─── PIE DE PÁGINA ───
  const footerY = 282;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(15, footerY - 5, pageWidth - 15, footerY - 5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184); // #94A3B8
  doc.text(
    "Este comprobante es un documento digital válido de la transferencia efectuada por DigitalArs S.A.",
    pageWidth / 2,
    footerY,
    { align: "center" }
  );
  doc.text(
    "DigitalArs Billetera Virtual · Sujeto a la regulación del Banco Central de la República Argentina (BCRA).",
    pageWidth / 2,
    footerY + 4,
    { align: "center" }
  );

  // Guardar archivo
  const cleanId = String(operationId).replace(/[^a-zA-Z0-9_-]/g, "");
  doc.save(`Comprobante_Transferencia_${cleanId || "DigitalArs"}.pdf`);
}
