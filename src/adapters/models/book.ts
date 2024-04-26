import { IBook, IBookPriceObject } from '../../domain/dependency_inversion/book';
import mongoose, { Document, Schema } from 'mongoose';

export interface IBookDocument extends Document<string, unknown, IBook> {
    title: string;
    description?: string;
    price?: IBookPriceObject;
    numberOfPages?: number;
    authors?: string[];
}

const bookPriceSchema = new Schema<IBookPriceObject>(
    {
        value: {
            type: Number,
            required: true,
        },
        currency: {
            type: String,
            required: true,
            default: 'BRL',
        },
    },
    { versionKey: false, _id: false },
);

export const bookSchema = new Schema<IBookDocument>(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: false,
        },
        price: {
            type: bookPriceSchema,
            required: false,
        },
        numberOfPages: {
            type: Number,
            required: false,
        },
        authors: {
            type: [Schema.Types.ObjectId],
            ref: 'Author',
            required: false,
        },
    },
    { versionKey: false },
);

const BookModel = mongoose.model<IBookDocument>('Book', bookSchema);

export default BookModel;
