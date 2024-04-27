import { IAuthor, IFilterAuthor } from '../../domain/dependency_inversion/author';
import mongoose, { Document, FilterQuery, Schema } from 'mongoose';

export interface IAuthorDocument extends Document<string, unknown, IAuthor> {
    id: Schema.Types.ObjectId;
    name: string;
    birthDate?: Date;
    books?: string[];
}

export class AuthorFilterQuery implements FilterQuery<IAuthor> {
    name?: { $regex: string; $options: string };

    birthDate?: { $gte?: Date; $lte?: Date };

    books?: { $in: string[] };

    constructor(filter: IFilterAuthor, authorBooksIds: string[] = []) {
        if (filter.name__ilike) {
            this.name = { $regex: filter.name__ilike, $options: 'i' };
        }
        if (filter.birthDate__gte && filter.birthDate__lte) {
            this.birthDate = { $gte: filter.birthDate__gte, $lte: filter.birthDate__lte };
        } else if (filter.birthDate__gte) {
            this.birthDate = { $gte: filter.birthDate__gte };
        } else if (filter.birthDate__lte) {
            this.birthDate = { $lte: filter.birthDate__lte };
        }
        if (filter.books__title__ilike) {
            this.books = { $in: authorBooksIds };
        }
    }
}

const authorSchema = new Schema<IAuthorDocument>(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
        },
        birthDate: {
            type: Date,
            required: false,
        },
        books: {
            type: [Schema.Types.ObjectId],
            ref: 'Book',
            required: false,
        },
    },
    { versionKey: false },
);

const AuthorModel = mongoose.model<IAuthorDocument>('Author', authorSchema);

export default AuthorModel;
