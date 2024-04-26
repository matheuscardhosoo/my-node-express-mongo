export interface IAuthorBookObject {
    id?: string;
    title: string;
}

interface IAuthorBase {
    name: string;
    birthDate?: Date;
}

export interface IAuthor extends IAuthorBase {
    id?: string;
    books?: string[];
}

export interface IReadAuthor extends IAuthorBase {
    id?: string;
    books?: IAuthorBookObject[];
}

export interface ICreateAuthor extends IAuthorBase {
    books?: string[];
}

export interface IUpdateAuthor extends IAuthorBase {
    books?: string[];
}

export interface IAuthorRepository {
    create: (data: ICreateAuthor) => Promise<IReadAuthor>;
    findAll: () => Promise<IReadAuthor[]>;
    findById: (id: string) => Promise<IReadAuthor | null>;
    replace: (id: string, data: ICreateAuthor) => Promise<IReadAuthor>;
    update: (id: string, data: IUpdateAuthor) => Promise<IReadAuthor | null>;
    delete: (id: string) => Promise<void>;
}
