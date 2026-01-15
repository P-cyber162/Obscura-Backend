import express from 'express';
import { signUp, login } from '../controllers/authController';

const router = express.Router();

router
    .route('/register')
    .post(signUp);

router  
    .route('/login')
    .post(login);

export default router;