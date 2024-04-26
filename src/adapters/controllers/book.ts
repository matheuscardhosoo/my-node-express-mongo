import { BookRepository, BookRepositoryFactory } from '../repositories/book';
import { ICreateBook, IReadBook, IUpdateBook } from '../../domain/dependency_inversion/book';
import {
    ICreateRequest,
    IDeleteRequest,
    IListRequest,
    IListResponse,
    INoResponse,
    IReadRequest,
    IReplaceRequest,
    IResponse,
    IUpdateRequest,
} from './interfaces';

import { IRouter } from '../dependency_inversion/api';
import { NextFunction } from 'express';

class BookController {
    private bookRepositoryFactory: BookRepositoryFactory;

    constructor(router: IRouter, bookRepositoryFactory: BookRepositoryFactory) {
        this.bookRepositoryFactory = bookRepositoryFactory;

        router.get('/books', this.list.bind(this));
        router.post('/books', this.create.bind(this));
        router.get('/books/:id', this.read.bind(this));
        router.put('/books/:id', this.replace.bind(this));
        router.patch('/books/:id', this.update.bind(this));
        router.delete('/books/:id', this.delete.bind(this));
    }

    public async list(req: IListRequest<IReadBook>, res: IListResponse<IReadBook>, next: NextFunction): Promise<void> {
        const bookRepository: BookRepository = this.bookRepositoryFactory.getInstance();
        try {
            const books: IReadBook[] = await bookRepository.findAll();
            res.status(200).json(books);
        } catch (error: unknown) {
            console.log('Unexpected error:', error);
            res.status(500).json({ message: 'Unexpected error' });
        } finally {
            next();
        }
    }

    public async create(
        req: ICreateRequest<IReadBook, ICreateBook>,
        res: IResponse<IReadBook>,
        next: NextFunction,
    ): Promise<void> {
        const bookRepository: BookRepository = this.bookRepositoryFactory.getInstance();
        try {
            const newBook: IReadBook = await bookRepository.create(req.body);
            res.status(201).json(newBook);
        } catch (error: unknown) {
            console.log('Unexpected error:', error);
            res.status(500).json({ message: 'Unexpected error' });
        } finally {
            next();
        }
    }

    public async read(req: IReadRequest<IReadBook>, res: IResponse<IReadBook>, next: NextFunction): Promise<void> {
        const bookRepository: BookRepository = this.bookRepositoryFactory.getInstance();
        const id: string = req.params.id;
        try {
            const book: IReadBook | null = await bookRepository.findById(id);
            if (book) {
                res.status(200).json(book);
            } else {
                res.status(404).json({ message: 'Book not found' });
            }
        } catch (error: unknown) {
            console.log('Unexpected error:', error);
            res.status(500).json({ message: 'Unexpected error' });
        } finally {
            next();
        }
    }

    public async replace(
        req: IReplaceRequest<IReadBook, ICreateBook>,
        res: IResponse<IReadBook>,
        next: NextFunction,
    ): Promise<void> {
        const bookRepository: BookRepository = this.bookRepositoryFactory.getInstance();
        const id: string = req.params.id;
        try {
            const book: IReadBook | null = await bookRepository.replace(id, req.body);
            res.status(200).json(book);
        } catch (error: unknown) {
            console.log('Unexpected error:', error);
            res.status(500).json({ message: 'Unexpected error' });
        } finally {
            next();
        }
    }

    public async update(
        req: IUpdateRequest<IReadBook, IUpdateBook>,
        res: IResponse<IReadBook>,
        next: NextFunction,
    ): Promise<void> {
        const bookRepository: BookRepository = this.bookRepositoryFactory.getInstance();
        const id: string = req.params.id;
        try {
            const book: IReadBook | null = await bookRepository.update(id, req.body);
            if (book) {
                res.status(200).json(book);
            } else {
                res.status(404).json({ message: 'Book not found' });
            }
        } catch (error: unknown) {
            console.log('Unexpected error:', error);
            res.status(500).json({ message: 'Unexpected error' });
        } finally {
            next();
        }
    }

    public async delete(req: IDeleteRequest, res: INoResponse, next: NextFunction): Promise<void> {
        const bookRepository: BookRepository = this.bookRepositoryFactory.getInstance();
        const id: string = req.params.id;
        try {
            await bookRepository.delete(id);
            res.status(204).send();
        } catch (error: unknown) {
            console.log('Unexpected error:', error);
            res.status(500).json({ message: 'Unexpected error' });
        } finally {
            next();
        }
    }
}

export default BookController;
