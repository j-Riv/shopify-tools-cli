import dotenv from 'dotenv';
dotenv.config();

export const shopifyEndpoint = `.myshopify.com/admin/api/${process.env.SHOPIFY_API_VERSION}/graphql.json`;
