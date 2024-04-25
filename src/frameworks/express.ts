import express, { Express, Request, Response, NextFunction } from 'express';

import { IRequest, IResponse, INextFunction, IApiAdapter } from '../adapters/dependency_inversion/api';
import { IServerManager } from './interfaces/server';
import { SERVER_SETTINGS } from "../settings";
import { IDatabaseManager } from './interfaces/database';


class ExpressManager implements IServerManager, IApiAdapter {
    private app: Express;
    private databaseManager: IDatabaseManager;

    constructor(databaseManager: IDatabaseManager) {
        this.app = express();
        this.app.use(express.json());
        this.databaseManager = databaseManager;
    }

    public start(): void {
        this.app.listen(SERVER_SETTINGS.port, async () => {
            await this.databaseManager.connect();
            console.log(`Server is running on port ${SERVER_SETTINGS.port}`);
        });
    }

    public get(path: string, handler: (req: IRequest, res: IResponse, next: INextFunction) => void): void {
        this.app.get(path, (req: Request, res: Response, next: NextFunction) => {
            handler(req, res, next);
        });
    }

    public post(path: string, handler: (req: IRequest, res: IResponse, next: INextFunction) => void): void {
        this.app.post(path, (req: Request, res: Response, next: NextFunction) => {
            handler(req, res, next);
        });
    }

    public put(path: string, handler: (req: IRequest, res: IResponse, next: INextFunction) => void): void {
        this.app.put(path, (req: Request, res: Response, next: NextFunction) => {
            handler(req, res, next);
        });
    }

    public patch(path: string, handler: (req: IRequest, res: IResponse, next: INextFunction) => void): void {
        this.app.patch(path, (req: Request, res: Response, next: NextFunction) => {
            handler(req, res, next);
        });
    }

    public delete(path: string, handler: (req: IRequest, res: IResponse, next: INextFunction) => void): void {
        this.app.delete(path, (req: Request, res: Response, next: NextFunction) => {
            handler(req, res, next);
        });
    }
}

export default ExpressManager;