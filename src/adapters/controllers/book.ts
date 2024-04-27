import {
    IBookPriceObject,
    ICreateBook,
    IFilterBook,
    IReadBook,
    IUpdateBook,
} from '../../domain/dependency_inversion/book';
import { IHandler, INextFunction, IRequest, IRequestBody, IRequestQuery, IRouter } from '../dependency_inversion/api';
import { INoResponse, IPaginatedListResponse, IPaginatedListResponseBody, ISingleResponse } from './interfaces';

import { AccessByIdRequestParams } from './base/request_params';
import { BaseRequestBody } from './base/request_body';
import { BookRepositoryFactory } from '../repositories/book';
import { PaginatedListRequestQuery } from './base/request_query';
import { ResourceNotFoundError } from '../repositories/errors';

class BookRequestQuery extends PaginatedListRequestQuery {
    readonly filter: IFilterBook;

    constructor(query: IRequestQuery) {
        super(query);
        this.filter = {
            title__ilike: this.parseStringQuery(query, 'title__ilike'),
            numberOfPages__gte: this.parseStringQuery(query, 'numberOfPages__gte', parseInt),
            numberOfPages__lte: this.parseStringQuery(query, 'numberOfPages__lte', parseInt),
            authors__name__ilike: this.parseStringQuery(query, 'authors__name__ilike'),
        };
    }
}

class CreateBookRequestBody extends BaseRequestBody implements ICreateBook {
    readonly title: string;

    readonly description?: string;

    readonly price?: IBookPriceObject;

    readonly numberOfPages?: number;

    readonly authors?: string[];

    constructor(body: IRequestBody) {
        super();
        this.title = body.title as string;
        this.description = body.description as string;
        this.price = body.price as IBookPriceObject;
        this.numberOfPages = body.numberOfPages as number;
        this.authors = body.authors as string[];
    }
}

class UpdateBookRequestBody extends BaseRequestBody implements IUpdateBook {
    readonly title?: string;

    readonly description?: string;

    readonly price?: IBookPriceObject;

    readonly numberOfPages?: number;

    readonly authors?: string[];

    constructor(body: IRequestBody) {
        super();
        this.title = body.title as string;
        this.description = body.description as string;
        this.price = body.price as IBookPriceObject;
        this.numberOfPages = body.numberOfPages as number;
        this.authors = body.authors as string[];
    }
}

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

    public async list(req: IRequest, res: IPaginatedListResponse<IReadBook>, next: INextFunction): Promise<void> {
        const bookRepository = this.bookRepositoryFactory.getInstance();
        try {
            const query = new BookRequestQuery(req.getQuery());
            const total = await bookRepository.count(query.filter);
            const books = await bookRepository.find(query.filter, query.page, query.pageSize, query.sort);
            const responseBody: IPaginatedListResponseBody<IReadBook> = {
                data: books,
                total: total,
                page: query.page,
                pageSize: books.length,
            };
            res.status(200).json(responseBody);
        } catch (error: unknown) {
            await next.call(error as Error);
        }
    }

    public async create(req: IRequest, res: ISingleResponse<IReadBook>, next: INextFunction): Promise<void> {
        const bookRepository = this.bookRepositoryFactory.getInstance();
        try {
            const body = new CreateBookRequestBody(req.getBody());
            const newBook = await bookRepository.create(body);
            res.status(201).json(newBook);
        } catch (error: unknown) {
            await next.call(error as Error);
        }
    }

    public async read(req: IRequest, res: ISingleResponse<IReadBook>, next: INextFunction): Promise<void> {
        const bookRepository = this.bookRepositoryFactory.getInstance();
        try {
            const params = new AccessByIdRequestParams(req.getParams());
            const book = await bookRepository.findById(params.id);
            if (book) {
                res.status(200).json(book);
            } else {
                throw new ResourceNotFoundError('Book', params.id);
            }
        } catch (error: unknown) {
            await next.call(error as Error);
        }
    }

    public async replace(req: IRequest, res: ISingleResponse<IReadBook>, next: INextFunction): Promise<void> {
        const bookRepository = this.bookRepositoryFactory.getInstance();
        try {
            const params = new AccessByIdRequestParams(req.getParams());
            const body = new CreateBookRequestBody(req.getBody());
            const book = await bookRepository.replace(params.id, body);
            res.status(200).json(book);
        } catch (error: unknown) {
            await next.call(error as Error);
        }
    }

    public async update(req: IRequest, res: ISingleResponse<IReadBook>, next: INextFunction): Promise<void> {
        const bookRepository = this.bookRepositoryFactory.getInstance();
        try {
            const params = new AccessByIdRequestParams(req.getParams());
            const body = new UpdateBookRequestBody(req.getBody());
            const book = await bookRepository.update(params.id, body);
            if (book) {
                res.status(200).json(book);
            } else {
                throw new ResourceNotFoundError('Book', params.id);
            }
        } catch (error: unknown) {
            await next.call(error as Error);
        }
    }

    public async delete(req: IRequest, res: INoResponse, next: INextFunction): Promise<void> {
        const bookRepository = this.bookRepositoryFactory.getInstance();
        try {
            const params = new AccessByIdRequestParams(req.getParams());
            await bookRepository.delete(params.id);
            res.status(204).send();
        } catch (error: unknown) {
            await next.call(error as Error);
        }
    }
}

export default BookController;
