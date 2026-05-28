const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'todolist',
  user: 'todolist',
  password: 'todolist',
});

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 기존 데이터 초기화
    await client.query('DELETE FROM todos');
    await client.query('DELETE FROM categories');
    await client.query('DELETE FROM users');

    // 테스트 사용자 생성
    const passwordHash = await bcrypt.hash('password123', 10);
    const userResult = await client.query(
      `INSERT INTO users (email, password, name)
       VALUES ($1, $2, $3)
       RETURNING id`,
      ['test@example.com', passwordHash, '테스트 사용자']
    );
    const userId = userResult.rows[0].id;

    // 기본 카테고리 생성
    const defaultCatResult = await client.query(
      `INSERT INTO categories (user_id, name, is_default)
       VALUES ($1, $2, true)
       RETURNING id`,
      [userId, '기본']
    );
    const defaultCategoryId = defaultCatResult.rows[0].id;

    // 일반 카테고리 생성
    const workCatResult = await client.query(
      `INSERT INTO categories (user_id, name, is_default)
       VALUES ($1, $2, false)
       RETURNING id`,
      [userId, '업무']
    );
    const workCategoryId = workCatResult.rows[0].id;

    // 시작 전 할일 (start_date > 오늘 KST)
    await client.query(
      `INSERT INTO todos (user_id, category_id, title, description, start_date, end_date, is_completed)
       VALUES ($1, $2, $3, $4, $5, $6, false)`,
      [userId, defaultCategoryId, '시작 전 할일', '아직 시작하지 않은 할일', '2026-06-01', '2026-06-07']
    );

    // 진행 중 할일 (start_date <= 오늘 <= end_date, is_completed = false)
    await client.query(
      `INSERT INTO todos (user_id, category_id, title, description, start_date, end_date, is_completed)
       VALUES ($1, $2, $3, $4, $5, $6, false)`,
      [userId, workCategoryId, '진행 중 할일', '현재 진행 중인 할일', '2026-05-25', '2026-06-03']
    );

    // 완료된 할일 (is_completed = true)
    await client.query(
      `INSERT INTO todos (user_id, category_id, title, description, start_date, end_date, is_completed)
       VALUES ($1, $2, $3, $4, $5, $6, true)`,
      [userId, defaultCategoryId, '완료된 할일', '이미 완료한 할일', '2026-05-20', '2026-05-27']
    );

    // 기한 초과 할일 (end_date < 오늘 KST, is_completed = false)
    await client.query(
      `INSERT INTO todos (user_id, category_id, title, description, start_date, end_date, is_completed)
       VALUES ($1, $2, $3, $4, $5, $6, false)`,
      [userId, workCategoryId, '기한 초과 할일', '기한이 지난 할일', '2026-05-15', '2026-05-22']
    );

    await client.query('COMMIT');

    console.log('✅ 시드 데이터 삽입 완료');
    console.log(`   - 사용자: test@example.com / password123`);
    console.log(`   - 카테고리: 기본(default), 업무`);
    console.log(`   - 할일: 시작 전, 진행 중, 완료, 기한 초과`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ 시드 데이터 삽입 실패:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
