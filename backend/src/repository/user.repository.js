'use strict';

const db = require('../config/database');

async function findByEmail(email) {
  const result = await db.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0];
}

async function findById(id) {
  const result = await db.query(
    'SELECT * FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0];
}

async function create({ email, password, name }) {
  const result = await db.query(
    'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING *',
    [email, password, name]
  );
  return result.rows[0];
}

async function update(id, fields) {
  const setClauses = [];
  const values = [];
  let idx = 1;

  if (fields.name !== undefined) {
    setClauses.push(`name = $${idx++}`);
    values.push(fields.name);
  }
  if (fields.password !== undefined) {
    setClauses.push(`password = $${idx++}`);
    values.push(fields.password);
  }

  if (setClauses.length === 0) return findById(id);

  setClauses.push(`updated_at = NOW()`);
  values.push(id);

  const result = await db.query(
    `UPDATE users SET ${setClauses.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  );
  return result.rows[0];
}

module.exports = { findByEmail, findById, create, update };
