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
    key: process.env.STAGING_RETAIL_API_KEY,
    pass: process.env.STAGING_RETAIL_API_PASSWORD,
    name: process.env.STAGING_RETAIL_STORE_NAME,
  },
  staging_wholesale: {
    key: process.env.STAGING_WHOLESALE_API_KEY,
    pass: process.env.STAGING_WHOLESALE_API_PASSWORD,
    name: process.env.STAGING_WHOLESALE_STORE_NAME,
  },
  // Other
  cerveza_cito: {
    key: process.env.CERVEZACITO_API_KEY,
    pass: process.env.CERVEZACITO_API_PASSWORD,
    name: process.env.CERVEZACITO_STORE_NAME,
  },
  gunthers: {
    key: process.env.GUNTHERS_API_KEY,
    pass: process.env.GUNTHERS_API_PASSWORD,
    name: process.env.GUNTHERS_STORE_NAME,
  },
  tres_noir: {
    key: process.env.TN_RETAIL_API_KEY,
    pass: process.env.TN_RETAIL_API_PASSWORD,
    name: process.env.TN_RETAIL_STORE_NAME,
  },
};

export default config;
