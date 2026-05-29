import { test, expect } from '@playwright/test';

test.describe('인증 보호', () => {
  test('미인증 상태에서 / 접근 시 /login 으로 리다이렉트된다', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/.*login/);
  });

  test('미인증 상태에서 /todos/new 접근 시 /login 으로 리다이렉트된다', async ({ page }) => {
    await page.goto('/todos/new');
    await expect(page).toHaveURL(/.*login/);
  });

  test('미인증 상태에서 /profile 접근 시 /login 으로 리다이렉트된다', async ({ page }) => {
    await page.goto('/profile');
    await expect(page).toHaveURL(/.*login/);
  });

  test('존재하지 않는 경로 접근 시 404 페이지를 렌더링한다', async ({ page }) => {
    await page.goto('/nonexistent-path');
    await expect(page.getByText('404')).toBeVisible();
    await expect(page.getByText('페이지를 찾을 수 없습니다')).toBeVisible();
    await expect(page.getByRole('link', { name: '홈으로 가기' })).toBeVisible();
  });

  test('로그인 페이지에서 회원가입 링크로 이동할 수 있다', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('link', { name: '회원가입' }).click();
    await expect(page).toHaveURL(/.*signup/);
  });

  test('회원가입 페이지에서 로그인 링크로 이동할 수 있다', async ({ page }) => {
    await page.goto('/signup');
    await page.getByRole('link', { name: '로그인' }).click();
    await expect(page).toHaveURL(/.*login/);
  });
});
