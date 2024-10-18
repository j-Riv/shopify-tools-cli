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
};

export type Store = keyof typeof config;

export default config;
