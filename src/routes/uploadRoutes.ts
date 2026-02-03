import express from 'express';
import { upload } from '../middleware/upload.js';
import { uploadMultiple, uploadSingle } from '../controllers/uploadController.js';
import { protect } from '../controllers/authController.js';
const router = express.Router();

router
    .route('/single')
    .post(protect, upload.single('image'), uploadSingle);
router
    .route('/multiple')
    .post(protect, upload.array('photos', 10), uploadMultiple);

export default router; 