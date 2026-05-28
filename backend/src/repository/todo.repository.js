'use strict';

const db = require('../config/database');

async function create({ userId, categoryId, title, description, startDate, endDate }) {
  const result = await db.query(
    'INSERT INTO todos (user_id, category_id, title, description, start_date, end_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [userId, categoryId, title, description, startDate, endDate]
  );
  return result.rows[0];
}

async function findById(id) {
  const result = await db.query(
    'SELECT * FROM todos WHERE id = $1',
    [id]
  );
  return result.rows[0];
}

async function findByUserId(userId) {
  const result = await db.query(
    'SELECT * FROM todos WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return result.rows;
}

async function findByUserIdAndCategory(userId, categoryId) {
  const result = await db.query(
    'SELECT * FROM todos WHERE user_id = $1 AND category_id = $2 ORDER BY created_at DESC',
    [userId, categoryId]
  );
  return result.rows;
}

async function findByUserIdAndStatus(userId, status) {
  let result;

  if (status === 'not_started') {
    result = await db.query(
      "SELECT * FROM todos WHERE user_id = $1 AND is_completed = false AND start_date > (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Seoul')::date ORDER BY start_date ASC",
      [userId]
    );
  } else if (status === 'in_progress') {
    result = await db.query(
      "SELECT * FROM todos WHERE user_id = $1 AND is_completed = false AND start_date <= (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Seoul')::date AND end_date >= (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Seoul')::date ORDER BY end_date ASC",
      [userId]
    );
  } else if (status === 'completed') {
    result = await db.query(
      'SELECT * FROM todos WHERE user_id = $1 AND is_completed = true ORDER BY updated_at DESC',
      [userId]
    );
  } else if (status === 'overdue') {
    result = await db.query(
      "SELECT * FROM todos WHERE user_id = $1 AND is_completed = false AND end_date < (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Seoul')::date ORDER BY end_date ASC",
      [userId]
    );
  } else {
    return [];
  }

  return result.rows;
}

async function update(id, fields) {
  const setClauses = [];
  const values = [];
  let idx = 1;

  if (fields.title !== undefined) {
    setClauses.push(`title = $${idx++}`);
    values.push(fields.title);
  }
  if (fields.description !== undefined) {
    setClauses.push(`description = $${idx++}`);
    values.push(fields.description);
  }
  if (fields.categoryId !== undefined) {
    setClauses.push(`category_id = $${idx++}`);
    values.push(fields.categoryId);
  }
  if (fields.startDate !== undefined) {
    setClauses.push(`start_date = $${idx++}`);
    values.push(fields.startDate);
  }
  if (fields.endDate !== undefined) {
    setClauses.push(`end_date = $${idx++}`);
    values.push(fields.endDate);
  }
  if (fields.isCompleted !== undefined) {
    setClauses.push(`is_completed = $${idx++}`);
    values.push(fields.isCompleted);
  }

  if (setClauses.length === 0) return findById(id);

  setClauses.push(`updated_at = NOW()`);
  values.push(id);

  const result = await db.query(
    `UPDATE todos SET ${setClauses.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  );
  return result.rows[0];
}

async function updateCategory(todoId, categoryId) {
  const result = await db.query(
    'UPDATE todos SET category_id = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
    [categoryId, todoId]
  );
  return result.rows[0];
}

async function deleteById(id) {
  await db.query(
    'DELETE FROM todos WHERE id = $1',
    [id]
  );
}

module.exports = {
  create,
  findById,
  findByUserId,
  findByUserIdAndCategory,
  findByUserIdAndStatus,
  update,
  updateCategory,
  deleteById,
};
