import { BookController } from './controllers/book';
import { BookRepositoryFactory } from './repositories/book';
import { IApiAdapter } from './dependency_inversion/api';

class AdaptersFacade {
    constructor(apiManager: IApiAdapter) {
        const bookRepositoryFactory = new BookRepositoryFactory();
        const bookController = new BookController(bookRepositoryFactory);

        apiManager.get('/books', bookController.list.bind(bookController));
        apiManager.post('/books', bookController.create.bind(bookController));
        apiManager.get('/books/:id', bookController.read.bind(bookController));
        apiManager.put('/books/:id', bookController.replace.bind(bookController));
        apiManager.patch('/books/:id', bookController.update.bind(bookController));
        apiManager.delete('/books/:id', bookController.delete.bind(bookController));
    }
}

export default AdaptersFacade;