import { IRequest, IResponse } from '../dependency_inversion/api';

import { ParamsDictionary } from 'express-serve-static-core';

export interface IAcessByIndexParams extends ParamsDictionary {
    [id: string]: string;
}

export interface IErrorResponseBody {
    status: number;
    message: string;
    errors?: { [path: string]: string };
}

export interface IListRequest<RequestParams, RequestQuery> extends IRequest<RequestParams, RequestQuery, unknown> {}

export interface ICreateRequest<RequestParams, CreateBody> extends IRequest<RequestParams, unknown, CreateBody> {}

export interface IReadRequest<RequestParams> extends IRequest<RequestParams, unknown, unknown> {}

export interface IReplaceRequest<RequestParams, CreateBody> extends IRequest<RequestParams, unknown, CreateBody> {}

export interface IUpdateRequest<RequestParams, UpdateBody> extends IRequest<RequestParams, unknown, UpdateBody> {}

export interface IDeleteRequest<RequestParams> extends IRequest<RequestParams, unknown, unknown> {}

export interface INoResponse<Locals = unknown> extends IResponse<null | IErrorResponseBody, Locals> {}

export interface ISingleResponse<Body, Locals = unknown> extends IResponse<Body | IErrorResponseBody, Locals> {}

export interface IListResponse<Body, Locals = unknown> extends IResponse<Body[] | IErrorResponseBody, Locals> {}
