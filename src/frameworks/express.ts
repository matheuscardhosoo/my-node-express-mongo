import {
    IApiAdapter,
    IErrorHandler,
    IHandler,
    INextFunction,
    IRequest,
    IRequestBody,
    IRequestParams,
    IRequestQuery,
    IResponse,
    IRouter,
} from '../adapters/dependency_inversion/api';
import express, { Express, NextFunction, Request, Response } from 'express';

import { IDatabaseManager } from './interfaces/database';
import { IServerManager } from './interfaces/server';
import { Router } from 'express-serve-static-core';
import { SERVER_SETTINGS } from '../settings';

class ExpressRequest implements IRequest {
    private request: Request;

    constructor(request: Request) {
        this.request = request;
    }

    public getParams(): IRequestParams {
        return this.request.params;
    }

    public getQuery(): IRequestQuery {
        return this.request.query;
    }

    public getBody(): IRequestBody {
        return this.request.body as IRequestBody;
    }
}

class ExpressResponse implements IResponse {
    private response: Response;

    constructor(response: Response) {
        this.response = response;
    }

    public status(status: number): IResponse {
        this.response.status(status);
        return this;
    }

    public json(body: IRequestBody): void {
        this.response.json(body);
    }

    public send(): void {
        this.response.send();
    }

    public getLocal(key: string): unknown {
        return this.response.locals[key];
    }

    public setLocal(key: string, value: unknown): void {
        this.response.locals[key] = value;
    }
}

class ExpressNextFunction implements INextFunction {
    private next: NextFunction;

    constructor(next: NextFunction) {
        this.next = next;
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    public async call(error?: Error | 'router' | 'route'): Promise<void> {
        this.next(error);
    }
}

class ExpressRouter implements IRouter {
    private router: Router;

    constructor(router: Router) {
        this.router = router;
    }

    public get(path: string, handler: IHandler): void {
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        this.router.get(path, this.adaptHandler(handler));
    }

    public post(path: string, handler: IHandler): void {
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        this.router.post(path, this.adaptHandler(handler));
    }

    public put(path: string, handler: IHandler): void {
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        this.router.put(path, this.adaptHandler(handler));
    }

    public patch(path: string, handler: IHandler): void {
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        this.router.patch(path, this.adaptHandler(handler));
    }

    public delete(path: string, handler: IHandler): void {
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        this.router.delete(path, this.adaptHandler(handler));
    }

    public addNextHandler(handler: IHandler): void {
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        this.router.use(this.adaptHandler(handler));
    }

    public addErrorHandler(handler: IErrorHandler): void {
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        this.router.use(this.adaptErrorHandler(handler));
    }

    private adaptHandler(handler: IHandler): (req: Request, res: Response, next: NextFunction) => Promise<void> {
        return async (req: Request, res: Response, next: NextFunction) => {
            await handler(new ExpressRequest(req), new ExpressResponse(res), new ExpressNextFunction(next));
        };
    }

    private adaptErrorHandler(
        handler: IErrorHandler,
    ): (err: Error, req: Request, res: Response, next: NextFunction) => Promise<void> {
        return async (err: Error, req: Request, res: Response, next: NextFunction) => {
            await handler(err, new ExpressRequest(req), new ExpressResponse(res), new ExpressNextFunction(next));
        };
    }
}

class ExpressManager implements IServerManager, IApiAdapter {
    private app: Express;

    private databaseManager: IDatabaseManager;

    constructor(databaseManager: IDatabaseManager) {
        this.databaseManager = databaseManager;
        this.app = express();
        this.app.use(express.json());
    }

    public start(): void {
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        this.app.listen(SERVER_SETTINGS.port, async () => {
            await this.databaseManager.connect();
            console.log(`Server is running on port ${SERVER_SETTINGS.port}`);
        });
    }

    public createRouter(): ExpressRouter {
        const router = express.Router();
        this.app.use(router);
        return new ExpressRouter(router);
    }

    public addNextHandler(handler: IHandler): void {
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        this.app.use(this.adaptHandler(handler));
    }

    public addErrorHandler(handler: IErrorHandler): void {
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        this.app.use(this.adaptErrorHandler(handler));
    }

    private adaptHandler(handler: IHandler): (req: Request, res: Response, next: NextFunction) => Promise<void> {
        return async (req: Request, res: Response, next: NextFunction) => {
            await handler(new ExpressRequest(req), new ExpressResponse(res), new ExpressNextFunction(next));
        };
    }

    private adaptErrorHandler(
        handler: IErrorHandler,
    ): (err: Error, req: Request, res: Response, next: NextFunction) => Promise<void> {
        return async (err: Error, req: Request, res: Response, next: NextFunction) => {
            await handler(err, new ExpressRequest(req), new ExpressResponse(res), new ExpressNextFunction(next));
        };
    }
}

export default ExpressManager;
