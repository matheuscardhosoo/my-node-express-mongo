import { INextFunction, IRequest, IResponse } from '../dependency_inversion/api';
import { ResourceNotFoundError, ValidatorError } from '../repositories/errors';

import { IErrorResponseBody } from './interfaces';

export const PathNotFoundHandler = (_req: IRequest, _res: IResponse, next: INextFunction): Promise<void> => {
    const error = new ResourceNotFoundError('path');
    return next.call(error);
};

export const AdaptersErrorHandler = (
    error: Error,
    _req: IRequest,
    res: IResponse,
    _next: INextFunction,
): Promise<void> => {
    if (error.name === 'ValidatorError') {
        res.status(400).json({
            status: 400,
            message: error.message,
            errors: (error as ValidatorError).errors,
        } as IErrorResponseBody);
    } else if (error.name === 'ResourceNotFoundError') {
        res.status(404).json({ status: 404, message: error.message } as IErrorResponseBody);
    } else {
        console.error(error);
        res.status(500).json({ status: 500, message: 'Internal Server Error' } as IErrorResponseBody);
    }
    return Promise.resolve();
};
