export interface IRequest {
    body: any;
    params: any;
    query: any;
    headers: any;
}

export interface IResponse {
    send: () => IResponse;
    json: (body: any) => IResponse;
    status: (code: number) => IResponse;
}

export interface INextFunction {
    (): void;
}

export interface IApiAdapter {
    get: (path: string, handler: (req: IRequest, res: IResponse, next: INextFunction) => Promise<void>) => void;
    post: (path: string, handler: (req: IRequest, res: IResponse, next: INextFunction) => Promise<void>) => void;
    put: (path: string, handler: (req: IRequest, res: IResponse, next: INextFunction) => Promise<void>) => void;
    patch: (path: string, handler: (req: IRequest, res: IResponse, next: INextFunction) => Promise<void>) => void;
    delete: (path: string, handler: (req: IRequest, res: IResponse, next: INextFunction) => Promise<void>) => void;
}