import AuthorModel, { IAuthorDocument } from '../models/author';
import BookModel, { IBookDocument } from '../models/book';
import {
    IBookAuthorObject,
    IBookRepository,
    ICreateBook,
    IReadBook,
    IUpdateBook,
} from '../../domain/dependency_inversion/book';

import { startSession } from 'mongoose';

export class BookRepository implements IBookRepository {
    async create(data: ICreateBook): Promise<IReadBook> {
        const session = await startSession();
        session.startTransaction();
        try {
            const bookAuthors: IBookAuthorObject[] = await this.validateBookAuthors(data.authors);
            const document: IBookDocument = await BookModel.create(data);
            await this.addBookToAuthors(document._id, document.authors);
            await session.commitTransaction();
            return this.documentToBook(document, bookAuthors);
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            await session.endSession();
        }
    }

    async findAll(): Promise<IReadBook[]> {
        const documents: IBookDocument[] = await BookModel.find({}).populate('authors').exec();
        return documents.map((document: IBookDocument) => this.documentToBook(document));
    }

    async findById(id: string): Promise<IReadBook | null> {
        const document: IBookDocument | null = await BookModel.findById(id).populate('authors').exec();
        return document ? this.documentToBook(document) : null;
    }

    async replace(id: string, data: ICreateBook): Promise<IReadBook> {
        const session = await startSession();
        session.startTransaction();
        try {
            const bookAuthors: IBookAuthorObject[] = await this.validateBookAuthors(data.authors);
            const oldDocument: IBookDocument | null = await BookModel.findById(id, {
                _id: 0,
                authors: 1,
            });
            const updatedDocument: IBookDocument = await BookModel.findOneAndReplace({ _id: id }, data, {
                new: true,
                upsert: true,
                setDefaultsOnInsert: true,
            });
            await this.updateBookAuthors(id, updatedDocument.authors, oldDocument?.authors);
            await session.commitTransaction();
            return this.documentToBook(updatedDocument, bookAuthors);
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            await session.endSession();
        }
    }

    async update(id: string, data: IUpdateBook): Promise<IReadBook | null> {
        const session = await startSession();
        session.startTransaction();
        try {
            const bookAuthors: IBookAuthorObject[] = await this.validateBookAuthors(data.authors);
            const oldDocument: IBookDocument | null = await BookModel.findById(id, {
                _id: 0,
                authors: 1,
            });
            const updatedDocument: IBookDocument | null = await BookModel.findByIdAndUpdate(id, data, {
                new: true,
                upsert: false,
                setDefaultsOnInsert: false,
            });
            if (!updatedDocument) {
                return null;
            }
            await this.updateBookAuthors(id, updatedDocument.authors, oldDocument?.authors);
            await session.commitTransaction();
            return this.documentToBook(updatedDocument, bookAuthors);
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            await session.endSession();
        }
    }

    async delete(id: string): Promise<void> {
        const session = await startSession();
        session.startTransaction();
        try {
            const oldDocument: IBookDocument | null = await BookModel.findById(id, {
                _id: 0,
                authors: 1,
            });
            if (!oldDocument) {
                return;
            }
            await BookModel.findByIdAndDelete(id);
            await this.removeBookFromAuthors(id, oldDocument.authors);
            await session.commitTransaction();
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            await session.endSession();
        }
    }

    private async findBookAuthors(authorsIds?: string[]): Promise<IBookAuthorObject[]> {
        if (!authorsIds) {
            return [];
        }
        const documents: IAuthorDocument[] = await AuthorModel.find({ _id: { $in: authorsIds } }, { name: 1 });
        return documents.map((document: IAuthorDocument) => ({
            id: document._id,
            name: document.name,
        }));
    }

    private async validateBookAuthors(authorsIds?: string[]): Promise<IBookAuthorObject[]> {
        if (!authorsIds) {
            return [];
        }
        const bookAuthors: IBookAuthorObject[] = await this.findBookAuthors(authorsIds);
        if (bookAuthors.length !== authorsIds?.length) {
            throw new Error('Some authors were not found');
        }
        return bookAuthors;
    }

    private async addBookToAuthors(bookId?: string, newAuthorsIds?: string[]): Promise<void> {
        if (!bookId || !newAuthorsIds) {
            return;
        }
        await AuthorModel.updateMany({ _id: { $in: newAuthorsIds } }, { $push: { books: bookId } });
    }

    private async removeBookFromAuthors(bookId: string, oldAuthorsIds?: string[]): Promise<void> {
        if (!oldAuthorsIds) {
            return;
        }
        await AuthorModel.updateMany({ _id: { $in: oldAuthorsIds } }, { $pull: { books: bookId } });
    }

    private async updateBookAuthors(bookId: string, newAuthorsIds?: string[], oldAuthorsIds?: string[]): Promise<void> {
        await this.removeBookFromAuthors(bookId, oldAuthorsIds);
        await this.addBookToAuthors(bookId, newAuthorsIds);
    }

    private documentToBook(document: IBookDocument, cachedAuthors?: IBookAuthorObject[]): IReadBook {
        const authorsDocuments: IAuthorDocument[] = document.authors as unknown as IAuthorDocument[];
        const authors: IBookAuthorObject[] =
            cachedAuthors ||
            authorsDocuments.map((author: IAuthorDocument) => ({
                id: author._id,
                name: author.name,
            }));
        return {
            id: document._id,
            title: document.title,
            description: document.description,
            price: document.price,
            numberOfPages: document.numberOfPages,
            authors: authors,
        };
    }
}

export class BookRepositoryFactory {
    private instance: BookRepository | null = null;

    getInstance(): BookRepository {
        if (!this.instance) {
            this.instance = new BookRepository();
        }
        return this.instance;
    }
}
