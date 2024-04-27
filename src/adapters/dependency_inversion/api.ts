export interface IRequestParams extends Record<string, string> {}

export interface IRequestQuery
    extends Record<string, undefined | string | string[] | IRequestQuery | IRequestQuery[]> {}

export interface IRequestBody extends Record<string, unknown> {}

export interface ILocals extends Record<string, unknown> {}

export interface IResponseBody {}

export interface IRequest<RequestParams = IRequestParams, RequestQuery = IRequestQuery, RequestBody = IRequestBody> {
    getParams: () => RequestParams;
    getQuery: () => RequestQuery;
    getBody: () => RequestBody;
}

export interface IResponse<ResponseBody = IResponseBody, Locals = ILocals> {
    status: (status: number) => IResponse<ResponseBody, Locals>;
    json: (body: ResponseBody) => void;
    send: () => void;
    getLocal: (key: string) => unknown;
    setLocal: (key: string, value: unknown) => void;
}

export interface INextFunction {
    call(error?: Error | 'router' | 'route'): Promise<void>;
}

export interface IHandler {
    (req: IRequest, res: IResponse, next: INextFunction): Promise<void>;
}

export interface IErrorHandler {
    (err: Error, req: IRequest, res: IResponse, next: INextFunction): Promise<void>;
}

export interface IRouter {
    get: (path: string, handler: IHandler) => void;
    post: (path: string, handler: IHandler) => void;
    put: (path: string, handler: IHandler) => void;
    patch: (path: string, handler: IHandler) => void;
    delete: (path: string, handler: IHandler) => void;
    addNextHandler: (handler: IHandler) => void;
    addErrorHandler: (handler: IErrorHandler) => void;
}

export interface IApiAdapter {
    createRouter: () => IRouter;
    addNextHandler: (handler: IHandler) => void;
    addErrorHandler: (handler: IErrorHandler) => void;
}
