import config from '../config/shopify';
import { defaultStore } from '../config/defaults';
import { validateStore, fetchAdmin } from '../lib';

// defaults
let store: string = defaultStore;

export const getProductsByTemplate = async (argv: any) => {
  store = argv.store;
  const templateSuffix = argv.template;

  console.log('========== CONFIG ==========');
  console.log('STORE:', store);
  console.log('======= CREDENTIALS ========');
  console.log('KEY:', config[store].key);
  console.log('PASS:', config[store].pass);
  console.log('======= INPUTS ========');
  console.log('TEMPLATE', templateSuffix);
  console.log('============================');

  if (validateStore(store)) {
    getAllProductsWithTemplate(store, templateSuffix);
  } else {
    console.log(
      `Invalid value for store: ${store}, please use ${Object.keys(config).join(
        ', '
      )} only.`
    );
  }
};

const filterProductsByTemplateSuffix = (products: any) => {
  const productsWithTemplate: string[] = [];
  let templateSuffix: string;
  products.forEach((product: any) => {
    if (product.node.templateSuffix === templateSuffix) {
      console.log(`ADDING ${product.node.title} to list.`);
      productsWithTemplate.push(product.node.title);
    }
  });

  return productsWithTemplate;
};

const getAllProductsWithTemplate = async (
  store: string,
  templateSuffix: string,
  cursor?: string
) => {
  if (cursor) {
    console.log('LAST CURSOR', cursor);
  }
  const query = `#graphql
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
    const searchResult = await fetchAdmin<any>(store, query, variables);

    if (searchResult?.errors) {
      throw new Error(searchResult.errors[0].message);
    }

    if (!searchResult?.data?.products) {
      throw new Error('Products not found');
    }

    const products = searchResult.data.products.edges;
    const productsWithTemplate = filterProductsByTemplateSuffix(products);
    // if next page, get last cursor
    if (searchResult.data.products.pageInfo.hasNextPage) {
      console.log('GETTING NEXT PAGE...');
      const cursor = products[products.length - 1].cursor;
      getAllProductsWithTemplate(store, templateSuffix, cursor);
    } else {
      console.log('NO NEXT PAGE...');
      console.log('++++++++ DONE PROCESSING +++++++');
      console.log('productsWithTemplate', productsWithTemplate);
    }
    return searchResult.data.products;
  } catch (err: any) {
    console.log(err.message);
    return false;
  }
};
