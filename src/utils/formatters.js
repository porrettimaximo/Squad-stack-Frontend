/**
 * Utilidades de formateo centralizadas (moneda, fecha, porcentaje, CVU y número de cuenta).
 * Garantiza consistencia en toda la aplicación (HU-30).
 */

const currencyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat("es-AR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Formatea un monto numérico a formato moneda argentina ($ 45.230,50).
 * @param {number|string} amount
 * @param {boolean} includeSymbol - Si debe incluir el símbolo '$ '
 * @returns {string}
 */
export function formatCurrency(amount, includeSymbol = true) {
  const num = typeof amount === "number" ? amount : Number(amount) || 0;
  if (includeSymbol) {
    return currencyFormatter.format(num);
  }
  return numberFormatter.format(num);
}

/**
 * Formatea un porcentaje numérico (ej: 25 -> "25,00 %").
 * @param {number|string} value
 * @param {number} decimals
 * @returns {string}
 */
export function formatPercentage(value, decimals = 2) {
  const num = typeof value === "number" ? value : Number(value) || 0;
  return `${num.toLocaleString("es-AR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })} %`;
}

/**
 * Formatea una fecha o string ISO a formato legible "DD/MM/YYYY".
 * @param {Date|string} date
 * @returns {string}
 */
export function formatDate(date) {
  if (!date) return "-";
  const dateStr = (typeof date === "string" && date.includes("T") && !date.endsWith("Z") && !date.includes("+") && !date.includes("-", 10))
    ? `${date}Z`
    : date;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Formatea una fecha o string ISO a formato completo "DD/MM/YYYY HH:mm".
 * @param {Date|string} date
 * @returns {string}
 */
export function formatDateTime(date) {
  if (!date) return "-";
  const dateStr = (typeof date === "string" && date.includes("T") && !date.endsWith("Z") && !date.includes("+") && !date.includes("-", 10))
    ? `${date}Z`
    : date;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Formatea una fecha o string ISO a formato amigable de historial ("Hoy 14:30", "Ayer 10:15" o "15 abr 14:30").
 * @param {Date|string} date
 * @returns {string}
 */
export function formatTransactionDate(date) {
  if (!date) return "Reciente";
  const dateStr = (typeof date === "string" && date.includes("T") && !date.endsWith("Z") && !date.includes("+") && !date.includes("-", 10))
    ? `${date}Z`
    : date;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "Reciente";

  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const timeStr = d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });

  if (isToday) {
    return `Hoy ${timeStr}`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) {
    return `Ayer ${timeStr}`;
  }

  return d.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Formatea un CVU en grupos de 4 dígitos para fácil lectura visual.
 * @param {string} cvu
 * @returns {string}
 */
export function formatCvu(cvu) {
  if (!cvu) return "0000 0000 0000 0000 0000 00";
  const clean = String(cvu).replace(/\D/g, "");
  return clean.replace(/(\d{4})/g, "$1 ").trim();
}

