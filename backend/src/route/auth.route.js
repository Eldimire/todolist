'use strict';

const { Router } = require('express');
const authController = require('../controller/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/logout', authMiddleware, authController.logout);

module.exports = router;
