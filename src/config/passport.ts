import { User } from './../models/userModel';
import passport from 'passport';
import {Strategy as GoogleStrategy} from 'passport-google-oauth20';

import dotenv from 'dotenv';
import { profile } from 'node:console';
import { doesNotMatch } from 'node:assert';
dotenv.config();

const CALLBACK_URL = process.env.NODE_ENV === 'production'
    ? process.env.GOOGLE_CALLBACK_URL
    : process.env.GOOGLE_CALLBACK_URL_DEV;

passport.use( new GoogleStrategy (
    {
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: CALLBACK_URL,
    },
    async(accessToken, refreshToken, profile, done) => {
        try{
            const email = profile.emails?.[0]?.value;

            if(!email) {
                return done(new Error('No email from google'), undefined);
            };

            let user = await User.findOne({ email });

            if(!user){
                user = await User.create({
                    username: profile.displayName,
                    email: email,
                    password: `OAUTH_${profile.id}_${Date.now()}`,
                    confirmPassword: `OAUTH_${profile.id}_${Date.now()}`,
                    role: 'user',
                });
            }
            done(null, user);

        }catch(error){
            done(error as Error, undefined)
        }
    }
));

passport.serializeUser((user: any, done) => {
    done(null, user.id);
});

passport.deserializeUser(async(id:string, done) => {
    try{
        const user = await User.findById(id);
        done(null, user);
    }catch(err){
        done(err, null);
    };
});

export default passport;