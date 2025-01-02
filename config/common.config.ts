export default () => ({
    port: parseInt(process.env.PORT, 10) || 3001,
    globalApiPrefix: process.env.GLOBAL_API_PREFIX || '/api',
    swaggerUrl: process.env.SWAGGER_URL || '/api/docs',
    rateLimit: {
        ttl: process.env.TTL || 30,
        limit: process.env.RATE_LIMIT || 100,
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'use a pgp key here',
        signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '2d' },
    },
});
