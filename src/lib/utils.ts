import config from '../config/shopify';
import { shopifyEndpoint } from './const';
import { ProductType } from './types/product';

export const validateStore = (store: string) => {
  const stores = Object.keys(config);
  return stores.includes(store);
};

export const searchBySku = async (
  store: string,
  sku: string,
  isProduct = false
) => {
  const type = isProduct ? 'PRODUCT' : 'VARIANT';

  const query = `#graphql
    query($filter: String!) {
      products(first:5, query: $filter) {
        edges {
          node {
            id
            title
            variants(first:60) {
              edges {
                node {
                  sku
                  id
                  title
                }
              }
            }
          }
        }
      }
    }
  `;

  const variables = {
    filter: `sku:${sku}`,
  };

  try {
    const response = await fetch(
      `https://${config[store].name}${shopifyEndpoint}`,
      {
        method: 'post',
        body: JSON.stringify({ query, variables }),
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': config[store].pass,
        },
      }
    );

    const searchResult = await response.json();

    if (searchResult.data.products) {
      // loop through products
      const products: ProductType[] = searchResult.data.products.edges;
      let productFound: string | null = null;
      console.log(`FOUND ${products.length} POSSIBLE PRODUCTS`);
      console.log('MATCHING SKU TO PRODUCT VARIANT');
      products.forEach(product => {
        if (productFound) return;
        const variants = product.node.variants.edges;
        const found = variants.find(function (variant) {
          return variant.node.sku === sku;
        });
        if (found) {
          console.log(`${type} FOUND`, found.node.id);
          productFound = isProduct ? product.node.id : found.node.id;
        }
      });

      if (productFound) {
        console.log(`BUILDING ${type} OBJECT`, productFound);
        const variant = {
          product: {
            id: productFound,
          },
        };

        return variant;
      } else {
        return false;
      }
    } else {
      console.log('PRODUCT NOT FOUND');
      return false;
    }
  } catch (err: any) {
    console.log(err.message);
    throw new Error(err.message);
  }
};
