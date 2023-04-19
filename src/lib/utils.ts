import config from '../config/shopify';

export const validateStore = (store: string) => {
  const stores = Object.keys(config);
  return stores.includes(store);
};
