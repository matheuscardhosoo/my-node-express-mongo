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

export interface IBookRepository {
    create: (data: ICreateBook) => Promise<IReadBook>;
    findAll: () => Promise<IReadBook[]>;
    findById: (id: string) => Promise<IReadBook>;
    replace: (id: string, data: ICreateBook) => Promise<IReadBook>;
    update: (id: string, data: IUpdateBook) => Promise<IReadBook>;
    delete: (id: string) => Promise<void>;
}
