import { IResponse } from '../dependency_inversion/api';

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

export interface INoResponse<Locals = unknown> extends IResponse<null | IErrorResponseBody, Locals> {}

export interface ISingleResponse<Body, Locals = unknown> extends IResponse<Body | IErrorResponseBody, Locals> {}

export interface IListResponse<Body, Locals = unknown> extends IResponse<Body[] | IErrorResponseBody, Locals> {}

export interface IPaginatedListResponse<Body, Locals = unknown>
    extends IResponse<IPaginatedListResponseBody<Body> | IErrorResponseBody, Locals> {}
