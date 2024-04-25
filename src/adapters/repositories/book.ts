import { ICreateBook, IReadBook, IUpdateBook, IBookRepository } from '../../domain/dependency_inversion/book';
import BookModel from '../models/book';

export class BookRepository implements IBookRepository {
    async create(data: ICreateBook): Promise<IReadBook> {
        return await BookModel.create(data);
    }

    async findAll(): Promise<IReadBook[]> {
        return await BookModel.find({});
    }

    async findById(id: string): Promise<IReadBook | null> {
        return await BookModel.findById(id);
    }

    async replace(id: string, data: ICreateBook): Promise<IReadBook | null> {
        const oldBook: IReadBook | null = await BookModel.findOneAndReplace({ _id: id }, data);
        if (!oldBook) {
            return await this.create(data);
        }
        return await this.findById(id);
    }

    async update(id: string, data: IUpdateBook): Promise<IReadBook | null> {
        const oldBook: IReadBook | null = await BookModel.findByIdAndUpdate(id, data);
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
