import mongoose, { Document, Schema } from 'mongoose';

export interface IBookDocument extends Document {
    title: string;
    description?: string;
}

const bookSchema = new Schema<IBookDocument>({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: false,
    },
}, {versionKey: false});

const BookModel = mongoose.model<IBookDocument>("Book", bookSchema);

export default BookModel;
