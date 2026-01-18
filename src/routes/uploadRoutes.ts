import express from 'express';
import { upload } from '../middleware/upload';
import { uploadSingle } from '../controllers/uploadController';

const router = express.Router();

router.post('/single', upload.single('image'), uploadSingle);

export default router;