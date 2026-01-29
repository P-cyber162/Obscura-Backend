import express from 'express';
import { protect } from './../controllers/authController';
import {
    createAlbum,
    getMyAlbums,
    getAlbum,
    updateAlbum,
    deleteAlbum,
    addPhotoToAlbum
} from './../controllers/albumController';

const router = express.Router();

router.use(protect); 

router
    .route('/')
    .get(getMyAlbums)
    .post(createAlbum);

router
    .route('/:id')
    .get(getAlbum)
    .patch(updateAlbum)
    .delete(deleteAlbum);

router
    .route('/:id/photos')
    .post(addPhotoToAlbum);

export default router;