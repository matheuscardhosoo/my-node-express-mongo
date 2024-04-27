import { AuthorModel, BookModel, IAuthorDocument, IBookDocument } from '../models/index';
import { ClientSession, startSession } from 'mongoose';
import {
    IAuthorBookObject,
    IAuthorRepository,
    ICreateAuthor,
    IQueryAuthor,
    IReadAuthor,
    IUpdateAuthor,
} from '../../domain/dependency_inversion/author';
import { ResourceNotFoundError, ValidatorError } from './errors';

import { IDatabaseErrorAdapter } from '../dependency_inversion/database';

export class AuthorRepository implements IAuthorRepository {
    private databaseErrorAdapter: IDatabaseErrorAdapter;

    constructor(databaseErrorAdapter: IDatabaseErrorAdapter) {
        this.databaseErrorAdapter = databaseErrorAdapter;
    }

    async create(data: ICreateAuthor): Promise<IReadAuthor> {
        const session = await startSession();
        session.startTransaction();
        try {
            const authorBooks = await this.validateAuthorBooks(data.books, session);
            const document = new AuthorModel(data);
            await document.save({ session });
            await this.addAuthorToBooks(document._id, document.books, session);
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
            const documents = await AuthorModel.find({}).populate('books').exec();
            return documents.map((document: IAuthorDocument) => this.documentToAuthor(document));
        } catch (error) {
            throw this.databaseErrorAdapter.adaptError(error as Error);
        }
    }

    async findByQuery(query: IQueryAuthor): Promise<IReadAuthor[]> {
        try {
            const queryFilter = await this.prepareQueryFilter(query);
            const documents = await AuthorModel.find(queryFilter).populate('books').exec();
            return documents.map((document: IAuthorDocument) => this.documentToAuthor(document));
        } catch (error) {
            throw this.databaseErrorAdapter.adaptError(error as Error);
        }
    }

    async findById(id: string): Promise<IReadAuthor> {
        try {
            const document = await AuthorModel.findById(id);
            if (!document) {
                throw new ResourceNotFoundError('Author', id);
            }
            const populatedDocument = await document.populate('books');
            return this.documentToAuthor(populatedDocument);
        } catch (error) {
            throw this.databaseErrorAdapter.adaptError(error as Error);
        }
    }

    async replace(id: string, data: ICreateAuthor): Promise<IReadAuthor> {
        const session = await startSession();
        session.startTransaction();
        try {
            const authorBooks = await this.validateAuthorBooks(data.books, session);
            const oldDocument = await AuthorModel.findById(id, { _id: 0, books: 1 }, { session });
            const updatedDocument = await AuthorModel.findOneAndReplace({ _id: id }, data, {
                new: true,
                upsert: true,
                setDefaultsOnInsert: true,
                runValidators: true,
                session,
            });
            await this.updateAuthorBooks(id, updatedDocument.books, oldDocument?.books, session);
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
            const oldDocument = await AuthorModel.findById(id, { _id: 0, books: 1 }, { session });
            if (!oldDocument) {
                throw new ResourceNotFoundError('Author', id);
            }
            const authorBooks = await this.validateAuthorBooks(data.books, session);
            const updatedDocument = await AuthorModel.findByIdAndUpdate(id, data, {
                new: true,
                upsert: false,
                setDefaultsOnInsert: false,
                runValidators: true,
                session,
            });
            if (!updatedDocument) {
                throw new ResourceNotFoundError('Author', id);
            }
            await this.updateAuthorBooks(id, updatedDocument.books, oldDocument?.books, session);
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
            const oldDocument = await AuthorModel.findByIdAndDelete(id, { session });
            if (!oldDocument) {
                throw new ResourceNotFoundError('Author', id);
            }
            await this.removeAuthorFromBooks(id, oldDocument.books, session);
            await session.commitTransaction();
        } catch (error) {
            await session.abortTransaction();
            throw this.databaseErrorAdapter.adaptError(error as Error);
        } finally {
            await session.endSession();
        }
    }

    private async findAuthorBooks(booksIds?: string[], session?: ClientSession): Promise<IAuthorBookObject[]> {
        if (!booksIds) {
            return [];
        }
        const documents: IBookDocument[] = await BookModel.find({ _id: { $in: booksIds } }, { title: 1 }, { session });
        return documents.map((document: IBookDocument) => ({
            id: document._id,
            title: document.title,
        }));
    }

    private async validateAuthorBooks(booksIds?: string[], session?: ClientSession): Promise<IAuthorBookObject[]> {
        if (!booksIds) {
            return [];
        }
        const booksIdsSet = new Set(booksIds);
        const hasDuplicates = booksIds.length !== booksIdsSet.size;
        const foundAuthorBooks = await this.findAuthorBooks(booksIds, session);
        const foundAuthorBooksIds = foundAuthorBooks.map((book: IAuthorBookObject) => book.id?.toString() as string);
        if (hasDuplicates || booksIds.length !== foundAuthorBooksIds.length) {
            throw new ValidatorError({ ['books']: 'Books list contains invalid ids' });
        }
        return foundAuthorBooks;
    }

    private async addAuthorToBooks(authorId?: string, newBooksIds?: string[], session?: ClientSession): Promise<void> {
        if (!authorId || !newBooksIds) {
            return;
        }
        await BookModel.updateMany({ _id: { $in: newBooksIds } }, { $push: { authors: authorId } }, { session });
    }

    private async removeAuthorFromBooks(
        authorId: string,
        oldBooksIds?: string[],
        session?: ClientSession,
    ): Promise<void> {
        if (!oldBooksIds) {
            return;
        }
        await BookModel.updateMany({ _id: { $in: oldBooksIds } }, { $pull: { authors: authorId } }, { session });
    }

    private async updateAuthorBooks(
        authorId: string,
        newBooksIds?: string[],
        oldBooksIds?: string[],
        session?: ClientSession,
    ): Promise<void> {
        await this.removeAuthorFromBooks(authorId, oldBooksIds, session);
        await this.addAuthorToBooks(authorId, newBooksIds, session);
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

    private async prepareQueryFilter(query: IQueryAuthor): Promise<Record<string, unknown>> {
        const queryFilter: Record<string, unknown> = {};
        if (query.name__ilike) queryFilter.name = { $regex: new RegExp(query.name__ilike, 'i') };
        if (query.birthDate__gte && query.birthDate__lte)
            queryFilter.birthDate = { $gte: query.birthDate__gte, $lte: query.birthDate__lte };
        else if (query.birthDate__gte) queryFilter.birthDate = { $gte: query.birthDate__gte };
        else if (query.birthDate__lte) queryFilter.birthDate = { $lte: query.birthDate__lte };
        if (query.books__title__ilike) {
            const booksIds = await BookModel.find({
                title: { $regex: new RegExp(query.books__title__ilike, 'i') },
            }).distinct('_id');
            queryFilter.books = { $in: booksIds };
        }
        return queryFilter;
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
