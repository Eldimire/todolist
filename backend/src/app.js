'use strict';

const express = require('express');
const cors = require('cors');
const authRouter = require('./route/auth.route');
const userRouter = require('./route/user.route');
const categoryRouter = require('./route/category.route');
const handleError = require('./middleware/errorHandler.middleware');

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

// 헬스체크
app.get('/', (_req, res) => {
  res.status(200).json({ status: 'ok', message: 'TodoList API' });
});

// 라우터 등록
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/categories', categoryRouter);

// 404 핸들러
app.use((_req, res) => {
  res.status(404).json({ code: 'NOT_FOUND', message: '요청한 경로를 찾을 수 없습니다.' });
});

// 에러 핸들러 (마지막)
app.use(handleError);

module.exports = app;
