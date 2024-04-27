import { IBook, IBookPriceObject, IFilterBook } from '../../domain/dependency_inversion/book';
import mongoose, { Document, FilterQuery, Schema } from 'mongoose';

export interface IBookDocument extends Document<string, unknown, IBook> {
    title: string;
    description?: string;
    price?: IBookPriceObject;
    numberOfPages?: number;
    authors?: string[];
}

export class BookFilterQuery implements FilterQuery<IBook> {
    title?: { $regex: string; $options: string };

    numberOfPages?: { $gte?: number; $lte?: number };

    authors?: { $in: string[] };

    constructor(filter: IFilterBook, bookAuthorsIds: string[] = []) {
        if (filter.title__ilike) {
            this.title = { $regex: filter.title__ilike, $options: 'i' };
        }
        if (filter.numberOfPages__gte && filter.numberOfPages__lte) {
            this.numberOfPages = { $gte: filter.numberOfPages__gte, $lte: filter.numberOfPages__lte };
        } else if (filter.numberOfPages__gte) {
            this.numberOfPages = { $gte: filter.numberOfPages__gte };
        } else if (filter.numberOfPages__lte) {
            this.numberOfPages = { $lte: filter.numberOfPages__lte };
        }
        if (filter.authors__name__ilike) {
            this.authors = { $in: bookAuthorsIds };
        }
    }
}

const bookPriceSchema = new Schema<IBookPriceObject>(
    {
        value: {
            type: Number,
            required: [true, 'Book price value is required'],
            min: [0, 'Book price must be greater than or equal to 0'],
        },
        currency: {
            type: String,
            required: [true, 'Book price currency is required'],
            default: 'BRL',
            enum: {
                values: ['BRL', 'USD', 'EUR'],
                message: 'Book price currency must be BRL, USD or EUR',
            },
        },
    },
    { versionKey: false, _id: false },
);

const bookSchema = new Schema<IBookDocument>(
    {
        title: {
            type: String,
            required: [true, 'Title is required'],
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
            min: [1, 'Number of pages must be greater than 0'],
            max: [10000, 'Number of pages must be less than 10000'],
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
