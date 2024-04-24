import mongoose from "mongoose";


const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    console.error("MongoDB URI missing");
    process.exit(1);
}


async function connectDatabase() {
    console.log("Connecting to database");
    try {
        const databaseManager = await mongoose.connect(MONGODB_URI);
        const databaseConnection = databaseManager.connection;
        console.log("Database connected");
        return databaseConnection;
    } catch (error) {
        console.error("Database connection error:", error);
        process.exit(1);
    }
}

export default connectDatabase;
