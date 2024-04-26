import { RepositoryError, ValidatorError } from '../adapters/repositories/errors';
import mongoose, { ConnectOptions } from 'mongoose';

import { DATABASE_SETTINGS } from '../settings';
import { IDatabaseErrorAdapter } from '../adapters/dependency_inversion/database';
import { IDatabaseManager } from './interfaces/database';

class MongooseManager implements IDatabaseManager, IDatabaseErrorAdapter {
    private connectionOptions: ConnectOptions = {
        bufferCommands: true,
        dbName: DATABASE_SETTINGS.name,
    };

    public async connect(): Promise<void> {
        try {
            await mongoose.connect(DATABASE_SETTINGS.uri, this.connectionOptions);
            console.log(`Connected to database ${DATABASE_SETTINGS.name}`);
        } catch (error) {
            console.error(`Could not connect to ${DATABASE_SETTINGS.name}`, error);
            process.exit(1);
        }
    }

    public adaptError(error: mongoose.MongooseError): RepositoryError {
        if (!(error instanceof mongoose.MongooseError)) {
            return error;
        }
        if (error instanceof mongoose.Error.ValidationError) {
            return this.adaptValidationError(error);
        }
        if (error instanceof mongoose.Error.ValidatorError) {
            return this.adaptValidatorError(error);
        }
        if (error instanceof mongoose.Error.CastError) {
            return this.adaptCastError(error);
        }
        return new RepositoryError(error.message);
    }

    private adaptValidationError(error: mongoose.Error.ValidationError): ValidatorError {
        const errors: { [path: string]: string } = Object.keys(error.errors).reduce(
            (acc, key) => {
                if (error.errors[key] instanceof mongoose.Error.ValidatorError) {
                    const { path, message } = error.errors[key];
                    acc[path] = message;
                } else {
                    const { path, kind } = error.errors[key];
                    acc[path] = `Invalid ${kind}`;
                }
                return acc;
            },
            {} as { [path: string]: string },
        );
        return new ValidatorError(errors, error);
    }

    private adaptValidatorError(error: mongoose.Error.ValidatorError): ValidatorError {
        const { path, message } = error;
        return new ValidatorError({ [path]: message }, error);
    }

    private adaptCastError(error: mongoose.Error.CastError): ValidatorError {
        const { path, kind } = error;
        return new ValidatorError({ [path]: `Invalid ${kind}` }, error);
    }
}

export default MongooseManager;
