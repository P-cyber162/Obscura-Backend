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
        
        const user = await User.create(
            username,
            email,
            password,
            confirmPassword
        );

    }catch(err){}
}