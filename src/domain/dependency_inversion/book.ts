export interface IBookPriceObject {
    value: number;
    currency: string;
}

export interface ICreateBook {
    title: string;
    description?: string;
    price?: IBookPriceObject;
    numberOfPages?: number;
}

export interface IReadBook extends ICreateBook {
    _id: string;
}

export interface IUpdateBook extends ICreateBook{}

export interface IBookRepository {
    create: (data: ICreateBook) => Promise<IReadBook>;
    findAll: () => Promise<IReadBook[]>;
    findById: (id: string) => Promise<IReadBook | null>;
    replace: (id: string, data: ICreateBook) => Promise<IReadBook | null>;
    update: (id: string, data: IUpdateBook) => Promise<IReadBook | null>;
    delete: (id: string) => Promise<void>;
}
