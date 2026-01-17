import express from 'express';
import { signUp, login, forgotPassword, resetPassword } from '../controllers/authController';
import { createAuthLimitter, createPasswordResetLimitter } from '../middleware/rateLimmtter';

const router = express.Router();

const authLimitter = createAuthLimitter();
const passwordLimitter = createPasswordResetLimitter;

router
    .route('/register')
    .post(authLimitter, signUp);

router  
    .route('/login')
    .post(authLimitter, login);

router
    .route('/forgotPassword')
    .post(passwordLimitter, forgotPassword);

router
    .route('/resetPassword')
    .post(passwordLimitter, resetPassword);

export default router;