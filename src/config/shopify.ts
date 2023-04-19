import dotenv from 'dotenv';
dotenv.config();

const config = {
  // production
  retail: {
    key: process.env.RETAIL_API_KEY,
    pass: process.env.RETAIL_API_PASSWORD,
    name: process.env.RETAIL_STORE_NAME,
  },
  wholesale: {
    key: process.env.WHOLESALE_API_KEY,
    pass: process.env.WHOLESALE_API_PASSWORD,
    name: process.env.WHOLESALE_STORE_NAME,
  },
  warehouse: {
    key: process.env.WAREHOUSE_API_KEY,
    pass: process.env.WAREHOUSE_API_PASSWORD,
    name: process.env.WAREHOUSE_STORE_NAME,
  },
  professional: {
    key: process.env.PROFESSIONAL_API_KEY,
    pass: process.env.PROFESSIONAL_API_PASSWORD,
    name: process.env.PROFESSIONAL_STORE_NAME,
  },
  // staging
  staging_retail: {
    key: process.env.RETAIL_API_KEY,
    pass: process.env.RETAIL_API_PASSWORD,
    name: process.env.RETAIL_STORE_NAME,
  },
  staging_wholesale: {
    key: process.env.WHOLESALE_API_KEY,
    pass: process.env.WHOLESALE_API_PASSWORD,
    name: process.env.WHOLESALE_STORE_NAME,
  },
};

export default config;
