import { IRequest, IResponse, INextFunction } from '../dependency_inversion/api';


export interface IController {
    list: (req: IRequest, res: IResponse, next: INextFunction) => Promise<void>;
    create: (req: IRequest, res: IResponse, next: INextFunction) => Promise<void>;
    read: (req: IRequest, res: IResponse, next: INextFunction) => Promise<void>;
    replace: (req: IRequest, res: IResponse, next: INextFunction) => Promise<void>;
    update: (req: IRequest, res: IResponse, next: INextFunction) => Promise<void>;
    delete: (req: IRequest, res: IResponse, next: INextFunction) => Promise<void>;
}
