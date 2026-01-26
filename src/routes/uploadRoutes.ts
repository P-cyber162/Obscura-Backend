import express from 'express';
import { upload } from '../middleware/upload';
import { uploadMultiple, uploadSingle } from '../controllers/uploadController';

const router = express.Router();

router.post('/single', upload.single('image'), uploadSingle);
router.post('/multiple',upload.array('photos', 10), uploadMultiple);

export default router;