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
  printConfig,
  searchForCustomerByEmail,
  customerUpdate,
  initializeCSV,
  writeRecords,
} from '../lib';
import type { Row } from '../lib/types';

// defaults
let csvFileToImport: string = defaultImportName;
let errorFileName: string = defaultErrorName;
let store: string = defaultStore;

export const tagCustomers = async (argv: any) => {
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
        const email = row.Email;
        let firstName: string = '';
        let lastName: string = '';
        if (row.FirstName) {
          firstName = row.FirstName;
          lastName = row.LastName;
        }
        let tags: string;
        if (row.tags) {
          tags = row.tags;
        } else if (argv.tags) {
          tags = argv.tags;
        } else {
          console.log('ERROR: no tags found.');
          tags = '';
        }

        console.log('========== TAGS ==========');
        console.log('ADD TAGS:', tags);
        console.log('===========================');

        try {
          const result = await run(store, email, firstName, lastName, tags);
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
            row.Error = 'Product not found';
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
            { id: 'Email', title: 'Email' },
            { id: 'Tags', title: 'Tags' },
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
  email: string,
  firstName: string,
  lastName: string,
  tags: string
) => {
  try {
    console.log('SEARCHING FOR EMAIL:' + email);
    const searchResult = await searchForCustomerByEmail(
      store,
      email,
      firstName,
      lastName,
      tags
    );

    if (!searchResult) {
      // doesn't exist - create'
      console.log('CUSTOMER DOES NOT EXIST!');
      return false;
    } else {
      // exists - update
      console.log('UPDATING CUSTOMER');
      return await customerUpdate(store, searchResult.customer.id, tags);
    }
  } catch (err: any) {
    console.log(err.message);
    throw new Error(err.message);
  }
};
