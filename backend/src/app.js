'use strict';

const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

// 헬스체크
app.get('/', (_req, res) => {
  res.status(200).json({ status: 'ok', message: 'TodoList API' });
});

// 404 핸들러
app.use((_req, res) => {
  res.status(404).json({ code: 'NOT_FOUND', message: '요청한 경로를 찾을 수 없습니다.' });
});

module.exports = app;
