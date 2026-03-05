export function getTodayStr(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDayNumber(startDateStr: string, targetDateStr: string): number {
  const start = new Date(startDateStr);
  const target = new Date(targetDateStr);
  start.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - start.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

export function getDateFromDayNumber(startDateStr: string, dayNumber: number): string {
  const date = new Date(startDateStr);
  date.setDate(date.getDate() + dayNumber - 1);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
