export default () => ({
    port: parseInt(process.env.PORT, 10) || 3001,
    globalApiPrefix: process.env.GLOBAL_API_PREFIX || '/',
    swaggerUrl: process.env.SWAGGER_URL || '/docs',
    rateLimit: {
        ttl: process.env.TTL || 30,
        limit: process.env.RATE_LIMIT || 100,
    },

    // AWS
    awsRegion: process.env.AWS_REGION,

    // JWT
    jwt: {
        secret: process.env.JWT_SECRET || 'use a pgp key here',
        signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '2d' },
    },

    // Amp api
    ampApiBaseUrl: process.env.AMP_API_BASE_URL,
    ampApiKey: process.env.AMP_API_KEY,

    // DynamoDB tables
    dynamodb: {
        accessControlUsersTableName: process.env.DYNAMODB_ACCESS_CONTROL_USERS_TABLE_NAME,
        applicationsTableName: process.env.DYNAMODB_APPLICATIONS_TABLE_NAME,
        claimsTableName: process.env.DYNAMODB_CLAIMS_TABLE_NAME,
    },

    // AMP Database
    amp: {
        client: 'mysql2',
        connection: {
            host: process.env.AMP_DB_HOST,
            user: process.env.AMP_DB_USER,
            password: process.env.AMP_DB_PW,
            database: process.env.AMP_DB,
            port: process.env.AMP_DB_PORT,
            pool: {
                min: 0,
                max: 2,
            },
        },
    },

    // MVR API
    mvrApiUrl: process.env.MVR_API_URL,
});
