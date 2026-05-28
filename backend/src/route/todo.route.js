'use strict';

const { Router } = require('express');
const todoController = require('../controller/todo.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = Router();

router.use(authMiddleware);

router.get('/', todoController.getTodos);
router.post('/', todoController.createTodo);
router.patch('/:id/complete', todoController.toggleComplete);
router.patch('/:id', todoController.updateTodo);
router.delete('/:id', todoController.deleteTodo);

module.exports = router;
