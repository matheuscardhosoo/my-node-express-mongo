import { IAdaptersError } from '../errors';

export class RepositoryError extends Error implements IAdaptersError {
    public name = 'RepositoryError';

    public prevStack?: Error;

    constructor(message: string, prevStack?: Error) {
        super(message);
        this.prevStack = prevStack;
    }
}

export class ValidatorError extends RepositoryError {
    public name = 'ValidatorError';

    public errors: { [path: string]: string };

    constructor(errors: { [path: string]: string }, prevStack?: Error) {
        super('Validation error', prevStack);
        this.errors = errors;
    }
}

export class ResourceNotFoundError extends RepositoryError {
    public name = 'ResourceNotFoundError';

    public resourceName: string;

    public id?: string;

    constructor(resourceName: string, id?: string, prevStack?: Error) {
        super(`Resource not found: ${resourceName}`, prevStack);
        this.resourceName = resourceName;
        this.id = id;
    }
}
