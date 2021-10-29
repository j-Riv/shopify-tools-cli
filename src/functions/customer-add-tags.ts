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

const date = new Date();

// defaults
let csvFileToImport: string = defaultImportName;
let errorFileName: string = defaultErrorName;
let store: string = defaultStore;

interface Row {
  [key: string]: string;
}

export const tagCustomers = async (argv: any) => {
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
    const csvWriter = createCsvWriter.createObjectCsvWriter({
      path: path.join(__dirname, `../../errors/${errorFileName}-${date}.csv`),
      header: [
        { id: 'Email', title: 'Email' },
        { id: 'Tags', title: 'Tags' },
      ],
    });

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
          const result = await search(store, email, firstName, lastName, tags);
          if (result) {
            console.log('RESPONSE OK, LETS MOVE ALONG!');
            console.log('+++++++++++++++++++++++++++++');
            console.log();
            console.log();
            moveAlong();
          } else {
            console.log(
              'ERROR OCCURED, CHECK EMAIL OR SCRIPT LOG FOR DETAILS.'
            );
            errors.push(row);
            moveAlong();
          }
        } catch (err: any) {
          console.log('ERROR OCCURED, CHECK EMAIL OR SCRIPT LOG FOR DETAILS.');
          console.log(err.message);
          errors.push(row);
          moveAlong();
        }
      } else {
        csvWriter.writeRecords(errors).then(() => {
          console.log('WRITING ERRORS TO CSV!');
        });
        console.log('++++++++ DONE PROCESSING +++++++');
      }
    })();
  } else {
    console.log(
      `Invalid value for store: ${store}, please use 'retail', 'wholesale', 'warehouse' or 'professional' only.`
    );
  }
};

const validateStore = (store: string) => {
  const stores = ['retail', 'wholesale', 'warehouse', 'professional'];
  return stores.includes(store);
};

const search = async (
  store: string,
  email: string,
  firstName: string,
  lastName: string,
  tags: string
) => {
  try {
    console.log('SEARCHING FOR EMAIL:' + email);
    const searchResult = await searchByEmail(
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

const searchByEmail = async (
  store: string,
  email: string,
  firstName: string,
  lastName: string,
  tags: string
) => {
  const query = `
    query($filter: String!) {
      customers(first:10, query: $filter) {
        edges {
          node {
            id
            verifiedEmail
            firstName
            lastName
          }
        }
      }
    }
  `;

  const variables = {
    filter: `email:${email}`,
  };

  try {
    const response = await fetch(
      'https://' +
        config[store].name +
        '.myshopify.com/admin/api/2020-10/graphql.json',
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

    console.log(searchResult);
    if (searchResult.data.customers.edges.length > 0) {
      const shopifyCustomer = searchResult.data.customers.edges[0].node;
      console.log('FOUND SHOPIFY CUSTOMER', shopifyCustomer.id);

      const customer = {
        customer: {
          id: shopifyCustomer.id,
        },
      };

      return customer;
    } else {
      console.log('CUSTOMER NOT FOUND, LETS CREATE THEM');
      // create customer
      const createdCustomer = await createCustomer(
        store,
        email,
        firstName,
        lastName,
        tags
      );
      if (!createdCustomer) {
        console.log('ERROR CREATING CUSTOMER');
        return false;
      }
      const newCustomer = {
        customer: {
          id: createdCustomer.data.customerCreate.customer.id,
        },
      };
      return newCustomer;
    }
  } catch (err: any) {
    console.log(err.message);
    throw new Error(err.message);
  }
};

const createCustomer = async (
  store: string,
  email: string,
  firstName: string,
  lastName: string,
  tags: string
) => {
  const variables = {
    input: {
      email: email,
      firstName: firstName,
      lastName: lastName,
      tags: tags,
    },
  };
  const query = `
    mutation customerCreate($input: CustomerInput!) {
      customerCreate(input: $input) {
        userErrors {
          field
          message
        }
        customer {
          id
          email
          tags
        }
      }
    }
  `;

  try {
    const response = await fetch(
      `https://${config[store].name}.myshopify.com/admin/api/2020-10/graphql.json`,
      {
        method: 'post',
        body: JSON.stringify({ query, variables }),
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': config[store].pass,
        },
      }
    );

    const createdCustomer = await response.json();
    console.log('CREATE CUSTOMER RESPONSE');
    console.log(createdCustomer.data.customerCreate);
    if (createdCustomer.data.customerCreate.customer.id === null) {
      const errors = createdCustomer.data.customerCreate.userErrors;
      console.log('ERRORS:', errors);
    }
    return createdCustomer;
  } catch (err: any) {
    console.log(err.message);
    throw new Error(err.message);
  }
};

const customerUpdate = async (store: string, id: string, tags: string) => {
  const variables = {
    input: {
      id: id,
      tags: tags,
    },
  };
  const query = `
    mutation customerUpdate($input: CustomerInput!) {
      customerUpdate(input: $input) {
        userErrors {
          field
          message
        }
        customer {
          id
          email
          tags
        }
      }
    }
  `;

  try {
    const response = await fetch(
      `https://${config[store].name}.myshopify.com/admin/api/2020-10/graphql.json`,
      {
        method: 'post',
        body: JSON.stringify({ query, variables }),
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': config[store].pass,
        },
      }
    );

    const updatedCustomer = await response.json();
    console.log('UPDATED CUSTOMER RESPONSE');
    console.log(updatedCustomer);
    if (updatedCustomer.data.customerUpdate.id === null) {
      const errors = updatedCustomer.data.customerUpdate.userErrors;
      console.log('ERRORS:', errors);
    }
    return updatedCustomer;
  } catch (err: any) {
    console.log(err.message);
    throw new Error(err.message);
  }
};
