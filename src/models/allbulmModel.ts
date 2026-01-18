import mongoose, {Schema, Document} from 'mongoose';

export interface IAlbum extends Document {
    name: string;
    description?: string;
    owner: mongoose.Types.ObjectId;
    photos: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
};

const albumSchema = new Schema<IAlbum>({
    name: {
        type: String,
        required: [true, 'An album is required!'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    owner: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: [true, 'Album must belong to a user!']
    },
    photos: [{
        type: mongoose.Types.ObjectId,
        ref: 'Photo'
    }]
}, {timestamps: true});

albumSchema.index({ owner: 1 });

export const Album = mongoose.model<IAlbum>('Album', albumSchema);