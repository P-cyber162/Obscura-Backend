import type { NextFunction, Request, Response } from 'express';
import { User }  from './../models/userModel';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';

const signToken = (id: string): string => {
    return jwt.sign(
        { id },
        process.env.JWT_SECRET as string,
        {expiresIn: '7d'}
    )
};

export const signUp = async(next: NextFunction, req: Request, res: Response): Promise<void> => {
    try{
        const { username, email, password, confirmPassword } = req.body;

        const newUser = await User.create({
            username,
            email,
            password,
            confirmPassword
        });

        const token = signToken(newUser._id.toString());

        res.status(201).json({
            status: 'success',
            token,
            data: {
                newUser
            }
        })

    }catch(err){
        res.status(400).json({
            status: 'fail',
            message: err instanceof Error? err.message : 'User not created! An error occured'
        })
    }
};

export const login = async(next: NextFunction, req: Request, res: Response): Promise<void> => {
    try{
        const { email, password } = req.body;

        // CHECK IF EMAIL & PASSWORD ARE INPUTTED
        if(!email || !password){
            res.status(400).json({
                status: 'fail',
                message: 'Please provide email or password'
            })
        }

        // FIND USER WITH EAMIL & PASSWORD
        const user = await User.findOne({ email }).select("+password");

        // CHECK IF USER EXISTS
        if(!user || !(await bcryptjs.compare(password, user.password))){
            res.status(401).json({
                status: 'fail',
                message: 'Incorrect email or passsword!'
            })
        }

        if(user !== null) {
            const token = signToken(user._id.toString());

            res.status(400).json({
                status: 'success',
                token
            })
        };

    }catch(err){
        res.status(500).json({
            status: 'fail',
            message: err instanceof Error? err.message : 'Server Error'
        })
    }
}