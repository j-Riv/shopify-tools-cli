import path from 'path';
import fetch from 'node-fetch';
import csv from 'csvtojson';
import * as createCsvWriter from 'csv-writer';
import config from '../config/shopify';
import {
  defaultImportName,
  defaultErrorName,
  defaultStore,
} from '../config/defaults';
import { validateStore, shopifyEndpoint } from '../lib';

const date = new Date();

// defaults
let csvFileToImport: string = defaultImportName;
let errorFileName: string = defaultErrorName;
let store: string = defaultStore;

export const updatePrices = async (argv: any) => {
  // print args
  if (argv.import) {
    csvFileToImport = argv.import;
  }

  if (argv.export) {
    errorFileName = argv.export;
  }

  store = argv.store;

  console.log('========== CONFIG ==========');
  console.log('STORE:', store);
  console.log('IMPORT FILE', csvFileToImport);
  console.log('EXPORT FILE', errorFileName);
  console.log('======= CREDENTIALS ========');
  console.log('KEY:', config[store].key);
  console.log('PASS:', config[store].pass);
  console.log('============================');

  if (validateStore(store)) {
    const jsonArray = await csv().fromFile(
      path.join(__dirname, `../../csv/${csvFileToImport}.csv`)
    );
    console.log('READING CSV & CONVERTING TO JSON');
    console.log(jsonArray);

    let errors: Row[] = [];
    (async function moveAlong() {
      console.log('THERE ARE (' + jsonArray.length + ') rows.');
      if (jsonArray.length > 0) {
        console.log('++++++++ PROCESSING +++++++');
        let row: Row = jsonArray.shift();
        console.log('ROW');
        console.log(row);
        const sku = row.SKU;
        const price = row.NewPrice;
        const comparePrice =
          row.NewCompareAtPrice !== '' ? row.NewCompareAtPrice : '0';

        try {
          const result = await search(store, sku, price, comparePrice);
          if (result) {
            console.log('RESPONSE OK, LETS MOVE ALONG!');
            console.log('+++++++++++++++++++++++++++++');
            console.log();
            console.log();
            moveAlong();
          } else {
            console.log(
              'ERROR OCCURRED, CHECK EMAIL OR SCRIPT LOG FOR DETAILS.'
            );
            row.Error = 'Product / Variant not found';
            errors.push(row);
            moveAlong();
          }
        } catch (err: any) {
          console.log('ERROR OCCURRED, CHECK EMAIL OR SCRIPT LOG FOR DETAILS.');
          console.log(err.message);
          row.Error = err.message;
          errors.push(row);
          moveAlong();
        }
      } else {
        console.log('++++++++ DONE PROCESSING +++++++');
        let message: string = `${errors.length} errors`;
        if (errors.length > 0) {
          message = `${message}, errors have been written to ${errorFileName}-${date}.csv`;
          const csvWriter = createCsvWriter.createObjectCsvWriter({
            path: path.join(
              __dirname,
              `../../errors/${errorFileName}-${date}.csv`
            ),
            header: [
              { id: 'Internal ID', title: 'Internal ID' },
              { id: 'SKU', title: 'SKU' },
              { id: 'NewPrice', title: 'NewPrice' },
              { id: 'NewCompareAtPrice', title: 'NewCompareAtPrice' },
              { id: 'Error', title: 'Error' },
            ],
          });
          csvWriter.writeRecords(errors).then(() => {
            console.log('WRITING ERRORS TO CSV!');
          });
        }
        console.log(message);
      }
    })();
  } else {
    console.log(
      `Invalid value for store: ${store}, please use ${Object.keys(config).join(
        ', '
      )} only.`
    );
  }
};

const search = async (
  store: string,
  sku: string,
  price: string,
  comparePrice: string
) => {
  try {
    console.log('SEARCHING FOR SKU:' + sku);
    const searchResult = await searchBySku(store, sku);

    if (!searchResult) {
      // doesn't exist - create'
      console.log('PRODUCT DOES NOT EXIST!');
      return false;
    } else {
      // exists - update
      console.log('UPDATING PRODUCT');
      return await updateShopifyProductVariantPrice(
        store,
        searchResult.product.id,
        price,
        comparePrice
      );
    }
  } catch (err: any) {
    console.log(err.message);
    throw new Error(err.message);
  }
};

type VariantType = {
  node: {
    sku: string;
    id: string;
    title: string;
  };
};

type ProductType = {
  node: {
    id: string;
    title: string;
    variants: {
      edges: VariantType[];
    };
  };
};

const searchBySku = async (store: string, sku: string) => {
  const query = `
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
      let variantFound: string | null = null;
      console.log(`FOUND ${products.length} POSSIBLE PRODUCTS`);
      console.log('MATCHING SKU TO PRODUCT VARIANT');
      products.forEach(product => {
        if (variantFound) return;
        const variants = product.node.variants.edges;
        const found = variants.find(function (variant) {
          return variant.node.sku === sku;
        });
        if (found) {
          console.log('VARIANT FOUND', found.node.id);
          variantFound = found.node.id;
        }
      });

      if (variantFound) {
        console.log('BUILDING VARIANT OBJECT', variantFound);
        const variant = {
          product: {
            id: variantFound,
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

const updateShopifyProductVariantPrice = async (
  store: string,
  id: string,
  price: string,
  comparePrice: string
) => {
  const variables = {
    input: {
      id: id,
      price: price,
      compareAtPrice: comparePrice === '0' ? null : comparePrice,
    },
  };
  const query = `
    mutation productVariantUpdate($input: ProductVariantInput!) {
      productVariantUpdate(input: $input) {
        product {
          id
        }
        productVariant {
          id
          price
          compareAtPrice
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

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

    const updatedProduct = await response.json();
    console.log('UPDATED PRODUCT RESPONSE');
    console.log(updatedProduct);
    if (updatedProduct.data.productVariantUpdate.product === null) {
      const errors = updatedProduct.data.productVariantUpdate.userErrors;
      console.log('ERRORS:', errors);
      throw new Error(errors[0].message);
    }
    return updatedProduct;
  } catch (err: any) {
    console.log(err.message);
    throw new Error(err.message);
  }
};
