import type { Request, Response } from 'express';
import cloudinary from '../config/cloudinary';
import { Photo } from '../models/photoModel';  
import fs from 'fs/promises';  // ← For cleanup

// UPLOAD SINGLE PHOTO
export const uploadSingle = async (req: Request, res: Response) => {
    try {
        // 1. Check if file exists
        if (!req.file?.path) {
            return res.status(400).json({
                status: 'fail',
                message: 'File upload failed! Please provide an image'
            });
        }

        // 2. Get metadata from request body
        const { title, description, visibility = 'private', albumId } = req.body;

        // 3. Validate required fields
        if (!title) {
            return res.status(400).json({
                status: 'fail',
                message: 'Photo title is required'
            });
        }

        // 4. Upload to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'uploads'
        });

        if (!result) {
            return res.status(400).json({
                status: 'fail',
                message: 'Upload to Cloudinary failed'
            });
        }

        // 5. Save photo details to MongoDB
        const photo = await Photo.create({
            title: title,
            description: description,
            url: result.secure_url,        // Cloudinary URL
            publicId: result.public_id,    // For deletion
            visibility: visibility,
            owner: req.user!._id,          // From auth middleware
            album: albumId || undefined    // Optional album
        });

        // 6. Clean up local file (optional but recommended)
        await fs.unlink(req.file.path).catch(() => {});

        // 7. Send response with photo data
        return res.status(201).json({
            status: 'success',
            message: 'Photo uploaded successfully!',
            data: {
                photo  // MongoDB document
            }
        });

    } catch (error) {
        // Clean up file if error occurs
        if (req.file?.path) {
            await fs.unlink(req.file.path).catch(() => {});
        }

        res.status(500).json({
            status: 'fail',
            error: error instanceof Error ? error.message : 'Server Error!'
        });
    }
};


// UPLOAD MULTIPLE PHOTOS
export const uploadMultiple = async (req: Request, res: Response) => {
    try {
        // 1. Check if files exist
        if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
            return res.status(400).json({
                status: 'fail',
                message: 'File upload failed! Please provide images'
            });
        }

        // 2. Get metadata from request body
        const { titles, descriptions, visibility = 'private', albumId } = req.body;

        // 3. Parse arrays if sent as JSON strings
        const titleArray = typeof titles === 'string' ? JSON.parse(titles) : titles;
        const descArray = typeof descriptions === 'string' ? JSON.parse(descriptions) : descriptions;

        // 4. Upload each file to Cloudinary AND save to MongoDB
        const uploadPromises = req.files.map(async (file, index) => {
            if (!file.path) {
                throw new Error(`File path missing for ${file.originalname}`);
            }

            // Upload to Cloudinary
            const result = await cloudinary.uploader.upload(file.path, {
                folder: 'uploads'
            });

            // Save to MongoDB
            const photo = await Photo.create({
                title: titleArray?.[index] || `Photo ${index + 1}`,
                description: descArray?.[index] || '',
                url: result.secure_url,
                publicId: result.public_id,
                visibility: visibility,
                owner: req.user!._id,
                album: albumId || undefined
            });

            // Clean up local file
            await fs.unlink(file.path).catch(() => {});

            return photo;  // Return MongoDB document
        });

        // 5. Wait for all uploads to complete
        const photos = await Promise.all(uploadPromises);

        // 6. Send response
        return res.status(201).json({
            status: 'success',
            message: `${photos.length} photo(s) uploaded successfully!`,
            data: {
                photos  // Array of MongoDB documents
            }
        });

    } catch (error) {
        // Clean up files if error occurs
        if (req.files && Array.isArray(req.files)) {
            await Promise.all(
                req.files.map(file => 
                    fs.unlink(file.path).catch(() => {})
                )
            );
        }

        res.status(500).json({
            status: 'fail',
            error: error instanceof Error ? error.message : 'Server Error!'
        });
    }
};