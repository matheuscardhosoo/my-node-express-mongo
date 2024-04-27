export interface IAdaptersError {
    name: string;
    prevStack?: Error;
    errors: { [path: string]: string };
}
