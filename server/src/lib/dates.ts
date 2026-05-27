export function toDisplayDate(d: Date): string {
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${day}-${month}-${d.getFullYear()}`;
}

// Accepts "DD-MM-YYYY" or an ISO string; returns null if unparseable.
export function parseDueDate(input: string): Date | null {
  const ddmmyyyy = /^(\d{2})-(\d{2})-(\d{4})$/.exec(input);
  if (ddmmyyyy) {
    const [, dd, mm, yyyy] = ddmmyyyy;
    const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    return Number.isNaN(date.getTime()) ? null : date;
  }
  const date = new Date(input);
  return Number.isNaN(date.getTime()) ? null : date;
}
