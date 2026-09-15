/** Group a decimal string without rounding, coercing precision, or losing trailing zeros. */
export function formatDecimal(value: string): string {
  if (!/^[+-]?\d+(?:\.\d+)?$/.test(value)) throw new Error("Invalid display decimal");
  const [integer = "", fraction] = value.split(".");
  return integer.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + (fraction === undefined ? "" : `.${fraction}`);
}
export function won(value: string): string { return `₩ ${formatDecimal(value)}`; }
export function percent(value: string): string { return `${formatDecimal(value)}%`; }
