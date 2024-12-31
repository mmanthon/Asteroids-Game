export default () => ({
    jwt: {
        secret: process.env.JWT_SECRET || 'use a pgp key here',
        signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '2d' },
    },
});
