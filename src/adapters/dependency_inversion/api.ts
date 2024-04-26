import { NextFunction, Request, Response } from 'express';

export interface IRouter {
    get: (path: string, handler: (req: Request, res: Response, next: NextFunction) => Promise<void>) => void;
    post: (path: string, handler: (req: Request, res: Response, next: NextFunction) => Promise<void>) => void;
    put: (path: string, handler: (req: Request, res: Response, next: NextFunction) => Promise<void>) => void;
    patch: (path: string, handler: (req: Request, res: Response, next: NextFunction) => Promise<void>) => void;
    delete: (path: string, handler: (req: Request, res: Response, next: NextFunction) => Promise<void>) => void;
}

export interface IApiAdapter {
    createRouter: () => IRouter;
}
