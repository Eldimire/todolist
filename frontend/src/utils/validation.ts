export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPassword(password: string): boolean {
  return password.length >= 8;
}

export function isValidDateRange(startDate: string, endDate: string): boolean {
  return endDate >= startDate;
}

export function isNotEmpty(value: string): boolean {
  return value.trim().length > 0;
}

export function isWithinMaxLength(value: string, maxLength: number): boolean {
  return value.length <= maxLength;
}
