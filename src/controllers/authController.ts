import type { NextFunction, Request, Response } from 'express';
import { User }  from '../models/userModel';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';

const signToken = (id: string): string => {
    return jwt.sign(
        { id },
        process.env.JWT_SECRET as string,
        {expiresIn: '7d'}
    )
};

// SIGNUP USER
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


// LOGIN USER
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

        // FIND USER WITH EMAIL & PASSWORD
        const user = await User.findOne({ email }).select("+password");

        // CHECK IF USER EXISTS
        if(!user || !(await bcryptjs.compare(password, user.password))){
            res.status(401).json({
                status: 'fail',
                message: 'Incorrect email or passsword!'
            })
            return;
        }

        const token = signToken(user._id.toString());

            res.status(400).json({
                status: 'success',
                token
            })
        

    }catch(err){
        res.status(500).json({
            status: 'fail',
            message: err instanceof Error? err.message : 'Server Error'
        })
    }
}

// PROTECT ROUTES
export const protect = async(next: NextFunction, req: Request, res: Response): Promise<void> => {
    try{
        let token;

        if(
            req.headers.authorization && req.headers.authorization.startsWith('Bearer')
        ){
            token = req.headers.authorization.split('')[1];
        }

        if(!token) {
            res.status(401).json({
                status: 'fail',
                message: 'You are not logged in! Please log in to gain access'
            })
            return;
        }

        const secret = process.env.JWT_SECRET;

        if(!secret){
            res.status(500).json({
                status: 'error',
                message: 'Server configuration error!'
            })
            return;
        }

        const decoded = jwt.verify(token, secret) as {id: string};

        // FIND USER WITH DECODED ID
        const freshUser = User.findById(decoded.id);

        if(!freshUser){
            res.status(404).json({
                status: 'fail',
                message: 'User this token belongs to does ont exist!'
            })
            return;
        }

        req.user = freshUser;

        next();

    }catch(err){
        res.status(401).json({
            statsu: 'fail',
            message: 'Invalid or expired token!'
        });
    }
}