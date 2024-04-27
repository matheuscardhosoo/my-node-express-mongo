import { AuthorRepository, AuthorRepositoryFactory } from '../repositories/author';
import { ICreateAuthor, IFilterAuthor, IReadAuthor, IUpdateAuthor } from '../../domain/dependency_inversion/author';
import { IHandler, INextFunction, IRequest, IRequestBody, IRequestQuery, IRouter } from '../dependency_inversion/api';
import { INoResponse, IPaginatedListResponse, IPaginatedListResponseBody, ISingleResponse } from './interfaces';

import { AccessByIdRequestParams } from './base/request_params';
import { BaseRequestBody } from './base/request_body';
import { PaginatedListRequestQuery } from './base/request_query';
import { ResourceNotFoundError } from '../repositories/errors';

class AuthorRequestQuery extends PaginatedListRequestQuery {
    readonly filter: IFilterAuthor;

    constructor(query: IRequestQuery) {
        super(query);
        this.filter = {
            name__ilike: this.parseStringQuery(query, 'name__ilike'),
            birthDate__gte: this.parseStringQuery(query, 'birthDate__gte', (v: string) => new Date(v)),
            birthDate__lte: this.parseStringQuery(query, 'birthDate__lte', (v: string) => new Date(v)),
            books__title__ilike: this.parseStringQuery(query, 'books__title__ilike'),
        };
    }
}

class CreateAuthorRequestBody extends BaseRequestBody implements ICreateAuthor {
    readonly name: string;

    readonly birthDate: Date;

    constructor(body: IRequestBody) {
        super();
        this.name = body.name as string;
        this.birthDate = body.birthDate as Date;
    }
}

class UpdateAuthorRequestBody extends BaseRequestBody implements IUpdateAuthor {
    readonly name?: string;

    readonly birthDate?: Date;

    constructor(body: IRequestBody) {
        super();
        this.name = body.name as string;
        this.birthDate = body.birthDate as Date;
    }
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

    public async list(req: IRequest, res: IPaginatedListResponse<IReadAuthor>, next: INextFunction): Promise<void> {
        const authorRepository = this.authorRepositoryFactory.getInstance();
        try {
            const query = new AuthorRequestQuery(req.getQuery());
            const total = await authorRepository.count(query.filter);
            const authors = await authorRepository.find(query.filter, query.page, query.pageSize, query.sort);
            const responseBody: IPaginatedListResponseBody<IReadAuthor> = {
                data: authors,
                total: total,
                page: query.page,
                pageSize: authors.length,
            };
            res.status(200).json(responseBody);
        } catch (error: unknown) {
            await next.call(error as Error);
        }
    }

    public async create(req: IRequest, res: ISingleResponse<IReadAuthor>, next: INextFunction): Promise<void> {
        const authorRepository: AuthorRepository = this.authorRepositoryFactory.getInstance();
        try {
            const body = new CreateAuthorRequestBody(req.getBody());
            const newAuthor = await authorRepository.create(body);
            res.status(201).json(newAuthor);
        } catch (error: unknown) {
            await next.call(error as Error);
        }
    }

    public async read(req: IRequest, res: ISingleResponse<IReadAuthor>, next: INextFunction): Promise<void> {
        const authorRepository: AuthorRepository = this.authorRepositoryFactory.getInstance();
        try {
            const params = new AccessByIdRequestParams(req.getParams());
            const author = await authorRepository.findById(params.id);
            if (author) {
                res.status(200).json(author);
            } else {
                throw new ResourceNotFoundError('Author', params.id);
            }
        } catch (error: unknown) {
            await next.call(error as Error);
        }
    }

    public async replace(req: IRequest, res: ISingleResponse<IReadAuthor>, next: INextFunction): Promise<void> {
        const authorRepository: AuthorRepository = this.authorRepositoryFactory.getInstance();
        try {
            const params = new AccessByIdRequestParams(req.getParams());
            const body = new CreateAuthorRequestBody(req.getBody());
            const updatedAuthor = await authorRepository.replace(params.id, body);
            res.status(200).json(updatedAuthor);
        } catch (error: unknown) {
            await next.call(error as Error);
        }
    }

    public async update(req: IRequest, res: ISingleResponse<IReadAuthor>, next: INextFunction): Promise<void> {
        const authorRepository: AuthorRepository = this.authorRepositoryFactory.getInstance();
        try {
            const params = new AccessByIdRequestParams(req.getParams());
            const body = new UpdateAuthorRequestBody(req.getBody());
            const updatedAuthor = await authorRepository.update(params.id, body);
            if (updatedAuthor) {
                res.status(200).json(updatedAuthor);
            } else {
                throw new ResourceNotFoundError('Author', params.id);
            }
        } catch (error: unknown) {
            await next.call(error as Error);
        }
    }

    public async delete(req: IRequest, res: INoResponse, next: INextFunction): Promise<void> {
        const authorRepository = this.authorRepositoryFactory.getInstance();
        try {
            const params = new AccessByIdRequestParams(req.getParams());
            await authorRepository.delete(params.id);
            res.status(204).send();
        } catch (error: unknown) {
            await next.call(error as Error);
        }
    }
}

export default AuthorController;
