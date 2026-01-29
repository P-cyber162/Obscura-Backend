import express from 'express';
import { upload } from '../middleware/upload';
import { uploadMultiple, uploadSingle } from '../controllers/uploadController';
import { protect } from '../controllers/authController';
const router = express.Router();

router
    .route('/single')
    .post(protect, upload.single('image'), uploadSingle);
router
    .route('/multiple')
    .post(protect, upload.array('photos', 10), uploadMultiple);

export default router; 