import { RequestValidationError } from '../errors';

export class BaseRequestBody {
    protected parseAttr<T = string>(value: unknown, path: string, parseFunction: (value: unknown) => T): T | undefined {
        if (value === undefined) return undefined;
        try {
            return parseFunction(value);
        } catch (error) {
            throw new RequestValidationError({ [path]: (error as Error).message });
        }
    }

    protected parseRequiredAttr<T = string>(value: unknown, path: string, parseFunction: (value: unknown) => T): T {
        const parsedValue = this.parseAttr(value, path, parseFunction);
        if (parsedValue === undefined) throw new RequestValidationError({ [path]: 'Attribute is required' });
        return parsedValue;
    }
}
