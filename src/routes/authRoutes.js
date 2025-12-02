const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');

// Rotas de Autenticação
router.post('/login', AuthController.login);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password/:token', AuthController.resetPassword);

module.exports = router;