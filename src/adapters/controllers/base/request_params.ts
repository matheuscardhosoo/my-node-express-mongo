import { IRequestParams } from '../../dependency_inversion/api';

export class BaseRequestParams {}

export class AccessByIdRequestParams extends BaseRequestParams {
    readonly id: string;

    constructor(params: IRequestParams) {
        super();
        this.id = params.id;
    }
}
