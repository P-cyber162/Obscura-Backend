import type { Request, Response, NextFunction } from 'express';
import cloudinary from '../config/cloudinary';
import { Photo } from '../models/photoModel';  
import { catchAsync } from '../utils/catchAsync';
import fs from 'fs/promises';  // ← For cleanup

export const uploadSingle = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.file?.path) {
      res.status(400).json({
        status: 'fail',
        message: 'File upload failed! Please provide an image'
      });
      return;
    }

    const { title, description, visibility = 'private', albumId } = req.body;

    if (!title) {
      res.status(400).json({
        status: 'fail',
        message: 'Photo title is required'
      });
      return;
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'uploads'
    });

    const photo = await Photo.create({
      title,
      description,
      url: result.secure_url,
      publicId: result.public_id,
      visibility,
      owner: req.user!._id,
      album: albumId || undefined
    });

    await fs.unlink(req.file.path).catch(() => {});

    res.status(201).json({
      status: 'success',
      message: 'Photo uploaded successfully!',
      data: { photo }
    });
  }
);


export const uploadMultiple = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {

    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      res.status(400).json({
        status: 'fail',
        message: 'File upload failed! Please provide images'
      });
      return;
    }

    const { titles, descriptions, visibility = 'private', albumId } = req.body;

    const titleArray =
      typeof titles === 'string' ? JSON.parse(titles) : titles;

    const descArray =
      typeof descriptions === 'string' ? JSON.parse(descriptions) : descriptions;

    const uploadPromises = req.files.map(async (file, index) => {
      if (!file.path) {
        throw new Error(`File path missing for ${file.originalname}`);
      }

      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'uploads'
      });

      const photo = await Photo.create({
        title: titleArray?.[index] || `Photo ${index + 1}`,
        description: descArray?.[index] || '',
        url: result.secure_url,
        publicId: result.public_id,
        visibility,
        owner: req.user!._id,
        album: albumId || undefined
      });

      // Cleanup local file
      await fs.unlink(file.path).catch(() => {});

      return photo;
    });

    const photos = await Promise.all(uploadPromises);

    res.status(201).json({
      status: 'success',
      message: `${photos.length} photo(s) uploaded successfully!`,
      data: { photos }
    });
  }
);
