export interface ICreateBook {
    title: string;
    description?: string;
}

export interface IReadBook extends ICreateBook {
    id: string;
}

export interface IUpdateBook {
    description?: string;
}

export interface IBookRepository {
    create: (data: ICreateBook) => Promise<IReadBook>;
    findAll: () => Promise<IReadBook[]>;
    findById: (id: string) => Promise<IReadBook | null>;
    replace: (id: string, data: ICreateBook) => Promise<IReadBook | null>;
    update: (id: string, data: IUpdateBook) => Promise<IReadBook | null>;
    delete: (id: string) => Promise<void>;
}
