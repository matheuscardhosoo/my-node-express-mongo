import mongoose, { Document, Schema } from 'mongoose';

import { IAuthor } from '../../domain/dependency_inversion/author';

export interface IAuthorDocument extends Document<string, unknown, IAuthor> {
    id: Schema.Types.ObjectId;
    name: string;
    birthDate?: Date;
    books?: string[];
}

export const authorSchema = new Schema<IAuthorDocument>(
    {
        name: {
            type: String,
            required: true,
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