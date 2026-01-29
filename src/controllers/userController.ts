import type { NextFunction, Request, Response } from 'express';
import { User } from './../models/userModel';
import { catchAsync } from '../utils/catchAsync';

// GET ALL USERS - ADMIN
export const getAllUsers = async(req: Request, res: Response, next: NextFunction): Promise<void> => {
    try{
        const users = await User.find();

        if(!users || users.length === 0){
            res.status(404).json({
                status: 'fail',
                message: 'No users currently available'
            })
            return;
        }

        res.status(200).json({
            status: 'success',
            results: users.length,
            data: {
                users
            }
        })
    }catch(err){
        res.status(500).json({
            status: 'fail',
            message: err instanceof Error? err.message : 'Server Error!'
        })
    }
}

// GET A SINGLE USER - ADMIN
export const getUser = async( req: Request, res: Response, next: NextFunction): Promise<void> => {
    try{
        const { username } = req.params;

        if(!username){
            res.status(404).json({
                status: 'fail',
                message: 'Username must be provided'
            })
            return;
        }

        const user = await User.findOne({
            username: username,
        });

        if(!user){
            res.status(404).json({
                status: 'fail',
                message: 'User not found!'
            })
            return;
        }

        res.status(200).json({
            status: 'success',
            data: {
                user
            }
        })

    }catch(err){
        res.status(500).json({
            status: 'fail',
            message: err instanceof Error? err.message : 'Server Error!'
        })
    }
}

// DELETE USER - ADMIN
export const deleteUser = async( req: Request, res: Response, next: NextFunction): Promise<void> => {
    try{
        const { username } = req.params;

        if(!username){
            res.status(404).json({
                status: 'fail',
                message: 'Username must be provided'
            })
            return;
        }

        const user = await User.findOneAndDelete({
            username: username,
        });

        if(!user){
            res.status(404).json({
                status: 'success',
                message: 'User not found!'
            });
            return;       
        }

        res.status(200).json({
            status: 'success',
            message: 'Account deleted',
            data: {
                user
            }
        })

    }catch(err){
        res.status(500).json({
            status: 'fail',
            message: err instanceof Error? err.message : 'Server Error!'
        })
    }
}