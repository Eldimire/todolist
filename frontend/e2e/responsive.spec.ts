import { test, expect } from '@playwright/test';

test.describe('반응형 레이아웃', () => {
  test.describe('모바일 (375px)', () => {
    test.use({ viewport: { width: 375, height: 812 } });

    test('로그인 페이지가 375px에서 정상 렌더링된다', async ({ page }) => {
      await page.goto('/login');
      await expect(page.getByRole('button', { name: '로그인' })).toBeVisible();
    });

    test('회원가입 페이지가 375px에서 정상 렌더링된다', async ({ page }) => {
      await page.goto('/signup');
      await expect(page.getByRole('button', { name: '가입하기' })).toBeVisible();
    });

    test('404 페이지가 375px에서 정상 렌더링된다', async ({ page }) => {
      await page.goto('/nonexistent');
      await expect(page.getByText('404')).toBeVisible();
    });

    test('로그인 페이지에서 수평 스크롤이 발생하지 않는다', async ({ page }) => {
      await page.goto('/login');
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
    });
  });

  test.describe('태블릿 (768px)', () => {
    test.use({ viewport: { width: 768, height: 1024 } });

    test('로그인 페이지가 768px에서 정상 렌더링된다', async ({ page }) => {
      await page.goto('/login');
      await expect(page.getByRole('button', { name: '로그인' })).toBeVisible();
    });

    test('회원가입 페이지가 768px에서 정상 렌더링된다', async ({ page }) => {
      await page.goto('/signup');
      await expect(page.getByRole('button', { name: '가입하기' })).toBeVisible();
    });
  });

  test.describe('데스크톱 (1280px)', () => {
    test.use({ viewport: { width: 1280, height: 900 } });

    test('로그인 페이지가 1280px에서 정상 렌더링된다', async ({ page }) => {
      await page.goto('/login');
      await expect(page.getByRole('button', { name: '로그인' })).toBeVisible();
    });

    test('회원가입 페이지가 1280px에서 정상 렌더링된다', async ({ page }) => {
      await page.goto('/signup');
      await expect(page.getByRole('button', { name: '가입하기' })).toBeVisible();
    });
  });

  test.describe('Header 반응형 — 로그인 필요', () => {
    const RESP_EMAIL = `resp_${Date.now()}@test.com`;
    let token = '';

    test.beforeAll(async ({ browser }) => {
      const ctx = await browser.newContext();
      const page = await ctx.newPage();
      // 회원가입
      await page.goto('/signup');
      await page.locator('#signup-name').fill('반응형 테스터');
      await page.locator('#signup-email').fill(RESP_EMAIL);
      await page.locator('#signup-password').fill('password123');
      await page.locator('#signup-confirm-password').fill('password123');
      await page.getByRole('button', { name: '가입하기' }).click();
      await page.waitForURL('**/login');
      // 로그인
      await page.locator('#login-email').fill(RESP_EMAIL);
      await page.locator('#login-password').fill('password123');
      await page.getByRole('button', { name: '로그인' }).click();
      await page.waitForURL('/');
      token = await page.evaluate(() => localStorage.getItem('token') ?? '');
      await ctx.close();
    });

    test('모바일(375px)에서 햄버거 메뉴 버튼이 표시된다', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto('/login');
      await page.evaluate((t) => localStorage.setItem('token', t), token);
      await page.goto('/');
      await page.waitForURL('/');

      await expect(page.getByRole('button', { name: '메뉴 열기' })).toBeVisible();
      await expect(page.getByRole('link', { name: '내 정보 수정' })).not.toBeVisible();
    });

    test('모바일(375px)에서 햄버거 버튼 클릭 시 드로어가 열린다', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto('/login');
      await page.evaluate((t) => localStorage.setItem('token', t), token);
      await page.goto('/');
      await page.waitForURL('/');

      await page.getByRole('button', { name: '메뉴 열기' }).click();
      await expect(page.getByText('메뉴')).toBeVisible();
      await expect(page.getByRole('button', { name: '메뉴 닫기' })).toBeVisible();
    });

    test('데스크톱(1280px)에서 nav가 표시된다', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 900 });
      await page.goto('/login');
      await page.evaluate((t) => localStorage.setItem('token', t), token);
      await page.goto('/');
      await page.waitForURL('/');

      await expect(page.getByRole('link', { name: '내 정보 수정' })).toBeVisible();
      await expect(page.getByRole('button', { name: '로그아웃' })).toBeVisible();
    });
  });
});
