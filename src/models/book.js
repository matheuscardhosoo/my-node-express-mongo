import mongoose from "mongoose";

const bookSchema = new mongoose.Schema({
    id: {
        type: mongoose.Schema.Types.ObjectId,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: false,
    },
}, {versionKey: false});

const Book = mongoose.model("Book", bookSchema);

export default Book;
