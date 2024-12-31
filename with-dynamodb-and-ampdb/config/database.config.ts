export default () => ({
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
                max: 1,
            },
        },
    },
    dynamodb: {
        submissionsTableName: process.env.DYNAMODB_SUBMISSION_TABLE_NAME,
        applicationsTableName: process.env.DYNAMODB_APPLICATIONS_TABLE_NAME,
        productTableName: process.env.DYNAMODB_PRODUCTS_TABLE_NAME,
        productVersionTableName: process.env.DYNAMODB_PRODUCT_VERSION_TABLE_NAME,
    },
});
