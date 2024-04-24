import "dotenv/config";


function loadEnvVariable(key: string): string | undefined {
    return process.env[key];
}

function loadRequiredEnvVariable(key: string): string {
    const value = loadEnvVariable(key);
    if (!value) {
        throw new Error(`Missing required env variable ${key}`);
    }
    return value;
}

export enum Environment {
    TEST = "TEST",
    DEV = "DEV",
    STAGE = "STAGE",
    PROD = "PROD",
}

export const ENV = Environment[loadEnvVariable('ENV') as keyof typeof Environment] || Environment.TEST;

export const SERVER_SETTINGS = {
    port: parseInt(loadEnvVariable('PORT') || '3000'),
}; 

export const DATABASE_SETTINGS = {
    uri: loadRequiredEnvVariable('DATABASE_URI'),
    name: loadEnvVariable('DATABASE_NAME') || `3266-express-mongo-${ENV}`,
};

export default {
    env: ENV,
    server: SERVER_SETTINGS,
    database: DATABASE_SETTINGS,
}