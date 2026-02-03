import { IUser } from './../models/userModel.js';

declare global {
    namespace Express {
        interface User extends IUser {}

        interface Request {
            user?: IUser
        }
    }
}

export{};