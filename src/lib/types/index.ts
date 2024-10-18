import type { CsvWriter } from 'csv-writer/src/lib/csv-writer';
import type { ObjectMap } from 'csv-writer/src/lib/lang/object';

export type ShopifyResponse<T> = {
  data: T;
  errors?: any;
};

export type CSVRecord = ObjectMap<any>;

export type CSVWriterType = CsvWriter<CSVRecord>;

export type Row = {
  [key: string]: string;
};
