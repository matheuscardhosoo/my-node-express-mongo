import "dotenv/config";
import express from "express";

import connectDatabase from "./config/mongodb.js";
import Book from "./models/book.js";


const databaseConnection = await connectDatabase();


const app = express();
app.use(express.json());

app.get("/books", async (req, res) => {
    const books = await Book.find({});
    res.status(200).json(books);
});

app.post("/books", async (req, res) => {
    const createdBook = new Book(req.body);
    await createdBook.save();
    res.status(201).json(createdBook);
});

app.get("/books/:id", async (req, res) => {
    const id = req.params.id;
    const book = await Book.findById(id);
    if (book) {
        res.status(200).json(book);
    } else {
        res.status(404).json({message: "Book not found"});
    }
});

app.patch("/books/:id", async (req, res) => {
    const id = req.params.id;
    const oldBook = await Book.findByIdAndUpdate(id, req.body)
    if (oldBook) {
        const updatedBook = await Book.findById(id);
        res.status(200).json(updatedBook);
    } else {
        res.status(404).json({ message: "Book not found" });
    }
});

app.put("/books/:id", async (req, res) => {
    const id = req.params.id;
    const oldBook = await Book.findOneAndReplace({_id: id}, req.body);
    if (oldBook) {
        const updatedBook = await Book.findById(id);
        res.status(200).json(updatedBook);
    } else {
        const createdBook = new Book(req.body);
        await createdBook.save();
        res.status(201).json(createdBook);
    }
});

app.delete("/books/:id", async (req, res) => {
    const id = req.params.id;
    await Book.findByIdAndDelete(id);
    res.status(204).send();
})

export default app;