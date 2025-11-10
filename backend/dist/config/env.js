import dotenv from 'dotenv';
dotenv.config();
export const config = {
    PORT: parseInt(process.env.PORT || '3001', 10),
    HOST: process.env.HOST || '0.0.0.0',
    NODE_ENV: process.env.NODE_ENV || 'development',
    CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
    // Database (Azure SQL)
    DB_HOST: process.env.DB_HOST || '',
    DB_PORT: parseInt(process.env.DB_PORT || '1433', 10),
    DB_NAME: process.env.DB_NAME || '',
    DB_USER: process.env.DB_USER || '',
    DB_PASSWORD: process.env.DB_PASSWORD || '',
    // Azure Redis Cache
    REDIS_HOST: process.env.REDIS_HOST || '',
    REDIS_PORT: parseInt(process.env.REDIS_PORT || '6380', 10),
    REDIS_PASSWORD: process.env.REDIS_PASSWORD || '',
    // Azure AD B2C
    AZURE_AD_CLIENT_ID: process.env.AZURE_AD_CLIENT_ID || '',
    AZURE_AD_TENANT: process.env.AZURE_AD_TENANT || '',
    AZURE_AD_POLICY: process.env.AZURE_AD_POLICY || '',
    // Azure Blob Storage
    AZURE_STORAGE_CONNECTION_STRING: process.env.AZURE_STORAGE_CONNECTION_STRING || '',
    AZURE_STORAGE_CONTAINER: process.env.AZURE_STORAGE_CONTAINER || 'assets',
};
//# sourceMappingURL=env.js.map