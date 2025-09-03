export default () => ({
    port: parseInt(process.env.PORT, 10) || 3001,
    globalApiPrefix: process.env.GLOBAL_API_PREFIX || '/',
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

    // UTM SQS
    queueUrl: process.env.TASK_QUEUE_URL,

    // DynamoDB tables
    dynamodb: {
        accessControlUsersTableName: process.env.DYNAMODB_ACCESS_CONTROL_USERS_TABLE_NAME,
        applicationsTableName: process.env.DYNAMODB_APPLICATIONS_TABLE_NAME,
        autoDeclinationHistoryTableName: process.env.DYNAMODB_AUTO_DECLINATION_HISTORY_TABLE_NAME,
        claimsTableName: process.env.DYNAMODB_CLAIMS_TABLE_NAME,
        notesTableName: process.env.DYNAMODB_NOTES_TABLE_NAME,
        productsTableName: process.env.DYNAMODB_PRODUCTS_TABLE_NAME,
        tasksTableName: process.env.DYNAMODB_TASK_TABLE_NAME,
        wsConnectionsTableName: process.env.DYNAMODB_TASK_WS_CONNECTION_TABLE_NAME,
        emailHistoryTableName: process.env.DYNAMODB_EMAIL_HISTORY_TABLE_NAME,
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

    // Tracking Database
    trackingDB: {
        client: 'mysql2',
        connection: {
            host: process.env.AMP_DB_HOST,
            user: process.env.AMP_DB_USER,
            password: process.env.AMP_DB_PW,
            database: process.env.TRACKING_DB,
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
