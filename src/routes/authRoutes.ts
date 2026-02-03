import express from 'express';
import { 
    signUp, 
    login, 
    forgotPassword, 
    resetPassword,
    googleAuth,
    googleCallback 
} from '../controllers/authController.js';

const router = express.Router();

router
    .route('/register')
    .post(signUp);

router  
    .route('/login')
    .post(login);

router
    .route('/forgot-password')
    .post(forgotPassword);

router
    .route('/reset-password/:token')
    .post(resetPassword);

router 
    .route('/google')
    .get(googleAuth);

router  
    .route('/google/callback')
    .get(googleCallback);

export default router;