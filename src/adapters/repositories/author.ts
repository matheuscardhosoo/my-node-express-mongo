import AuthorModel, { IAuthorDocument } from '../models/author';
import BookModel, { IBookDocument } from '../models/book';
import {
    IAuthorBookObject,
    IAuthorRepository,
    ICreateAuthor,
    IReadAuthor,
    IUpdateAuthor,
} from '../../domain/dependency_inversion/author';
import { ResourceNotFoundError, ValidatorError } from './errors';

import { IDatabaseErrorAdapter } from '../dependency_inversion/database';
import { startSession } from 'mongoose';

export class AuthorRepository implements IAuthorRepository {
    private databaseErrorAdapter: IDatabaseErrorAdapter;

    constructor(databaseErrorAdapter: IDatabaseErrorAdapter) {
        this.databaseErrorAdapter = databaseErrorAdapter;
    }

    async create(data: ICreateAuthor): Promise<IReadAuthor> {
        const session = await startSession();
        session.startTransaction();
        try {
            const authorBooks: IAuthorBookObject[] = await this.validateAuthorBooks(data.books);
            const document: IAuthorDocument = await AuthorModel.create(data);
            await this.addAuthorToBooks(document._id, document.books);
            await session.commitTransaction();
            return this.documentToAuthor(document, authorBooks);
        } catch (error) {
            await session.abortTransaction();
            throw this.databaseErrorAdapter.adaptError(error as Error);
        } finally {
            await session.endSession();
        }
    }

    async findAll(): Promise<IReadAuthor[]> {
        try {
            const documents: IAuthorDocument[] = await AuthorModel.find({}).populate('books').exec();
            return documents.map((document: IAuthorDocument) => this.documentToAuthor(document));
        } catch (error) {
            throw this.databaseErrorAdapter.adaptError(error as Error);
        }
    }

    async findById(id: string): Promise<IReadAuthor> {
        try {
            const document: IAuthorDocument | null = await AuthorModel.findById(id).populate('books').exec();
            if (!document) {
                throw new ResourceNotFoundError('Author', id);
            }
            return this.documentToAuthor(document);
        } catch (error) {
            throw this.databaseErrorAdapter.adaptError(error as Error);
        }
    }

    async replace(id: string, data: ICreateAuthor): Promise<IReadAuthor> {
        const session = await startSession();
        session.startTransaction();
        try {
            const authorBooks: IAuthorBookObject[] = await this.validateAuthorBooks(data.books);
            const oldDocument: IAuthorDocument | null = await AuthorModel.findById(id, { _id: 0, books: 1 });
            const updatedDocument: IAuthorDocument = await AuthorModel.findOneAndReplace({ _id: id }, data, {
                new: true,
                upsert: true,
                setDefaultsOnInsert: true,
            });
            await this.updateAuthorBooks(id, updatedDocument.books, oldDocument?.books);
            await session.commitTransaction();
            return this.documentToAuthor(updatedDocument, authorBooks);
        } catch (error) {
            await session.abortTransaction();
            throw this.databaseErrorAdapter.adaptError(error as Error);
        } finally {
            await session.endSession();
        }
    }

    async update(id: string, data: IUpdateAuthor): Promise<IReadAuthor> {
        const session = await startSession();
        session.startTransaction();
        try {
            const oldDocument: IAuthorDocument | null = await AuthorModel.findById(id, { _id: 0, books: 1 });
            if (!oldDocument) {
                throw new ResourceNotFoundError('Author', id);
            }
            const authorBooks: IAuthorBookObject[] = await this.validateAuthorBooks(data.books);
            const updatedDocument: IAuthorDocument | null = await AuthorModel.findByIdAndUpdate(id, data, {
                new: true,
                upsert: false,
                setDefaultsOnInsert: false,
            });
            if (!updatedDocument) {
                throw new ResourceNotFoundError('Author', id);
            }
            await this.updateAuthorBooks(id, updatedDocument.books, oldDocument?.books);
            await session.commitTransaction();
            return this.documentToAuthor(updatedDocument, authorBooks);
        } catch (error) {
            await session.abortTransaction();
            throw this.databaseErrorAdapter.adaptError(error as Error);
        } finally {
            await session.endSession();
        }
    }

    async delete(id: string): Promise<void> {
        const session = await startSession();
        session.startTransaction();
        try {
            const oldDocument: IAuthorDocument | null = await AuthorModel.findById(id, { _id: 0, books: 1 });
            if (!oldDocument) {
                throw new ResourceNotFoundError('Author', id);
            }
            await AuthorModel.findByIdAndDelete(id);
            await this.removeAuthorFromBooks(id, oldDocument.books);
            await session.commitTransaction();
        } catch (error) {
            await session.abortTransaction();
            throw this.databaseErrorAdapter.adaptError(error as Error);
        } finally {
            await session.endSession();
        }
    }

    private async findAuthorBooks(booksIds?: string[]): Promise<IAuthorBookObject[]> {
        if (!booksIds) {
            return [];
        }
        const documents: IBookDocument[] = await BookModel.find({ _id: { $in: booksIds } }, { title: 1 });
        return documents.map((document: IBookDocument) => ({
            id: document._id,
            title: document.title,
        }));
    }

    private async validateAuthorBooks(booksIds?: string[]): Promise<IAuthorBookObject[]> {
        if (!booksIds) {
            return [];
        }
        const authorBooks: IAuthorBookObject[] = await this.findAuthorBooks(booksIds);
        if (authorBooks.length !== booksIds?.length) {
            throw new ValidatorError({ ['books']: 'Some books were not found' });
        }
        return authorBooks;
    }

    private async addAuthorToBooks(authorId?: string, newBooksIds?: string[]): Promise<void> {
        if (!authorId || !newBooksIds) {
            return;
        }
        await BookModel.updateMany({ _id: { $in: newBooksIds } }, { $push: { authors: authorId } });
    }

    private async removeAuthorFromBooks(authorId: string, oldBooksIds?: string[]): Promise<void> {
        if (!oldBooksIds) {
            return;
        }
        await BookModel.updateMany({ _id: { $in: oldBooksIds } }, { $pull: { authors: authorId } });
    }

    private async updateAuthorBooks(authorId: string, newBooksIds?: string[], oldBooksIds?: string[]): Promise<void> {
        await this.removeAuthorFromBooks(authorId, oldBooksIds);
        await this.addAuthorToBooks(authorId, newBooksIds);
    }

    private documentToAuthor(document: IAuthorDocument, cachedBooks?: IAuthorBookObject[]): IReadAuthor {
        const booksDocuments: IBookDocument[] = document.books as unknown as IBookDocument[];
        const books: IAuthorBookObject[] =
            cachedBooks ||
            booksDocuments.map((bookDocument: IBookDocument) => ({
                id: bookDocument._id,
                title: bookDocument.title,
            }));
        return {
            id: document._id,
            name: document.name,
            birthDate: document.birthDate,
            books: books,
        };
    }
}

export class AuthorRepositoryFactory {
    private instance: AuthorRepository | null = null;

    private databaseErrorAdapter: IDatabaseErrorAdapter;

    constructor(databaseErrorAdapter: IDatabaseErrorAdapter) {
        this.databaseErrorAdapter = databaseErrorAdapter;
    }

    getInstance(): AuthorRepository {
        if (!this.instance) {
            this.instance = new AuthorRepository(this.databaseErrorAdapter);
        }
        return this.instance;
    }
}
