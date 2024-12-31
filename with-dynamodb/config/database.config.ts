export default () => ({
    dynamodb: {
        submissionsTableName: process.env.DYNAMODB_SUBMISSION_TABLE_NAME,
    },
});
