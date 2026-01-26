import type { Request, Response } from 'express';
import cloudinary from '../config/cloudinary';

export const uploadSingle = async (req: Request, res: Response) => {
    try {
        if (!req.file?.path) {
            return res.status(400).json({
            status: 'fail',
            message: 'File upload failed! Please provide an image'
            });
        }

        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'uploads'
        });

        if (result) {
            return res.status(200).json({
                status: 'success',
                message: 'Uploaded!',
                data: {
                    result
                }
            });
        }

        res.status(400).json({
            status: 'fail',
            message: 'Upload failed'
        });

    } catch (error) {
        res.status(500).json({
            status: 'fail',
            error: error instanceof Error ? error.message : 'Server Error!'
        });
    }
};


// UPLOAD MULTIPLE PHOTOS 
export const uploadMultiple = async (req: Request, res: Response) => {
    try {
        if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
            return res.status(400).json({
                status: 'fail',
                message: 'File upload failed! Please provide images'
            });
        };

        const uploadPromises = req.files.map(async (file) => {
            if (!file.path) {
                throw new Error(`File path missing for ${file.originalname}`);
            }

            const result = await cloudinary.uploader.upload(file.path, {
                folder: 'uploads'
            });

            return result;
        });

        const results = await Promise.all(uploadPromises);

        if (results && results.length > 0) {
            return res.status(200).json({
                status: 'success',
                message: `${results.length} file(s) uploaded successfully!`,
                data: { results } 
            });
        }

        res.status(400).json({
            status: 'fail',
            message: 'Upload failed'
        });

    } catch (error) {
        res.status(500).json({
            status: 'fail',
            error: error instanceof Error ? error.message : 'Server Error!'
        });
    }
}