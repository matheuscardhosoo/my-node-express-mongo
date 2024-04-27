import { AuthorModel, BookModel, IAuthorDocument, IBookDocument } from '../models/index';
import { ClientSession, startSession } from 'mongoose';
import {
    IBookAuthorObject,
    IBookRepository,
    ICreateBook,
    IQueryBook,
    IReadBook,
    IUpdateBook,
} from '../../domain/dependency_inversion/book';
import { ResourceNotFoundError, ValidatorError } from './errors';

import { IDatabaseErrorAdapter } from '../dependency_inversion/database';

export class BookRepository implements IBookRepository {
    private databaseErrorAdapter: IDatabaseErrorAdapter;

    constructor(databaseErrorAdapter: IDatabaseErrorAdapter) {
        this.databaseErrorAdapter = databaseErrorAdapter;
    }

    async create(data: ICreateBook): Promise<IReadBook> {
        const session = await startSession();
        session.startTransaction();
        try {
            const bookAuthors = await this.validateBookAuthors(data.authors, session);
            const document = new BookModel(data);
            await document.save({ session });
            await this.addBookToAuthors(document._id, document.authors, session);
            await session.commitTransaction();
            return this.documentToBook(document, bookAuthors);
        } catch (error) {
            await session.abortTransaction();
            throw this.databaseErrorAdapter.adaptError(error as Error);
        } finally {
            await session.endSession();
        }
    }

    async findAll(): Promise<IReadBook[]> {
        try {
            const documents = await BookModel.find({}).populate('authors').exec();
            return documents.map((document: IBookDocument) => this.documentToBook(document));
        } catch (error) {
            throw this.databaseErrorAdapter.adaptError(error as Error);
        }
    }

    async findByQuery(query: IQueryBook): Promise<IReadBook[]> {
        try {
            const queryFilter = await this.prepareQueryFilter(query);
            const documents = await BookModel.find(queryFilter).populate('authors').exec();
            return documents.map((document: IBookDocument) => this.documentToBook(document));
        } catch (error) {
            throw this.databaseErrorAdapter.adaptError(error as Error);
        }
    }

    async findById(id: string): Promise<IReadBook> {
        try {
            const document = await BookModel.findById(id);
            if (!document) {
                throw new ResourceNotFoundError('Book', id);
            }
            const populatedDocument = await document.populate('authors');
            return this.documentToBook(populatedDocument);
        } catch (error) {
            throw this.databaseErrorAdapter.adaptError(error as Error);
        }
    }

    async replace(id: string, data: ICreateBook): Promise<IReadBook> {
        const session = await startSession();
        session.startTransaction();
        try {
            const bookAuthors = await this.validateBookAuthors(data.authors, session);
            const oldDocument = await BookModel.findById(id, { _id: 0, authors: 1 }, { session });
            const updatedDocument = await BookModel.findOneAndReplace({ _id: id }, data, {
                new: true,
                upsert: true,
                setDefaultsOnInsert: true,
                runValidators: true,
                session,
            });
            await this.updateBookAuthors(id, updatedDocument.authors, oldDocument?.authors);
            await session.commitTransaction();
            return this.documentToBook(updatedDocument, bookAuthors);
        } catch (error) {
            await session.abortTransaction();
            throw this.databaseErrorAdapter.adaptError(error as Error);
        } finally {
            await session.endSession();
        }
    }

    async update(id: string, data: IUpdateBook): Promise<IReadBook> {
        const session = await startSession();
        session.startTransaction();
        try {
            const oldDocument = await BookModel.findById(id, { _id: 0, authors: 1 }, { session });
            if (!oldDocument) {
                throw new ResourceNotFoundError('Book', id);
            }
            const bookAuthors = await this.validateBookAuthors(data.authors, session);
            const updatedDocument = await BookModel.findByIdAndUpdate(id, data, {
                upsert: false,
                setDefaultsOnInsert: false,
                runValidators: true,
                returnDocument: 'after',
                session,
            });
            if (!updatedDocument) {
                throw new ResourceNotFoundError('Book', id);
            }
            await this.updateBookAuthors(id, updatedDocument.authors, oldDocument?.authors, session);
            await session.commitTransaction();
            return this.documentToBook(updatedDocument, bookAuthors);
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
            const oldDocument = await BookModel.findByIdAndDelete(id, { session });
            if (!oldDocument) {
                throw new ResourceNotFoundError('Book', id);
            }
            await this.removeBookFromAuthors(id, oldDocument.authors, session);
            await session.commitTransaction();
        } catch (error) {
            await session.abortTransaction();
            throw this.databaseErrorAdapter.adaptError(error as Error);
        } finally {
            await session.endSession();
        }
    }

