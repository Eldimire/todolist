'use strict';

const { Router } = require('express');
const authController = require('../controller/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = Router();

router.patch('/me/language', authMiddleware, authController.updateLanguage);
router.patch('/me/theme', authMiddleware, authController.updateTheme);
router.patch('/me', authMiddleware, authController.updateProfile);

module.exports = router;
