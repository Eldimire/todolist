import { type Page } from '@playwright/test';

export function getDate(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

export async function signUp(page: Page, email: string, name: string, password: string) {
  await page.goto('/signup');
  await page.locator('#signup-name').fill(name);
  await page.locator('#signup-email').fill(email);
  await page.locator('#signup-password').fill(password);
  await page.locator('#signup-confirm-password').fill(password);
  await page.getByRole('button', { name: '가입하기' }).click();
  await page.waitForURL('**/login');
}

export async function login(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.locator('#login-email').fill(email);
  await page.locator('#login-password').fill(password);
  await page.getByRole('button', { name: '로그인' }).click();
  await page.waitForURL('/');
}

export async function setToken(page: Page, token: string) {
  await page.goto('/login');
  await page.evaluate((t) => localStorage.setItem('token', t), token);
  await page.goto('/');
  await page.waitForURL('/');
}
