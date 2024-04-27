import { IRequestQuery } from '../../dependency_inversion/api';
import { RequestValidationError } from '../errors';

export class BaseRequestQuery {
    protected parseStringQuery<T = string>(
        query: IRequestQuery,
        key: string,
        parseFunction: (value: string) => T = (value: string) => value as unknown as T,
    ): T | undefined {
        if (key in query) {
            const value = query[key];
            if (typeof value === 'string') return parseFunction(value);
            throw new RequestValidationError({ [key]: 'Query parameter should be a string' });
        }
        return undefined;
    }
}

export class PaginatedListRequestQuery extends BaseRequestQuery {
    readonly page: number;

    readonly pageSize: number;

    readonly sort: string;

    constructor(query: IRequestQuery) {
        super();
        this.page = this.parseStringQuery(query, 'page', parseInt) || 1;
        this.pageSize = this.parseStringQuery(query, 'pageSize', parseInt) || 20;
        this.sort = this.parseStringQuery(query, 'sort') || 'id';
    }

    private validate(): void {
        if (this.page < 1) throw new RequestValidationError({ page: 'Query parameter page should be greater than 0' });
        if (this.pageSize < 1)
            throw new RequestValidationError({ pageSize: 'Query parameter pageSize should be greater than 0' });
        if (this.pageSize > 100)
            throw new RequestValidationError({ pageSize: 'Query parameter pageSize should be less than 100' });
    }
}
