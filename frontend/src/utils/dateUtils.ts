export function isoToDateInput(isoStr: string): string {
  if (!isoStr) return '';
  return isoStr.split('T')[0];
}

export function getTodayKST(): string {
  const now = new Date();
  const kstOffset = 9 * 60;
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  const kstMs = utcMs + kstOffset * 60000;
  const kstDate = new Date(kstMs);
  const year = kstDate.getFullYear();
  const month = String(kstDate.getMonth() + 1).padStart(2, '0');
  const day = String(kstDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${year}.${month}.${day}`;
}

export function isDateBeforeToday(dateStr: string): boolean {
  return dateStr < getTodayKST();
}

export function isDateAfterToday(dateStr: string): boolean {
  return dateStr > getTodayKST();
}
