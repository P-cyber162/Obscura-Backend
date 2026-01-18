import mongoose, { Document, Schema } from 'mongoose';
import bcryptjs from 'bcryptjs';
import validator from 'validator';

export interface IUser extends Document {
    username: string,
    email: string,
    password: string,
    confirmPassword: string | undefined,
    role: string,
    createdAt: Date,
    updatedAt: Date,
    resetPasswordToken?: string | undefined,
    resetPasswordExpires?: Date | undefined,
};

const userSchema = new Schema<IUser>({
    username: {
        type:String,
        trim: true,
        unique: true,
        required: [true, 'A username is required!']
    },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        required: [true, 'An email is required!'],
        validate: {
            validator: function(value: string) {
                return validator.isEmail(value)
            },
            message: 'Invalid Email!'
        }
    },
    password: {
        type: String,
        select: false,
        required: [true, 'A password is required!']
    },
    role: {
        type:String,
        enum: ['user', 'admin', 'guest'],
        default: 'user'
    },
    resetPasswordToken: {
        type: String,
    },
    resetPasswordExpires: {
        type: Date
    }
}, { timestamps: true });

// HASSING PASSWORD 
userSchema.pre('save', async function() {
    if(this.isModified('password')) {
        this.password = await bcryptjs.hash(this.password, 12);
    }
});

export const User = mongoose.model<IUser>('User', userSchema);