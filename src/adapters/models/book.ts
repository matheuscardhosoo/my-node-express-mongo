import mongoose, { Document, Schema } from 'mongoose';
import { IBookPriceObject, IReadBook } from '../../domain/dependency_inversion/book';

const bookPriceSchema = new Schema<IBookPriceObject>({
    value: {
        type: Number,
        required: true,
    },
    currency: {
        type: String,
        required: true,
        default: "BRL",
    }
}, {versionKey: false, _id: false});

export const bookSchema = new Schema<IReadBook>({
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
}, {versionKey: false});

const BookModel = mongoose.model<IReadBook>("Book", bookSchema);

export default BookModel;
