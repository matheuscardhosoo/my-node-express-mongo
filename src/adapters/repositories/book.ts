import { ICreateBook, IReadBook, IUpdateBook, IBookRepository } from '../../domain/book';
import BookModel, { IBookDocument } from '../models/book';

export class BookRepository implements IBookRepository {
    async create(data: ICreateBook): Promise<IReadBook> {
        const document: IBookDocument = new BookModel(data);
        const newBook = await document.save();
        return {
            id: newBook._id,
            title: newBook.title,
            description: newBook.description,
        };
    }

    async findAll(): Promise<IReadBook[]> {
        const documents: IBookDocument[] = await BookModel.find({});
        return documents.map((document: IBookDocument) => ({
            id: document._id,
            title: document.title,
            description: document.description,
        }));
    }

    async findById(id: string): Promise<IReadBook | null> {
        const document: IBookDocument | null = await BookModel.findById(id);
        if (!document) {
            return null;
        }
        return {
            id: document._id,
            title: document.title,
            description: document.description,
        };
    }

    async replace(id: string, data: ICreateBook): Promise<IReadBook | null> {
        const oldBook: IBookDocument | null = await BookModel.findOneAndReplace({ _id: id }, data);
        if (!oldBook) {
            return await this.create(data);
        }
        return await this.findById(id);
    }

    async update(id: string, data: IUpdateBook): Promise<IReadBook | null> {
        const oldBook: IBookDocument | null = await BookModel.findByIdAndUpdate(id, data);
        if (!oldBook) {
            return null;
        }
        return await this.findById(id);
    }

    async delete(id: string): Promise<void> {
        await BookModel.findByIdAndDelete(id);
    }
}

export class BookRepositoryFactory {
    private instance: BookRepository | null = null;

    getInstance(): BookRepository {
        if (!this.instance) {
            this.instance = new BookRepository();
        }
        return this.instance;
    }
}
