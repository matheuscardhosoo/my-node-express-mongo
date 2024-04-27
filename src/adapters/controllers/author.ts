import { AuthorRepository, AuthorRepositoryFactory } from '../repositories/author';
import {
    IAcessByIndexParams,
    ICreateRequest,
    IDeleteRequest,
    IListRequest,
    IListRequestQuery,
    INoResponse,
    IPaginatedListResponse,
    IPaginatedListResponseBody,
    IReadRequest,
    IReplaceRequest,
    ISingleResponse,
    IUpdateRequest,
} from './interfaces';
import { ICreateAuthor, IFilterAuthor, IReadAuthor, IUpdateAuthor } from '../../domain/dependency_inversion/author';
import { IHandler, INextFunction, IRouter } from '../dependency_inversion/api';

import { ResourceNotFoundError } from '../repositories/errors';

interface IAuthorRequestQuery extends IListRequestQuery {
    name__ilike?: string;
    birthDate__gte?: string;
    birthDate__lte?: string;
    books__title__ilike?: string;
}

class AuthorController {
    private authorRepositoryFactory: AuthorRepositoryFactory;

    constructor(router: IRouter, authorRepositoryFactory: AuthorRepositoryFactory) {
        this.authorRepositoryFactory = authorRepositoryFactory;

        router.get('/authors', this.list.bind(this) as IHandler);
        router.post('/authors', this.create.bind(this) as IHandler);
        router.get('/authors/:id', this.read.bind(this) as IHandler);
        router.put('/authors/:id', this.replace.bind(this) as IHandler);
        router.patch('/authors/:id', this.update.bind(this) as IHandler);
        router.delete('/authors/:id', this.delete.bind(this) as IHandler);
    }

    public async list(
        req: IListRequest<unknown, IAuthorRequestQuery>,
        res: IPaginatedListResponse<IReadAuthor>,
        next: INextFunction,
    ): Promise<void> {
        const authorRepository = this.authorRepositoryFactory.getInstance();
        try {
            const query = req.getQuery();
            const page = query.page ? parseInt(query.page, 10) : undefined;
            const pageSize = query.pageSize ? parseInt(query.pageSize, 10) : undefined;
            const sort = query.sort;
            const filter: IFilterAuthor = {
                name__ilike: query.name__ilike,
                birthDate__gte: query.birthDate__gte ? new Date(query.birthDate__gte) : undefined,
                birthDate__lte: query.birthDate__lte ? new Date(query.birthDate__lte) : undefined,
                books__title__ilike: query.books__title__ilike,
            };
            const total = await authorRepository.count(filter);
            const authors = await authorRepository.find(filter, page, pageSize, sort);
            const responseBody: IPaginatedListResponseBody<IReadAuthor> = {
                data: authors,
                total: total,
                page: page || 1,
                pageSize: authors.length,
            };
            res.status(200).json(responseBody);
        } catch (error: unknown) {
            await next.call(error as Error);
        }
    }

    public async create(
        req: ICreateRequest<unknown, ICreateAuthor>,
        res: ISingleResponse<IReadAuthor>,
        next: INextFunction,
    ): Promise<void> {
        const authorRepository: AuthorRepository = this.authorRepositoryFactory.getInstance();
        try {
            const newAuthor = await authorRepository.create(req.getBody());
            res.status(201).json(newAuthor);
        } catch (error: unknown) {
            await next.call(error as Error);
        }
    }

    public async read(
        req: IReadRequest<IAcessByIndexParams>,
        res: ISingleResponse<IReadAuthor>,
        next: INextFunction,
    ): Promise<void> {
        const authorRepository: AuthorRepository = this.authorRepositoryFactory.getInstance();
        const id = req.getParams().id;
        try {
            const author = await authorRepository.findById(id);
            if (author) {
                res.status(200).json(author);
            } else {
                throw new ResourceNotFoundError('Author', id);
            }
        } catch (error: unknown) {
            await next.call(error as Error);
        }
    }

    public async replace(
        req: IReplaceRequest<IAcessByIndexParams, ICreateAuthor>,
        res: ISingleResponse<IReadAuthor>,
        next: INextFunction,
    ): Promise<void> {
        const authorRepository: AuthorRepository = this.authorRepositoryFactory.getInstance();
        const id = req.getParams().id;
        try {
            const updatedAuthor = await authorRepository.replace(id, req.getBody());
            res.status(200).json(updatedAuthor);
        } catch (error: unknown) {
            await next.call(error as Error);
        }
    }

    public async update(
        req: IUpdateRequest<IAcessByIndexParams, IUpdateAuthor>,
        res: ISingleResponse<IReadAuthor>,
        next: INextFunction,
    ): Promise<void> {
        const authorRepository: AuthorRepository = this.authorRepositoryFactory.getInstance();
        const id = req.getParams().id;
        try {
            const updatedAuthor = await authorRepository.update(id, req.getBody());
            if (updatedAuthor) {
                res.status(200).json(updatedAuthor);
            } else {
                throw new ResourceNotFoundError('Author', id);
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
        const authorRepository = this.authorRepositoryFactory.getInstance();
        const id = req.getParams().id;
        try {
            await authorRepository.delete(id);
            res.status(204).send();
        } catch (error: unknown) {
            await next.call(error as Error);
        }
    }
}

export default AuthorController;
