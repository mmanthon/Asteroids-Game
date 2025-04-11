import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
    // Common
    PORT: Joi.number(),
    GLOBAL_API_PREFIX: Joi.string(),
    SWAGGER_URL: Joi.string(),
    TTL: Joi.number().default(30),
    RATE_LIMIT: Joi.number().default(10000),

    // AWS
    AWS_REGION: Joi.string().required(),

    // JWT
    JWT_SECRET: Joi.string().required(),

    // DynamoDB
    DYNAMODB_ACCESS_CONTROL_USERS_TABLE_NAME: Joi.string().required(),
    DYNAMODB_APPLICATIONS_TABLE_NAME: Joi.string().required(),
    DYNAMODB_CLAIMS_TABLE_NAME: Joi.string().required(),
    DYNAMODB_NOTES_TABLE_NAME: Joi.string().required(),

    // Amp api
    AMP_API_BASE_URL: Joi.string().required(),
    AMP_API_KEY: Joi.string().required(),

    // AMP Database
    AMP_DB_HOST: Joi.string().required(),
    AMP_DB_USER: Joi.string().required(),
    AMP_DB_PW: Joi.string().required(),
    AMP_DB: Joi.string().required(),
    AMP_DB_PORT: Joi.number().required(),

    // MVR API
    MVR_API_URL: Joi.string().required(),
});
