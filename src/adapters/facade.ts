import { AdaptersErrorHandler, PathNotFoundHandler } from './controllers/handlers';

import AuthorController from './controllers/author';
import { AuthorRepositoryFactory } from './repositories/author';
import BookController from './controllers/book';
import { BookRepositoryFactory } from './repositories/book';
import { IApiAdapter } from './dependency_inversion/api';
import { IDatabaseErrorAdapter } from './dependency_inversion/database';

class AdaptersFacade {
    constructor(apiAdapter: IApiAdapter, databaseErrorAdapter: IDatabaseErrorAdapter) {
        const authorRepositoryFactory = new AuthorRepositoryFactory(databaseErrorAdapter);
        const authorRouter = apiAdapter.createRouter();
        new AuthorController(authorRouter, authorRepositoryFactory);

        const bookRepositoryFactory = new BookRepositoryFactory(databaseErrorAdapter);
        const bookRouter = apiAdapter.createRouter();
        new BookController(bookRouter, bookRepositoryFactory);

        apiAdapter.addNextHandler(PathNotFoundHandler);
        apiAdapter.addErrorHandler(AdaptersErrorHandler);
    }
}

export default AdaptersFacade;
