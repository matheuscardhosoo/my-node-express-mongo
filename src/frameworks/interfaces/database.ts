export interface IDatabaseManager {
    connect(): Promise<void>;
}