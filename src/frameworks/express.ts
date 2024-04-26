import { IApiAdapter, IRouter } from '../adapters/dependency_inversion/api';
import express, { Express, NextFunction, Request, Response } from 'express';

import { IDatabaseManager } from './interfaces/database';
import { IServerManager } from './interfaces/server';
import { NextHandleFunction } from 'connect';
import { Router } from 'express-serve-static-core';
import { SERVER_SETTINGS } from '../settings';

class ExpressRouter implements IRouter {
    private router: Router;

    constructor(router: Router) {
        this.router = router;
    }

    public get(path: string, handler: (req: Request, res: Response, next: NextFunction) => void): void {
        this.router.get(path, (req: Request, res: Response, next: NextFunction) => {
            handler(req, res, next);
        });
    }

    public post(path: string, handler: (req: Request, res: Response, next: NextFunction) => void): void {
        this.router.post(path, (req: Request, res: Response, next: NextFunction) => {
            handler(req, res, next);
        });
    }

    public put(path: string, handler: (req: Request, res: Response, next: NextFunction) => void): void {
        this.router.put(path, (req: Request, res: Response, next: NextFunction) => {
            handler(req, res, next);
        });
    }

    public patch(path: string, handler: (req: Request, res: Response, next: NextFunction) => void): void {
        this.router.patch(path, (req: Request, res: Response, next: NextFunction) => {
            handler(req, res, next);
        });
    }

    public delete(path: string, handler: (req: Request, res: Response, next: NextFunction) => void): void {
        this.router.delete(path, (req: Request, res: Response, next: NextFunction) => {
            handler(req, res, next);
        });
    }
}

class ExpressManager implements IServerManager, IApiAdapter {
    private app: Express;

    private databaseManager: IDatabaseManager;

    constructor(databaseManager: IDatabaseManager) {
        this.app = express();
        this.databaseManager = databaseManager;
    }

    public start(): void {
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        this.app.listen(SERVER_SETTINGS.port, async () => {
            await this.databaseManager.connect();
            console.log(`Server is running on port ${SERVER_SETTINGS.port}`);
        });
    }

    public createRouter(addJsonMiddleware: boolean = true): ExpressRouter {
        const router = express.Router();
        const middlewares: NextHandleFunction[] = [];
        if (addJsonMiddleware) {
            middlewares.push(express.json());
        }
        this.app.use(...middlewares, router);
        return new ExpressRouter(router);
    }
}

export default ExpressManager;
