'use strict';

const db = require('../config/database');

async function create({ userId, name, isDefault }) {
  const result = await db.query(
    'INSERT INTO categories (user_id, name, is_default) VALUES ($1, $2, $3) RETURNING *',
    [userId, name, isDefault]
  );
  return result.rows[0];
}

async function findById(id) {
  const result = await db.query(
    'SELECT * FROM categories WHERE id = $1',
    [id]
  );
  return result.rows[0];
}

async function findByUserId(userId) {
  const result = await db.query(
    'SELECT * FROM categories WHERE user_id = $1 ORDER BY is_default DESC, created_at ASC',
    [userId]
  );
  return result.rows;
}

async function findDefaultByUserId(userId) {
  const result = await db.query(
    'SELECT * FROM categories WHERE user_id = $1 AND is_default = true',
    [userId]
  );
  return result.rows[0];
}

async function update(id, { name }) {
  const result = await db.query(
    'UPDATE categories SET name = $1 WHERE id = $2 RETURNING *',
    [name, id]
  );
  return result.rows[0];
}

async function deleteById(id) {
  await db.query(
    'DELETE FROM categories WHERE id = $1',
    [id]
  );
}

module.exports = { create, findById, findByUserId, findDefaultByUserId, update, deleteById };
