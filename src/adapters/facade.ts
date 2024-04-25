import AuthorController from './controllers/author';
import BookController from './controllers/book';
import { AuthorRepositoryFactory } from './repositories/author';
import { BookRepositoryFactory } from './repositories/book';
import { IApiAdapter } from './dependency_inversion/api';

class AdaptersFacade {
    constructor(apiAdapter: IApiAdapter) {
        const authorRepositoryFactory = new AuthorRepositoryFactory();
        const authorRouter = apiAdapter.createRouter();
        const authorController = new AuthorController(authorRouter, authorRepositoryFactory);
        
        const bookRepositoryFactory = new BookRepositoryFactory();
        const bookRouter = apiAdapter.createRouter();
        const bookController = new BookController(bookRouter, bookRepositoryFactory);
    }
}

export default AdaptersFacade;