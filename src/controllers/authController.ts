import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import crypto from 'crypto';
import passport from 'passport';
import { sendPasswordResetEmail } from '../utils/sendEmail';
import { User } from '../models/userModel';
import { catchAsync } from '../utils/catchAsync';

const signToken = (id: string): string => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET as string,
    { expiresIn: '7d' }
  );
};

// SIGN UP
export const signUp = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const { username, email, password } = req.body;

    const newUser = await User.create({
      username,
      email,
      password
    });

    const token = signToken(newUser._id.toString());

    res.status(201).json({
      status: 'success',
      token,
      data: { newUser }
    });
  }
);

// LOGIN
export const login = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        status: 'fail',
        message: 'Please provide email and password'
      });
      return;
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await bcryptjs.compare(password, user.password))) {
      res.status(401).json({
        status: 'fail',
        message: 'Incorrect email or password'
      });
      return;
    }

    const token = signToken(user._id.toString());

    res.status(200).json({
      status: 'success',
      token
    });
  }
);

// CREATE ADMIN
export const createAdmin = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    if (req.user?.role !== 'admin') {
      res.status(403).json({
        status: 'fail',
        message: 'Only admins can create admin accounts!'
      });
      return;
    }

    const { username, email, password } = req.body;

    const newAdmin = await User.create({
      username,
      email,
      password,
      role: 'admin'
    });

    res.status(201).json({
      status: 'success',
      message: 'Admin created successfully',
      data: { user: newAdmin }
    });
  }
);

// PROTECT ROUTES
export const protect = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({
        status: 'fail',
        message: 'You are not logged in'
      });
      return;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      res.status(500).json({
        status: 'error',
        message: 'Server configuration error'
      });
      return;
    }

    const decoded = jwt.verify(token, secret) as { id: string };

    const freshUser = await User.findById(decoded.id);

    if (!freshUser) {
      res.status(404).json({
        status: 'fail',
        message: 'User no longer exists'
      });
      return;
    }

    req.user = freshUser;
    next();
  }
);

// FORGOT PASSWORD
export const forgotPassword = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      res.status(200).json({
        status: 'success',
        message: 'If email exists, a reset link was sent'
      });
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);

    await user.save();

    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/reset-password/${resetToken}`;
    await sendPasswordResetEmail(user.email, resetUrl);

    res.status(200).json({
      status: 'success',
      message: 'Password reset link sent'
    });
  }
);

// RESET PASSWORD
export const resetPassword = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
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
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gte: Date.now() }
    });

    if (!user) {
      res.status(400).json({
        status: 'fail',
        message: 'Token is invalid or expired'
      });
      return;
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Password reset successful'
    });
  }
);

// ROLE-BASED ACCESS CONTROL
export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({
        status: 'fail',
        message: 'You do not have access to this action'
      });
      return;
    }
    next();
  };
};

// GOOGLE OAUTH
export const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email']
});

// GOOGLE CALLBACK
export const googleCallback = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  passport.authenticate('google', { session: false }, (err: any, user: any) => {
    if (err || !user) {
      return res.status(401).json({
        status: 'fail',
        message: 'OAuth failed'
      });
    }

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
