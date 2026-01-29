import type { NextFunction, Request, Response } from 'express';
import { User } from './../models/userModel';
import { catchAsync } from '../utils/catchAsync';

// GET ALL USERS — ADMIN
export const getAllUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const users = await User.find();

    if (!users || users.length === 0) {
      res.status(404).json({
        status: 'fail',
        message: 'No users currently available'
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      results: users.length,
      data: { users }
    });
  }
);

// GET SINGLE USER — ADMIN
export const getUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { username } = req.params;

    if (!username) {
      res.status(400).json({
        status: 'fail',
        message: 'Username must be provided'
      });
      return;
    }

    const user = await User.findOne({ username });

    if (!user) {
      res.status(404).json({
        status: 'fail',
        message: 'User not found!'
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: { user }
    });
  }
);

// DELETE USER — ADMIN
export const deleteUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { username } = req.params;

    if (!username) {
      res.status(400).json({
        status: 'fail',
        message: 'Username must be provided'
      });
      return;
    }

    const user = await User.findOneAndDelete({ username });

    if (!user) {
      res.status(404).json({
        status: 'fail',
        message: 'User not found!'
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      message: 'Account deleted',
      data: { user }
    });
  }
);
