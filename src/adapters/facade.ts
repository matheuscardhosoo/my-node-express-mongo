import { BookController } from './controllers/book';
import { BookRepositoryFactory } from './repositories/book';
import { IApiAdapter } from './dependency_inversion/api';

class AdaptersFacade {
    constructor(apiAdapter: IApiAdapter) {
        const bookRepositoryFactory = new BookRepositoryFactory();
        const bookRouter = apiAdapter.createRouter();
        const bookController = new BookController(bookRouter, bookRepositoryFactory);
    }
}

export default AdaptersFacade;