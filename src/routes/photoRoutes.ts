import express from 'express';
import { protect, restrictTo } from './../controllers/authController';
import {
    getMyPhotos,
    getPublicPhotos,
    getPhoto,
    updatePhoto,
    deletePhoto
} from './../controllers/photoController';

const router = express.Router();

// Public routes
router.get('/public', getPublicPhotos);

// Protected routes
router.use(protect);

router
    .route('/my-photos')
.get(getMyPhotos);

router
    .route('/:id')
    .get(getPhoto)
    .patch(updatePhoto)
    .delete(deletePhoto);

export default router;