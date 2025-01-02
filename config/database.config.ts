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
                max: 2,
            },
        },
    },
});
