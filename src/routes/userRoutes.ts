import express from 'express';
import { protect } from '../controllers/authController';
import { getAllUsers, getUser, deleteUser } from './../controllers/userController';

const router = express.Router();

router
    .route('/')
    .get(protect, getAllUsers);

router
     .route('/:username')
     .get(protect, getUser)
     .delete(protect, deleteUser);

export default router;