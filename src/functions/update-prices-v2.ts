import path from 'path';
import csv from 'csvtojson';
import config from '../config/shopify';
import {
  defaultImportName,
  defaultErrorName,
  defaultStore,
} from '../config/defaults';
import {
  validateStore,
  searchBySku,
  printConfig,
  updateShopifyProductVariantPrice,
  initializeCSV,
  writeRecords,
} from '../lib';
import type { Row } from '../lib/types';

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

  printConfig(store, csvFileToImport, errorFileName);

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
          const result = await run(store, sku, price, comparePrice);
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
        const date = new Date();
        let message: string = `${errors.length} errors`;
        if (errors.length > 0) {
          const filename = `${errorFileName}-${date.toISOString()}`;
          message = `${message}, errors have been written to ${filename}.csv`;

          const csvWriter = initializeCSV(filename, [
            { id: 'Internal ID', title: 'Internal ID' },
            { id: 'SKU', title: 'SKU' },
            { id: 'NewPrice', title: 'NewPrice' },
            { id: 'NewCompareAtPrice', title: 'NewCompareAtPrice' },
            { id: 'Error', title: 'Error' },
          ]);

          writeRecords(csvWriter, errors).then(() => {
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

const run = async (
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
