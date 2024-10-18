import * as CSVWriter from 'csv-writer';
import path from 'path';

import config from '../config/shopify';
import { shopifyEndpoint } from './const';
import type { ShopifyResponse, CSVWriterType, CSVRecord } from './types';

export const printConfig = (
  store: string,
  csvFileToImport: string,
  errorFileName: string
) => {
  console.log('========== CONFIG ==========');
  console.log('STORE:', store);
  console.log('IMPORT FILE', csvFileToImport);
  console.log('EXPORT FILE', errorFileName);
  console.log('======= CREDENTIALS ========');
  console.log('KEY:', config[store].key);
  console.log('PASS:', config[store].pass);
  console.log('============================');
};

export const validateStore = (store: string) => {
  const stores = Object.keys(config);
  return stores.includes(store);
};

export const fetchAdmin = async <T>(
  store: string,
  query: string,
  variables?: any
): Promise<ShopifyResponse<T>> => {
  const body: { query: string; variables?: any } = {
    query,
  };
  if (variables) {
    body.variables = variables;
  }
  try {
    const response = await fetch(
      `https://${config[store].name}${shopifyEndpoint}`,
      {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': config[store].pass,
        },
      }
    );

    const responseJson = await response.json();

    return responseJson;
  } catch (err: any) {
    console.log(err.message);
    throw new Error(err.message);
  }
};

export const initializeCSV = (
  filename: string,
  header: { id: string; title: string }[]
) => {
  const createCSVWriter = CSVWriter.createObjectCsvWriter;
  const csvWriter = createCSVWriter({
    path: path.join(__dirname, `../../errors/${filename}.csv`),
    header,
  });
  return csvWriter;
};

export const writeCSVRow = async (
  csvWriter: CSVWriterType,
  record: CSVRecord
) => await csvWriter.writeRecords([record]);

export const writeRecords = async (
  csvWriter: CSVWriterType,
  records: CSVRecord[]
) => await csvWriter.writeRecords(records);
