import express, { Express, Request, Response, NextFunction } from 'express';
import { Router } from 'express-serve-static-core';
import { NextHandleFunction } from "connect";

import { IRequest, IResponse, INextFunction, IApiAdapter, IRouter } from '../adapters/dependency_inversion/api';
import { IServerManager } from './interfaces/server';
import { SERVER_SETTINGS } from "../settings";
import { IDatabaseManager } from './interfaces/database';


class ExpressRouter implements IRouter {
    private router: Router;

    constructor(router: Router) {
        this.router = router;
    }

    public get(path: string, handler: (req: IRequest, res: IResponse, next: INextFunction) => void): void {
        this.router.get(path, (req: Request, res: Response, next: NextFunction) => {
            handler(req, res, next);
        });
    }

    public post(path: string, handler: (req: IRequest, res: IResponse, next: INextFunction) => void): void {
        this.router.post(path, (req: Request, res: Response, next: NextFunction) => {
            handler(req, res, next);
        });
    }

    public put(path: string, handler: (req: IRequest, res: IResponse, next: INextFunction) => void): void {
        this.router.put(path, (req: Request, res: Response, next: NextFunction) => {
            handler(req, res, next);
        });
    }

    public patch(path: string, handler: (req: IRequest, res: IResponse, next: INextFunction) => void): void {
        this.router.patch(path, (req: Request, res: Response, next: NextFunction) => {
            handler(req, res, next);
        });
    }

    public delete(path: string, handler: (req: IRequest, res: IResponse, next: INextFunction) => void): void {
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
        this.app.listen(SERVER_SETTINGS.port, async () => {
            await this.databaseManager.connect();
            console.log(`Server is running on port ${SERVER_SETTINGS.port}`);
        });
    }

    public createRouter(addJsonMiddleware:boolean = true): ExpressRouter {
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