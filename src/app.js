import express from "express";

import books from "./books.js";

const app = express();
app.use(express.json());

app.get("/books", (req, res) => {
    res.status(200).json(books);
});

app.post("/books", (req, res) => {
    books.push(req.body);
    res.status(201).json(new_book);
});

app.get("/books/:id", (req, res) => {
    const id = req.params.id;
    const book = books.find((book) => book.id === parseInt(id));
    if (book) {
        res.status(200).json(book);
    } else {
        res.status(404).json({ error: "Book not found" });
    }
});

app.put("/books/:id", (req, res) => {
    const id = req.params.id;
    const index = books.findIndex((book) => book.id === parseInt(id));
    if (index !== -1) {
        books[index] = req.body;
        res.status(200).json(books[index]);
    } else {
        books.push(req.body);
        res.status(201).json(new_book);
    }
});

app.patch("/books/:id", (req, res) => {
    const id = req.params.id;
    const index = books.findIndex((book) => book.id === parseInt(id));
    if (index !== -1) {
        books[index] = { ...books[index], ...req.body };
        res.status(200).json(books[index]);
    } else {
        res.status(404).json({ error: "Book not found" });
    }
});

app.delete("/books/:id", (req, res) => {
    const id = req.params.id;
    const index = books.findIndex((book) => book.id === parseInt(id));
    if (index != -1) {
        books.splice(index, 1);
        res.status(204).json();
    } else {
        res.status(404).json({ error: "Book not found" });
    }
})

export default app;