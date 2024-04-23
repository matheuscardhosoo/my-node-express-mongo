import express from "express";

const app = express();

app.get("/", (req, res) => {
    res.status(200).send("Welcome to the homepage!");
});

app.get("/about", (req, res) => {
    res.status(200).send("Welcome to the about page!");
});

app.get("/contact", (req, res) => {
    res.status(200).send("Welcome to the contact page!");
});

export default app;