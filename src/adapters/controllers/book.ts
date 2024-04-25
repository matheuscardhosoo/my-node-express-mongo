import { IController } from "./interfaces";
import { IRequest, IResponse, INextFunction, IApiAdapter } from "../dependency_inversion/api";
import { IReadBook } from "../../domain/book";
import { BookRepository, BookRepositoryFactory } from "../repositories/book";


export class BookController implements IController {
    private bookRepositoryFactory: BookRepositoryFactory;

    constructor(bookRepositoryFactory: BookRepositoryFactory) {
        this.bookRepositoryFactory = bookRepositoryFactory;
    }

    public async list(req: IRequest, res: IResponse, next: INextFunction): Promise<void> {
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

    public async create(req: IRequest, res: IResponse, next: INextFunction): Promise<void> {
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

    public async read(req: IRequest, res: IResponse, next: INextFunction): Promise<void> {
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

    public async replace(req: IRequest, res: IResponse, next: INextFunction): Promise<void> {
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

    public async update(req: IRequest, res: IResponse, next: INextFunction): Promise<void> {
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

    public async delete(req: IRequest, res: IResponse, next: INextFunction): Promise<void> {
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
