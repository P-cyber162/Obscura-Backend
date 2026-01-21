import type { Request, Response } from 'express';
import cloudinary from '../config/cloudinary';

export const uploadSingle = async (req: Request, res: Response) => {
    try {
        const result = await cloudinary.uploader.upload(req.file!.path, {
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
            message: 'Error',
            error: error instanceof Error ? error.message : 'Server Error!'
        });
    }
};