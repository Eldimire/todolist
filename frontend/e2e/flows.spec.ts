import { test, expect, type Browser } from '@playwright/test';
import { signUp, login, setToken, getDate } from './helpers';

const TIMESTAMP = Date.now();
const TEST_EMAIL = `e2e_${TIMESTAMP}@test.com`;
const TEST_NAME = 'E2E 테스터';
const TEST_PASSWORD = 'password123';

let authToken = '';

async function getAuthToken(browser: Browser): Promise<string> {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await signUp(page, TEST_EMAIL, TEST_NAME, TEST_PASSWORD);
  await login(page, TEST_EMAIL, TEST_PASSWORD);
  const token = await page.evaluate(() => localStorage.getItem('token') ?? '');
  await ctx.close();
  return token;
}

test.describe.serial('US 통합 흐름', () => {
  test.beforeAll(async ({ browser }) => {
    authToken = await getAuthToken(browser);
  });

  test.beforeEach(async ({ page }) => {
    page.on('dialog', (dialog) => dialog.accept());
    await setToken(page, authToken);
  });

  test('US-01 | 할일 등록 후 목록에 표시된다', async ({ page }) => {
    await page.getByRole('button', { name: '+ 할일 추가' }).click();
    await page.waitForURL('**/todos/new');

    await page.locator('#title').fill('E2E 테스트 할일');
    await page.locator('#startDate').fill(getDate(0));
    await page.locator('#endDate').fill(getDate(1));
    await page.getByRole('button', { name: '저장하기' }).click();

    await page.waitForURL('/');
    await expect(page.getByText('E2E 테스트 할일')).toBeVisible();
  });

  test('US-02 | 카테고리 생성 후 할일 분류 및 카테고리 필터 조회', async ({ page }) => {
    await page.goto('/profile');
    await page.getByLabel('새 카테고리 이름').fill('E2E 카테고리');
    await page.getByRole('button', { name: '추가' }).click();
    await expect(page.getByText('E2E 카테고리')).toBeVisible();

    await page.goto('/todos/new');
    await page.locator('#title').fill('카테고리 분류 할일');
    await page.locator('#startDate').fill(getDate(0));
    await page.locator('#endDate').fill(getDate(1));
    await page.locator('#categoryId').selectOption({ label: 'E2E 카테고리' });
    await page.getByRole('button', { name: '저장하기' }).click();

    await page.waitForURL('/');
    await page.getByRole('button', { name: '카테고리' }).click();
    await page.locator('select[aria-label="카테고리 선택"]').selectOption({ label: 'E2E 카테고리' });
    await expect(page.getByText('카테고리 분류 할일')).toBeVisible();
  });

  test('US-03 | 진행 중 할일을 완료 처리하면 진행 중 목록에서 사라진다', async ({ page }) => {
    await page.goto('/todos/new');
    await page.locator('#title').fill('완료 처리 할일');
    await page.locator('#startDate').fill(getDate(0));
    await page.locator('#endDate').fill(getDate(0));
    await page.getByRole('button', { name: '저장하기' }).click();
    await page.waitForURL('/');

    await page.getByRole('button', { name: '진행 중' }).click();
    await expect(page.getByText('완료 처리 할일')).toBeVisible();

    await page
      .locator('div')
      .filter({ hasText: '완료 처리 할일' })
      .locator('input[type="checkbox"]')
      .first()
      .click();

    await expect(page.getByText('완료 처리 할일')).toBeHidden({ timeout: 8000 });

    await page.getByRole('button', { name: '완료' }).click();
    await expect(page.getByText('완료 처리 할일')).toBeVisible();
  });

  test('US-04 | 기한 초과 할일을 수정하면 기한 초과 목록에서 사라진다', async ({ page }) => {
    // 생성 응답에서 ID를 가져오기 위해 미리 등록
    const createPromise = page.waitForResponse(
      (resp) => /\/api\/todos$/.test(new URL(resp.url()).pathname) && resp.request().method() === 'POST',
      { timeout: 10000 }
    );

    await page.goto('/todos/new');
    await page.locator('#title').fill('기한 초과 할일');
    await page.locator('#startDate').fill(getDate(-3));
    await page.locator('#endDate').fill(getDate(-1));
    await page.getByRole('button', { name: '저장하기' }).click();

    const createResp = await createPromise;
    const { todo: createdTodo } = await createResp.json();
    await page.waitForURL('/');

    // 기한 초과 탭에서 할일 확인
    await page.getByRole('button', { name: '기한 초과' }).click();
    await expect(page.getByText('기한 초과 할일')).toBeVisible();

    // 직접 수정 페이지로 이동
    // ※ GET /api/todos/:id 백엔드 미구현으로 기존 데이터 로드 불가 → 직접 입력
    await page.goto(`/todos/${createdTodo.id}/edit`);
    await expect(page.locator('h1')).toHaveText('할일 수정', { timeout: 10000 });

    await page.locator('#title').fill('기한 초과 할일');
    await page.locator('#startDate').fill(getDate(-3));
    await page.locator('#endDate').fill(getDate(5));

    const updatePromise = page.waitForResponse(
      (resp) => resp.url().includes(`/api/todos/${createdTodo.id}`) && resp.request().method() === 'PATCH',
      { timeout: 10000 }
    );
    await page.getByRole('button', { name: '저장하기' }).click();
    await updatePromise;
    await page.waitForURL('/');

    await page.getByRole('button', { name: '기한 초과' }).click();
    await expect(page.getByText('기한 초과 할일')).toBeHidden({ timeout: 8000 });
  });

  test('US-04 | 할일 삭제 후 목록에서 사라진다', async ({ page }) => {
    await page.goto('/todos/new');
    await page.locator('#title').fill('삭제 대상 할일');
    await page.locator('#startDate').fill(getDate(0));
    await page.locator('#endDate').fill(getDate(1));
    await page.getByRole('button', { name: '저장하기' }).click();
    await page.waitForURL('/');

    await expect(page.getByText('삭제 대상 할일')).toBeVisible();
    await page
      .locator('div')
      .filter({ hasText: '삭제 대상 할일' })
      .getByRole('button', { name: '삭제' })
      .first()
      .click();

    await expect(page.getByText('삭제 대상 할일')).toBeHidden({ timeout: 8000 });
  });

  test('US-05 | 전체 및 상태별 필터 탭이 에러 없이 렌더링된다', async ({ page }) => {
    const tabs = ['전체', '시작 전', '진행 중', '완료', '기한 초과'];
    for (const tab of tabs) {
      await page.getByRole('button', { name: tab }).click();
      await expect(page.locator('body')).not.toContainText('오류가 발생했습니다');
    }
  });

  test('US-06 | 내 정보 수정 후 로그아웃하면 로그인 페이지로 이동한다', async ({ page }) => {
    await page.goto('/profile');
    await page.locator('#name').fill('수정된 E2E 테스터');
    await page.getByRole('button', { name: '저장하기' }).click();
    await page.waitForURL('/');

    await page.goto('/profile');
    await page.locator('main').getByRole('button', { name: '로그아웃' }).click();
    await expect(page).toHaveURL(/.*login/, { timeout: 8000 });

    await page.goto('/');
    await expect(page).toHaveURL(/.*login/);
  });
});
