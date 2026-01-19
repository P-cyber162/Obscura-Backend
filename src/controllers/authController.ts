import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import crypto from 'crypto';
import passport from 'passport';
import { sendPasswordResetEmail } from '../utils/sendEmail';
import { User }  from '../models/userModel';


const signToken = (id: string): string => {
    return jwt.sign(
        { id },
        process.env.JWT_SECRET as string,
        {expiresIn: '7d'}
    )
};

// SIGNUP USER
export const signUp = async(req: Request, res: Response): Promise<void> => {
    try{
        const { username, email, password, role } = req.body;

        const newUser = await User.create({
            username,
            email,
            password,
            role: role || 'user'
        });

        const token = signToken(newUser._id.toString());

        res.status(201).json({
            status: 'success',
            token,
            data: {
                newUser
            }
        });

    }catch(err){
        res.status(400).json({
            status: 'fail',
            message: err instanceof Error? err.message : 'User not created! An error occured'
        })
    }
};


// LOGIN USER
export const login = async(req: Request, res: Response): Promise<void> => {
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

            res.status(200).json({
                status: 'success',
                token
            })
        

    }catch(err){
        res.status(500).json({
            status: 'fail',
            message: err instanceof Error? err.message : 'Server Error'
        })
    }
};

// CREATE ADMIN 
export const createAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { username, email, password } = req.body;
    
        if (req.user?.role !== 'admin') {
            res.status(403).json({
                status: 'fail',
                message: 'Only admins can create admin accounts!'
            });
            return;
        }

        const newAdmin = await User.create({
            username,
            email,
            password,
            role: 'admin'  // ← Create as admin
        });
    
        res.status(201).json({
            status: 'success',
            message: 'Admin created successfully',
            data: { user: newAdmin }
        });

    } catch(error) {
        next(error);
    }
};

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
        const freshUser = await User.findById(decoded.id);

        if(!freshUser){
            res.status(404).json({
                status: 'fail',
                message: 'User this token belongs to does not exist!'
            })
            return;
        };

        req.user = freshUser;

        next();

    }catch(err){
        res.status(401).json({
            statsu: 'fail',
            message: 'Invalid or expired token!'
        });
    }
};

// FORGOT PASSWORD
export const forgotPassword = async(req: Request, res: Response) => {
    try{
        const { email } = req.body;

        const user = await User.findOne({email});

        if(!user){
            res.status(200).json({
                status: 'success',
                message: 'If email exist, we sent a reset link!'
            });
            return;
        };

        const resetToken = crypto.randomBytes(32).toString('hex');

        const hashedToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex') 

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = new Date(Date.now() + (60 * 60 * 1000));

        await user.save();

        const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/reset-password/${resetToken}`
        await sendPasswordResetEmail(user.email, resetUrl);
        
        res.status(200).json({
            status: 'success',
            message: 'Password reset link sent to email!'
        })

    }catch(err){
        res.status(500).json({
            status: 'fail',
            message: err instanceof Error? err.message : 'Server Error'
        })
    }
};

// RESET PASSWORD
export const resetPassword = async(req: Request, res: Response) => {
    try{
        const { token } = req.params;
        const { newPassword } = req.body;

        if(!token || typeof token !== 'string') {
            res.status(400).json({
                status: 'fail',
                message: 'Token is required!'
            });
            return;
        };

        if(!newPassword || newPassword.length < 8){
            res.status(400).json({
                status: 'fail',
                message: 'Password must be at least 8 characters!'
            });
            return;
        };

        const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex')

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gte: Date.now() }
        });

        if(!user) {
            res.status(400).json({
                status: 'error',
                message: 'Invalid or expired reset token!'
            });
            return;
        };

        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.status(200).json({
            status: 'success',
            message: 'Password reset successful!'
        });

    }catch(err){
        res.status(500).json({
            status: 'fail',
            message: err instanceof Error? err.message : 'Server Error'
        });
    }
};

// RBAC - ROLE BASE ACCESS MANAGMENT
export const restrictTo = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if(!req.user || !roles.includes(req.user.role)){
            return res.status(403).json({
                status: 'fail',
                message: 'You do not have access to this action!'
            })
        }
        next();
    };
}; 
 
// GOOGLE OAUTH
export const googleAuth = passport.authenticate('google', {
    scope: ['profile', 'email']
});

export const  googleCallback = (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('google', { session: false }, (err: any, user: any) => {
        if(err || !user) {
            return res.status(401).json({
                status: 'fail',
                message: 'OAuth Failed!'
            });
        };

        const token = signToken(user._id.toString());

        res.status(200).json({
            status: 'success',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    })(req, res, next);
};