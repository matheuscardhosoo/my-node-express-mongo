import {
    IAcessByIndexParams,
    ICreateRequest,
    IDeleteRequest,
    IListRequest,
    IListResponse,
    INoResponse,
    IReadRequest,
    IReplaceRequest,
    ISingleResponse,
    IUpdateRequest,
} from './interfaces';
import { ICreateBook, IQueryBook, IReadBook, IUpdateBook } from '../../domain/dependency_inversion/book';
import { IHandler, INextFunction, IRouter } from '../dependency_inversion/api';

import { BookRepositoryFactory } from '../repositories/book';
import { ResourceNotFoundError } from '../repositories/errors';

class BookController {
    private bookRepositoryFactory: BookRepositoryFactory;

    constructor(router: IRouter, bookRepositoryFactory: BookRepositoryFactory) {
        this.bookRepositoryFactory = bookRepositoryFactory;

        router.get('/books', this.list.bind(this) as IHandler);
        router.post('/books', this.create.bind(this) as IHandler);
        router.get('/books/:id', this.read.bind(this) as IHandler);
        router.put('/books/:id', this.replace.bind(this) as IHandler);
        router.patch('/books/:id', this.update.bind(this) as IHandler);
        router.delete('/books/:id', this.delete.bind(this) as IHandler);
    }

    public async list(
        req: IListRequest<unknown, IQueryBook>,
        res: IListResponse<IReadBook>,
        next: INextFunction,
    ): Promise<void> {
        const bookRepository = this.bookRepositoryFactory.getInstance();
        try {
            const query = req.getQuery();
            const books = await bookRepository.findByQuery(query);
            res.status(200).json(books);
        } catch (error: unknown) {
            await next.call(error as Error);
        }
    }

    public async create(
        req: ICreateRequest<unknown, ICreateBook>,
        res: ISingleResponse<IReadBook>,
        next: INextFunction,
    ): Promise<void> {
        const bookRepository = this.bookRepositoryFactory.getInstance();
        try {
            const newBook = await bookRepository.create(req.getBody());
            res.status(201).json(newBook);
        } catch (error: unknown) {
            await next.call(error as Error);
        }
    }

    public async read(
        req: IReadRequest<IAcessByIndexParams>,
        res: ISingleResponse<IReadBook>,
        next: INextFunction,
    ): Promise<void> {
        const bookRepository = this.bookRepositoryFactory.getInstance();
        const id = req.getParams().id;
        try {
            const book = await bookRepository.findById(id);
            if (book) {
                res.status(200).json(book);
            } else {
                throw new ResourceNotFoundError('Book', id);
            }
        } catch (error: unknown) {
            await next.call(error as Error);
        }
    }

    public async replace(
        req: IReplaceRequest<IAcessByIndexParams, ICreateBook>,
        res: ISingleResponse<IReadBook>,
        next: INextFunction,
    ): Promise<void> {
        const bookRepository = this.bookRepositoryFactory.getInstance();
        const id = req.getParams().id;
        try {
            const book = await bookRepository.replace(id, req.getBody());
            res.status(200).json(book);
        } catch (error: unknown) {
            await next.call(error as Error);
        }
    }

    public async update(
        req: IUpdateRequest<IAcessByIndexParams, IUpdateBook>,
        res: ISingleResponse<IReadBook>,
        next: INextFunction,
    ): Promise<void> {
        const bookRepository = this.bookRepositoryFactory.getInstance();
        const id = req.getParams().id;
        try {
            const book = await bookRepository.update(id, req.getBody());
            if (book) {
                res.status(200).json(book);
            } else {
                throw new ResourceNotFoundError('Book', id);
            }
        } catch (error: unknown) {
            await next.call(error as Error);
        }
    }

    public async delete(
        req: IDeleteRequest<IAcessByIndexParams>,
        res: INoResponse,
        next: INextFunction,
    ): Promise<void> {
        const bookRepository = this.bookRepositoryFactory.getInstance();
        const id = req.getParams().id;
        try {
            await bookRepository.delete(id);
            res.status(204).send();
        } catch (error: unknown) {
            await next.call(error as Error);
        }
    }
}

export default BookController;
