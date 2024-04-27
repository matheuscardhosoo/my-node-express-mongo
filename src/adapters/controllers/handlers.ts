import { INextFunction, IRequest, IResponse } from '../dependency_inversion/api';

import { IAdaptersError } from '../errors';
import { IErrorResponseBody } from './interfaces';
import { PathNotFoundError } from './errors';

export const PathNotFoundHandler = (_req: IRequest, _res: IResponse, next: INextFunction): Promise<void> => {
    const error = new PathNotFoundError();
    return next.call(error);
};

export const AdaptersErrorHandler = (
    error: Error,
    _req: IRequest,
    res: IResponse,
    _next: INextFunction,
): Promise<void> => {
    if (error.name === 'ValidationError') {
        res.status(400).json({
            status: 400,
            message: error.message,
            errors: (error as unknown as IAdaptersError).errors,
        } as IErrorResponseBody);
    } else if (error.name === 'NotFoundError') {
        res.status(404).json({ status: 404, message: error.message } as IErrorResponseBody);
    } else {
        console.error(error);
        res.status(500).json({ status: 500, message: 'Internal Server Error' } as IErrorResponseBody);
    }
    return Promise.resolve();
};
