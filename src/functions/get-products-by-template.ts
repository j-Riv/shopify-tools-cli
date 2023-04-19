import fetch from 'node-fetch';
import config from '../config/shopify';
import { defaultStore } from '../config/defaults';
import { validateStore, shopifyEndpoint } from '../lib';

// defaults
let store: string = defaultStore;

const productsWithTemplate: string[] = [];
let templateSuffix: string;

export const getProductsByTemplate = async (argv: any) => {
  store = argv.store;
  templateSuffix = argv.template;

  console.log('========== CONFIG ==========');
  console.log('STORE:', store);
  console.log('======= CREDENTIALS ========');
  console.log('KEY:', config[store].key);
  console.log('PASS:', config[store].pass);
  console.log('======= INPUTS ========');
  console.log('TEMPLATE', templateSuffix);
  console.log('============================');

  if (validateStore(store)) {
    getAllProducts(store);
  } else {
    console.log(
      `Invalid value for store: ${store}, please use 'retail', 'wholesale', 'warehouse' or 'professional' only.`
    );
  }
};

const getAllProducts = async (store: string, cursor?: string) => {
  if (cursor) {
    console.log('LAST CURSOR', cursor);
  }
  const query = `
    query($cursor: String) {
      products(first:250, after: $cursor) {
        pageInfo {
          hasNextPage
          hasPreviousPage
        }
        edges {
          cursor
          node {
            title
            productType
            templateSuffix
          }
        }
      }
    }
  `;

  const variables = {
    cursor: cursor,
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
      const products = searchResult.data.products.edges;
      filterProductsByTemplateSuffix(products);
      // if next page, get last cursor
      if (searchResult.data.products.pageInfo.hasNextPage) {
        console.log('GETTING NEXT PAGE...');
        const cursor = products[products.length - 1].cursor;
        getAllProducts(store, cursor);
      } else {
        console.log('NO NEXT PAGE...');
        console.log('++++++++ DONE PROCESSING +++++++');
        console.log('productsWithTemplate', productsWithTemplate);
      }
      return searchResult.data.products;
    } else {
      console.log('PRODUCTS NOT FOUND');
      return false;
    }
  } catch (err: any) {
    console.log(err.message);
    throw new Error(err.message);
  }
};

const filterProductsByTemplateSuffix = (products: any) => {
  products.forEach((product: any) => {
    if (product.node.templateSuffix === templateSuffix) {
      console.log(`ADDING ${product.node.title} to list.`);
      productsWithTemplate.push(product.node.title);
    }
  });
};
