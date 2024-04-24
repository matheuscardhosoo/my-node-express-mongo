import express, { Application, Request, Response } from 'express';
import Book, { IBook } from './models/book';

const app: Application = express();
app.use(express.json());

app.get('/books', async (req: Request, res: Response) => {
    try {
        const books: IBook[] = await Book.find({});
        res.status(200).json(books);
    } catch (error: unknown) {
        console.log('Unexpected error:', error);
        res.status(500).json({message: 'Unexpected error'});
    }
});

app.post('/books', async (req: Request, res: Response) => {
    try {
        const createdBook: IBook = new Book(req.body);
        await createdBook.save();
        res.status(201).json(createdBook);
    } catch (error: unknown) {
        console.log('Unexpected error:', error);
        res.status(500).json({message: 'Unexpected error'});
    }
});

app.get('/books/:id', async (req: Request, res: Response) => {
    const id: string = req.params.id;
    try {
        const book: IBook | null = await Book.findById(id);
        if (book) {
            res.status(200).json(book);
        } else {
            res.status(404).json({message: 'Book not found'});
        }
    } catch (error: unknown) {
        console.log('Unexpected error:', error);
        res.status(500).json({message: 'Unexpected error'});
    }
});

app.patch('/books/:id', async (req: Request, res: Response) => {
    const id: string = req.params.id;
    try {
        const oldBook: IBook | null = await Book.findByIdAndUpdate(id, req.body);
        if (oldBook) {
            const updatedBook: IBook | null = await Book.findById(id);
            res.status(200).json(updatedBook);
        } else {
            res.status(404).json({ message: 'Book not found' });
        }
    } catch (error: unknown) {
        console.log('Unexpected error:', error);
        res.status(500).json({message: 'Unexpected error'});
    }
});

app.put('/books/:id', async (req: Request, res: Response) => {
    const id: string = req.params.id;
    try {
        const oldBook: IBook | null = await Book.findOneAndReplace({_id: id}, req.body);
        if (oldBook) {
            const updatedBook: IBook | null = await Book.findById(id);
            res.status(200).json(updatedBook);
        } else {
            const createdBook: IBook = new Book(req.body);
            await createdBook.save();
            res.status(201).json(createdBook);
        }
    } catch (error: unknown) {
        console.log('Unexpected error:', error);
        res.status(500).json({message: 'Unexpected error'});
    }
});

app.delete('/books/:id', async (req: Request, res: Response) => {
    const id: string = req.params.id;
    try {
        await Book.findByIdAndDelete(id);
        res.status(204).send();
    } catch (error: unknown) {
        console.log('Unexpected error:', error);
        res.status(500).json({message: 'Unexpected error'});
    }
});

export default app;