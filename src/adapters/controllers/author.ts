import { AuthorRepository, AuthorRepositoryFactory } from '../repositories/author';
import { ICreateAuthor, IReadAuthor, IUpdateAuthor } from '../../domain/dependency_inversion/author';
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

class AuthorController {
    private authorRepositoryFactory: AuthorRepositoryFactory;

    constructor(router: IRouter, authorRepositoryFactory: AuthorRepositoryFactory) {
        this.authorRepositoryFactory = authorRepositoryFactory;

        router.get('/authors', this.list.bind(this));
        router.post('/authors', this.create.bind(this));
        router.get('/authors/:id', this.read.bind(this));
        router.put('/authors/:id', this.replace.bind(this));
        router.patch('/authors/:id', this.update.bind(this));
        router.delete('/authors/:id', this.delete.bind(this));
    }

    public async list(
        req: IListRequest<IReadAuthor>,
        res: IListResponse<IReadAuthor>,
        next: NextFunction,
    ): Promise<void> {
        const authorRepository: AuthorRepository = this.authorRepositoryFactory.getInstance();
        try {
            const authors: IReadAuthor[] = await authorRepository.findAll();
            res.status(200).json(authors);
        } catch (error: unknown) {
            console.log('Unexpected error:', error);
            res.status(500).json({ message: 'Unexpected error' });
        } finally {
            next();
        }
    }

    public async create(
        req: ICreateRequest<IReadAuthor, ICreateAuthor>,
        res: IResponse<IReadAuthor>,
        next: NextFunction,
    ): Promise<void> {
        const authorRepository: AuthorRepository = this.authorRepositoryFactory.getInstance();
        try {
            const newAuthor: IReadAuthor = await authorRepository.create(req.body);
            res.status(201).json(newAuthor);
        } catch (error: unknown) {
            console.log('Unexpected error:', error);
            res.status(500).json({ message: 'Unexpected error' });
        } finally {
            next();
        }
    }

    public async read(req: IReadRequest<IReadAuthor>, res: IResponse<IReadAuthor>, next: NextFunction): Promise<void> {
        const authorRepository: AuthorRepository = this.authorRepositoryFactory.getInstance();
        const id: string = req.params.id;
        try {
            const author: IReadAuthor | null = await authorRepository.findById(id);
            if (author) {
                res.status(200).json(author);
            } else {
                res.status(404).json({ message: 'Author not found' });
            }
        } catch (error: unknown) {
            console.log('Unexpected error:', error);
            res.status(500).json({ message: 'Unexpected error' });
        } finally {
            next();
        }
    }

    public async replace(
        req: IReplaceRequest<IReadAuthor, ICreateAuthor>,
        res: IResponse<IReadAuthor>,
        next: NextFunction,
    ): Promise<void> {
        const authorRepository: AuthorRepository = this.authorRepositoryFactory.getInstance();
        const id: string = req.params.id;
        try {
            const updatedAuthor: IReadAuthor = await authorRepository.replace(id, req.body);
            res.status(200).json(updatedAuthor);
        } catch (error: unknown) {
            console.log('Unexpected error:', error);
            res.status(500).json({ message: 'Unexpected error' });
        } finally {
            next();
        }
    }

    public async update(
        req: IUpdateRequest<IReadAuthor, IUpdateAuthor>,
        res: IResponse<IReadAuthor>,
        next: NextFunction,
    ): Promise<void> {
        const authorRepository: AuthorRepository = this.authorRepositoryFactory.getInstance();
        const id: string = req.params.id;
        try {
            const updatedAuthor: IReadAuthor | null = await authorRepository.update(id, req.body);
            if (updatedAuthor) {
                res.status(200).json(updatedAuthor);
            } else {
                res.status(404).json({ message: 'Author not found' });
            }
        } catch (error: unknown) {
            console.log('Unexpected error:', error);
            res.status(500).json({ message: 'Unexpected error' });
        } finally {
            next();
        }
    }

    public async delete(req: IDeleteRequest, res: INoResponse, next: NextFunction): Promise<void> {
        const authorRepository: AuthorRepository = this.authorRepositoryFactory.getInstance();
        const id: string = req.params.id;
        try {
            await authorRepository.delete(id);
            res.status(204).send();
        } catch (error: unknown) {
            console.log('Unexpected error:', error);
            res.status(500).json({ message: 'Unexpected error' });
        } finally {
            next();
        }
    }
}

export default AuthorController;
