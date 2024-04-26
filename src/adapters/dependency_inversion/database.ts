import { RepositoryError } from '../repositories/errors';

export interface IDatabaseErrorAdapter {
    adaptError(error: Error): RepositoryError;
}
