import mongoose, { ConnectOptions } from "mongoose";
import { DATABASE_SETTINGS } from "./settings";

const OPTIONS: ConnectOptions = {
    bufferCommands: true,
    dbName: DATABASE_SETTINGS.name,
};

async function connectDatabase(): Promise<void> {
    console.log("Connecting to database");
    try {
        await mongoose.connect(DATABASE_SETTINGS.uri, OPTIONS);
        console.log(`Connected to database ${DATABASE_SETTINGS.name}`);
    } catch (error) {
        console.error(`Could not connect to ${DATABASE_SETTINGS.name}`, error);
        process.exit(1);
    }
}

export default connectDatabase;
