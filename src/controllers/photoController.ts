import type { Request, Response, NextFunction } from 'express';
import { Photo } from '../models/photoModel';
import cloudinary from '../config/cloudinary';
import { catchAsync } from '../utils/catchAsync';

// GET ALL PUBLIC PHOTOS — GUEST & USERS
export const getPublicPhotos = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const photos = await Photo.find({ visibility: 'public' })
      .populate('owner', 'username email')
      .sort('-createdAt');

    res.status(200).json({
      status: 'success',
      results: photos.length, 
      data: { photos }
    });
  }
);

// GET CURRENT USER PHOTOS
export const getMyPhotos = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const photos = await Photo.find({ owner: req.user!._id })
      .populate('album', 'name')
      .sort('-createdAt');

    res.status(200).json({
      status: 'success',
      results: photos.length,
      data: { photos }
    });
  }
);

// GET SINGLE PHOTO
export const getPhoto = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const photo = await Photo.findById(req.params.id)
      .populate('owner', 'username email')
      .populate('album', 'name');

    if (!photo) {
      res.status(404).json({
        status: 'fail',
        message: 'Photo not found'
      });
      return;
    }

    // Authorization
    const isOwner = photo.owner._id.toString() === req.user!._id.toString();
    const isPublic = photo.visibility === 'public';
    const isAdmin = req.user!.role === 'admin';

    if (!isPublic && !isOwner && !isAdmin) {
      res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to view this photo'
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: { photo }
    });
  }
);

// UPDATE PHOTO
export const updatePhoto = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { title, description, visibility } = req.body;

    const photo = await Photo.findById(req.params.id);

    if (!photo) {
      res.status(404).json({
        status: 'fail',
        message: 'Photo not found'
      });
      return;
    }

    // Ownership check
    if (photo.owner.toString() !== req.user!._id.toString()) {
      res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to update this photo'
      });
      return;
    }

    if (title) photo.title = title;
    if (description !== undefined) photo.description = description;
    if (visibility) photo.visibility = visibility;

    await photo.save();

    res.status(200).json({
      status: 'success',
      data: { photo }
    });
  }
);

// DELETE PHOTO
export const deletePhoto = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const photo = await Photo.findById(req.params.id);

    if (!photo) {
      res.status(404).json({
        status: 'fail',
        message: 'Photo not found'
      });
      return;
    }

    // Authorization
    const isOwner = photo.owner.toString() === req.user!._id.toString();
    const isAdmin = req.user!.role === 'admin';

    if (!isOwner && !isAdmin) {
      res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to delete this photo'
      });
      return;
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(photo.publicId);

    // Delete from DB
    await Photo.findByIdAndDelete(photo._id);

    res.status(204).json({
      status: 'success',
      data: null
    });
  }
);
