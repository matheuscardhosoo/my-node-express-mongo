import mongoose, { ConnectOptions } from 'mongoose';

import { DATABASE_SETTINGS } from '../settings';
import { IDatabaseManager } from './interfaces/database';

class MongooseManager implements IDatabaseManager {
    private connectionOptions: ConnectOptions = {
        bufferCommands: true,
        dbName: DATABASE_SETTINGS.name,
    };

    public async connect(): Promise<void> {
        console.log('Connecting to database');
        try {
            await mongoose.connect(DATABASE_SETTINGS.uri, this.connectionOptions);
            console.log(`Connected to database ${DATABASE_SETTINGS.name}`);
        } catch (error) {
            console.error(`Could not connect to ${DATABASE_SETTINGS.name}`, error);
            process.exit(1);
        }
    }
}

export default MongooseManager;
