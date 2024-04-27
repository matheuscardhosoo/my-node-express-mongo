export interface IBookPriceObject {
    value: number;
    currency: string;
}

export interface IBookAuthorObject {
    id?: string;
    name: string;
}

interface IBookBase {
    title: string;
    description?: string;
    price?: IBookPriceObject;
    numberOfPages?: number;
}

export interface IBook extends IBookBase {
    id?: string;
    authors?: string[];
}

export interface IReadBook extends IBookBase {
    id?: string;
    authors?: IBookAuthorObject[];
}

export interface ICreateBook extends IBookBase {
    authors?: string[];
}

export interface IUpdateBook extends IBookBase {
    authors?: string[];
}

export interface IFilterBook extends Record<string, unknown> {
    title__ilike?: string;
    numberOfPages__gte?: number;
    numberOfPages__lte?: number;
    authors__name__ilike?: string;
}

export interface IBookRepository {
    create: (data: ICreateBook) => Promise<IReadBook>;
    count: (filter: IFilterBook) => Promise<number>;
    find: (filter: IFilterBook, page?: number, pageSize?: number, sort?: string) => Promise<IReadBook[]>;
    findById: (id: string) => Promise<IReadBook>;
    replace: (id: string, data: ICreateBook) => Promise<IReadBook>;
    update: (id: string, data: IUpdateBook) => Promise<IReadBook>;
    delete: (id: string) => Promise<void>;
}
