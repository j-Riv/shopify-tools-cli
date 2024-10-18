import dotenv from 'dotenv';
dotenv.config();

const config = {
  retail: {
    key: process.env.RETAIL_API_KEY as string,
    pass: process.env.RETAIL_API_PASSWORD as string,
    name: process.env.RETAIL_STORE_NAME as string,
  },
  wholesale: {
    key: process.env.WHOLESALE_API_KEY as string,
    pass: process.env.WHOLESALE_API_PASSWORD as string,
    name: process.env.WHOLESALE_STORE_NAME as string,
  },
  warehouse: {
    key: process.env.WAREHOUSE_API_KEY as string,
    pass: process.env.WAREHOUSE_API_PASSWORD as string,
    name: process.env.WAREHOUSE_STORE_NAME as string,
  },
  professional: {
    key: process.env.PROFESSIONAL_API_KEY as string,
    pass: process.env.PROFESSIONAL_API_PASSWORD as string,
    name: process.env.PROFESSIONAL_STORE_NAME as string,
  },
  // staging
  staging_retail: {
    key: process.env.STAGING_RETAIL_API_KEY as string,
    pass: process.env.STAGING_RETAIL_API_PASSWORD as string,
    name: process.env.STAGING_RETAIL_STORE_NAME as string,
  },
  staging_wholesale: {
    key: process.env.STAGING_WHOLESALE_API_KEY as string,
    pass: process.env.STAGING_WHOLESALE_API_PASSWORD as string,
    name: process.env.STAGING_WHOLESALE_STORE_NAME as string,
  },
  // Other
  cerveza_cito: {
    key: process.env.CERVEZACITO_API_KEY as string,
    pass: process.env.CERVEZACITO_API_PASSWORD as string,
    name: process.env.CERVEZACITO_STORE_NAME as string,
  },
  gunthers: {
    key: process.env.GUNTHERS_API_KEY as string,
    pass: process.env.GUNTHERS_API_PASSWORD as string,
    name: process.env.GUNTHERS_STORE_NAME as string,
  },
  tres_noir: {
    key: process.env.TN_RETAIL_API_KEY as string,
    pass: process.env.TN_RETAIL_API_PASSWORD as string,
    name: process.env.TN_RETAIL_STORE_NAME as string,
  },
};

export type Store = keyof typeof config;

export default config;
