import express from 'express';
import { createAdmin, protect, restrictTo } from '../controllers/authController.js';
import { getAllUsers, getUser, deleteUser } from './../controllers/userController.js';

const router = express.Router();

router
    .route('/')
    .get(protect, restrictTo('admin'), getAllUsers);

router  
    .route('/create-admin')
    .post(protect, createAdmin);
    
router
     .route('/:username')
     .get(protect, restrictTo('admin'), getUser)
     .delete(protect, deleteUser);

export default router;