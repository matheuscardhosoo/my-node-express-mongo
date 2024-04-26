import { Request, Response } from 'express';

import { ParamsDictionary } from 'express-serve-static-core';

export interface IAcessByIndexParams extends ParamsDictionary {
    [id: string]: string;
}

export interface IEmptyBody {}

export interface IErrorResponseBody {
    message: string;
}

export interface IListResponse<IRead> extends Response<IRead[] | IErrorResponseBody> {}

export interface IResponse<IRead> extends Response<IRead | IErrorResponseBody> {}

export interface INoResponse extends Response<IEmptyBody | IErrorResponseBody> {}

export interface IListRequest<IRead> extends Request<unknown, IListResponse<IRead>, IEmptyBody, unknown> {}

export interface ICreateRequest<IRead, ICreate> extends Request<unknown, IResponse<IRead>, ICreate, unknown> {}

export interface IReadRequest<IRead> extends Request<IAcessByIndexParams, IResponse<IRead>, IEmptyBody, unknown> {}

export interface IReplaceRequest<IRead, ICreate>
    extends Request<IAcessByIndexParams, IResponse<IRead>, ICreate, unknown> {}

export interface IUpdateRequest<IRead, IUpdate>
    extends Request<IAcessByIndexParams, IResponse<IRead>, IUpdate, unknown> {}

export interface IDeleteRequest extends Request<IAcessByIndexParams, INoResponse, IEmptyBody, unknown> {}
