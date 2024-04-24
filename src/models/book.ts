import mongoose, { Document, Schema } from 'mongoose';

export interface IBook extends Document {
    title: string;
    description?: string;
}

const bookSchema = new Schema<IBook>({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: false,
    },
}, {versionKey: false});

const Book = mongoose.model<IBook>("Book", bookSchema);

export default Book;
