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
  isDeposit = false,
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
  doc.text(
    isDeposit
      ? "Comprobante Oficial de Depósito de Fondos"
      : "Comprobante Oficial de Transferencia",
    15,
    31
  );

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
  doc.text(isDeposit ? "MONTO DEPOSITADO" : "MONTO TRANSFERIDO", 22, currentY + 9);

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

  // ─── SECCIÓN 1: DATOS DE LA CUENTA ORIGEN (EMISOR) ───
  const originSectionTitle = isDeposit
    ? "DATOS DE ORIGEN (MEDIO DE INGRESO / EMISOR)"
    : "DATOS DE LA CUENTA DE ORIGEN (EMISOR)";

  drawSection(originSectionTitle, [
    ["Titular:", origin.name || "---"],
    [
      "Nº de Cuenta / Origen:",
      origin.accountNumber
        ? `${origin.accountId ? `Cuenta #${origin.accountId} ` : ""}(${origin.accountNumber})`
        : origin.accountId ? `Cuenta #${origin.accountId}` : "---",
    ],
    ["Email:", origin.email || "---"],
    ["CVU / CBU:", origin.cvu || "---"],
    ["Alias:", origin.alias || "---"],
    ["Entidad / Medio:", origin.bank || "DigitalArs Billetera Virtual"],
  ]);

  // ─── SECCIÓN 2: DATOS DE LA CUENTA DESTINO (RECEPTOR) ───
  const destinationSectionTitle = isDeposit
    ? "DATOS DE DESTINO (CUENTA DIGITALARS / RECEPTOR)"
    : "DATOS DE LA CUENTA DE DESTINO (RECEPTOR)";

  drawSection(destinationSectionTitle, [
    ["Titular Receptor:", destination.name || "---"],
    [
      "Nº de Cuenta:",
      destination.accountNumber
        ? `Cuenta #${destination.accountId} (${destination.accountNumber})`
        : `Cuenta #${destination.accountId || "---"}`,
    ],
    ["Email:", destination.email || "---"],
    ["CVU:", destination.cvu || "---"],
    ["Alias:", destination.alias || "---"],
    ["Entidad / Banco:", destination.bank || "DigitalArs Billetera Virtual"],
  ]);

  // ─── SECCIÓN 3: DETALLE DE LA OPERACIÓN ───
  drawSection("DETALLES DE LA OPERACIÓN", [
    ["Motivo / Concepto:", motive || "Varios"],
    ["Comisión:", "Gratis ($ 0,00)"],
    [isDeposit ? "Total acreditado:" : "Total debitado:", formatCurrency(amount)],
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
    `Este comprobante es un documento digital válido de la operación efectuada por DigitalArs S.A.`,
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
  const prefix = isDeposit ? "Comprobante_Deposito" : "Comprobante_Transferencia";
  doc.save(`${prefix}_${cleanId || "DigitalArs"}.pdf`);
}

/**
 * Genera y descarga el comprobante oficial en PDF para un Pago de Servicios.
 */
export function downloadServicePaymentReceiptPdf({
  receiptNumber,
  providerName,
  categoryName,
  referenceNumber,
  amount,
  paymentDate,
  payerName,
  sourceLabel = "Cuenta Corriente DigitalArs",
}) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // ─── CABECERA / BANNER CORPORATIVO ───
  doc.setFillColor(0, 86, 210); // Azul DigitalArs (#0056D2)
  doc.rect(0, 0, pageWidth, 40, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text("DigitalArs", 15, 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Billetera Virtual & Servicios Financieros", 15, 25);
  doc.text("Comprobante Oficial de Pago de Servicios", 15, 31);

  // Fecha y Nro de Operación a la derecha
  doc.setFontSize(9);
  doc.text(`Fecha: ${paymentDate || new Date().toLocaleString("es-AR")}`, pageWidth - 15, 20, { align: "right" });
  doc.text(`Comprobante: ${receiptNumber || "REC-SERV"}`, pageWidth - 15, 27, { align: "right" });

  let currentY = 50;

  // ─── MONTO DESTACADO ───
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(15, currentY, pageWidth - 30, 24, 3, 3, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text("MONTO ABONADO", 22, currentY + 9);

  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  doc.text(formatCurrency(amount), 22, currentY + 18);

  // Badge de Estado
  doc.setFillColor(220, 252, 231);
  doc.roundedRect(pageWidth - 62, currentY + 7, 47, 10, 2, 2, "F");
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(22, 101, 52);
  doc.text("Pago Exitoso", pageWidth - 38, currentY + 13.5, { align: "center" });

  currentY += 34;

  const drawSection = (title, items) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(0, 86, 210);
    doc.text(title, 15, currentY);

    currentY += 3;
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.line(15, currentY, pageWidth - 15, currentY);

    currentY += 6;
    doc.setFontSize(9.5);

    items.forEach(([label, value]) => {
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text(label, 17, currentY);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text(String(value || "---"), 85, currentY);

      currentY += 6.5;
    });

    currentY += 4;
  };

  // ─── DATOS DEL SERVICIO ───
  drawSection("DETALLE DEL SERVICIO ABONADO", [
    ["Empresa / Ente:", providerName || "Servicio"],
    ["Rubro / Categoría:", categoryName || "Servicios Generales"],
    ["Nº Cliente / Referencia:", referenceNumber || "---"],
    ["Medio / Canal:", "DigitalArs Web Banking"],
    ["Estado:", "Aprobado / Procesado"],
  ]);

  // ─── DATOS DEL PAGADOR / ORIGEN ───
  drawSection("DATOS DEL TITULAR Y ORIGEN DE LOS FONDOS", [
    ["Titular:", payerName || "Cliente DigitalArs"],
    ["Origen de los Fondos:", sourceLabel],
    ["Moneda:", "Pesos Argentinos (ARS)"],
    ["Comisión por Pago:", "Gratis ($ 0,00)"],
    ["Nº de Transacción Oficial:", receiptNumber || "---"],
  ]);

  // ─── PIE DE PÁGINA ───
  const footerY = 282;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(15, footerY - 5, pageWidth - 15, footerY - 5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    "Este comprobante es un documento digital válido de pago de servicios emitido por DigitalArs S.A.",
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

  const cleanId = String(receiptNumber).replace(/[^a-zA-Z0-9_-]/g, "");
  doc.save(`Comprobante_Servicio_${cleanId || "DigitalArs"}.pdf`);
}