    private async findBookAuthors(authorsIds?: string[], session?: ClientSession): Promise<IBookAuthorObject[]> {
        if (!authorsIds) {
            return [];
        }
        const documents: IAuthorDocument[] = await AuthorModel.find(
            { _id: { $in: authorsIds } },
            { name: 1 },
            { session },
        );
        return documents.map((document: IAuthorDocument) => ({
            id: document._id,
            name: document.name,
        }));
    }

    private async validateBookAuthors(authorsIds?: string[], session?: ClientSession): Promise<IBookAuthorObject[]> {
        if (!authorsIds) {
            return [];
        }
        const authorsIdsSet = new Set(authorsIds);
        const hasDuplicates = authorsIds.length !== authorsIdsSet.size;
        const foundBookAuthors = await this.findBookAuthors(authorsIds, session);
        const foundBookAuthorsIds = foundBookAuthors.map(
            (author: IBookAuthorObject) => author.id?.toString() as string,
        );
        if (hasDuplicates || authorsIds.length !== foundBookAuthorsIds.length) {
            throw new ValidatorError({ ['author']: 'Authors list contains invalid ids' });
        }
        return foundBookAuthors;
    }

    private async addBookToAuthors(bookId?: string, newAuthorsIds?: string[], session?: ClientSession): Promise<void> {
        if (!bookId || !newAuthorsIds) {
            return;
        }
        await AuthorModel.updateMany({ _id: { $in: newAuthorsIds } }, { $push: { books: bookId } }, { session });
    }

    private async removeBookFromAuthors(
        bookId: string,
        oldAuthorsIds?: string[],
        session?: ClientSession,
    ): Promise<void> {
        if (!oldAuthorsIds) {
            return;
        }
        await AuthorModel.updateMany({ _id: { $in: oldAuthorsIds } }, { $pull: { books: bookId } }, { session });
    }

    private async updateBookAuthors(
        bookId: string,
        newAuthorsIds?: string[],
        oldAuthorsIds?: string[],
        session?: ClientSession,
    ): Promise<void> {
        await this.removeBookFromAuthors(bookId, oldAuthorsIds, session);
        await this.addBookToAuthors(bookId, newAuthorsIds, session);
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

    private async prepareQueryFilter(query: IQueryBook): Promise<Record<string, unknown>> {
        const queryFilter: Record<string, unknown> = {};
        if (query.title__ilike) queryFilter.title = { $regex: query.title__ilike, $options: 'i' };
        if (query.numberOfPages__gte && query.numberOfPages__lte)
            queryFilter.numberOfPages = { $gte: query.numberOfPages__gte, $lte: query.numberOfPages__lte };
        else if (query.numberOfPages__gte) queryFilter.numberOfPages = { $gte: query.numberOfPages__gte };
        else if (query.numberOfPages__lte) queryFilter.numberOfPages = { $lte: query.numberOfPages__lte };
        if (query.authors__name__ilike) {
            const authorsIds = await AuthorModel.find(
                { name: { $regex: query.authors__name__ilike, $options: 'i' } },
                { _id: 1 },
            ).distinct('_id');
            queryFilter.authors = { $in: authorsIds };
        }
        return queryFilter;
    }
}

export class BookRepositoryFactory {
    private instance: BookRepository | null = null;

    private databaseErrorAdapter: IDatabaseErrorAdapter;

    constructor(databaseErrorAdapter: IDatabaseErrorAdapter) {
        this.databaseErrorAdapter = databaseErrorAdapter;
    }

    getInstance(): BookRepository {
        if (!this.instance) {
            this.instance = new BookRepository(this.databaseErrorAdapter);
        }
        return this.instance;
    }
}
