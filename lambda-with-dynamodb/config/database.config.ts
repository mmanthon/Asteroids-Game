export default () => ({
    dynamodb: {
        applicationsTableName: process.env.DYNAMODB_APPLICATIONS_TABLE_NAME,
        productTableName: process.env.DYNAMODB_PRODUCTS_TABLE_NAME,
        productVersionTableName: process.env.DYNAMODB_PRODUCT_VERSION_TABLE_NAME,
    },
});
