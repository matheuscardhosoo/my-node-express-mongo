import { IAdaptersError } from '../errors';

export class ControllerError extends Error implements IAdaptersError {
    public name = 'ControllerError';

    public prevStack?: Error;

    public errors: { [path: string]: string } = {};

    constructor(message: string, prevStack?: Error) {
        super(message);
        this.prevStack = prevStack;
    }
}

export class RequestValidationError extends ControllerError {
    public name = 'ValidationError';

    public errors: { [path: string]: string };

    constructor(errors: { [path: string]: string }, prevStack?: Error) {
        super('Validation error', prevStack);
        this.errors = errors;
    }
}

export class PathNotFoundError extends ControllerError {
    public name = 'NotFoundError';

    public resourceName: string = '';

    constructor(prevStack?: Error) {
        super('Path not found', prevStack);
    }
}
