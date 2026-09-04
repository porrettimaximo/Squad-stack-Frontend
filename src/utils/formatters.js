/**
 * Utilidades de formateo centralizadas (moneda, fecha, número de cuenta).
 * Evita instanciar Intl.NumberFormat repetidamente en múltiples componentes.
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
 * Formatea una fecha o string ISO a formato amigable de historial ("Hoy 14:30 · INGRESO").
 * @param {Date|string} date
 * @returns {string}
 */
export function formatTransactionDate(date) {
  if (!date) return "Reciente";
  const d = new Date(date);
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
