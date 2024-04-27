import { IRequest, IRequestQuery, IResponse } from '../dependency_inversion/api';

import { ParamsDictionary } from 'express-serve-static-core';

export interface IAcessByIndexParams extends ParamsDictionary {
    [id: string]: string;
}

export interface IListRequestQuery extends IRequestQuery {
    page?: string;
    pageSize?: string;
    sort?: string;
}

export interface IErrorResponseBody {
    status: number;
    message: string;
    errors?: { [path: string]: string };
}

export interface IPaginatedListResponseBody<Body> {
    data: Body[];
    total: number;
    page: number;
    pageSize: number;
}

export interface IListRequest<RequestParams, ListRequestQuery>
    extends IRequest<RequestParams, ListRequestQuery, unknown> {}

export interface ICreateRequest<RequestParams, CreateBody> extends IRequest<RequestParams, unknown, CreateBody> {}

export interface IReadRequest<RequestParams> extends IRequest<RequestParams, unknown, unknown> {}

export interface IReplaceRequest<RequestParams, CreateBody> extends IRequest<RequestParams, unknown, CreateBody> {}

export interface IUpdateRequest<RequestParams, UpdateBody> extends IRequest<RequestParams, unknown, UpdateBody> {}

export interface IDeleteRequest<RequestParams> extends IRequest<RequestParams, unknown, unknown> {}

export interface INoResponse<Locals = unknown> extends IResponse<null | IErrorResponseBody, Locals> {}

export interface ISingleResponse<Body, Locals = unknown> extends IResponse<Body | IErrorResponseBody, Locals> {}

export interface IListResponse<Body, Locals = unknown> extends IResponse<Body[] | IErrorResponseBody, Locals> {}

export interface IPaginatedListResponse<Body, Locals = unknown>
    extends IResponse<IPaginatedListResponseBody<Body> | IErrorResponseBody, Locals> {}
