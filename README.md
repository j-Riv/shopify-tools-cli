# SHOPIFY TOOLS

This is a command-line tool built to simplify bulk editing of Shopify store data using the Shopify Admin API. It allows you to efficiently update products, product variants, and customer information in bulk by importing data from a CSV file. The tool automates the process of iterating through large datasets, making it easier to manage bulk price adjustments and tag updates, saving time and reducing manual work.

Features:

- Product:
  - Tag updates
- Product Variant:
  - Price and Compare At Price updates
- Customer:
  - Tag Updates

```
index.js <command> <option> <option-value>

Commands:
  index.js updatePrices           Updates product variants price & compare at
                                  price.
  index.js addProductTags         Adds tags to products.
  index.js removeProductTags      Removes tags from products.
  index.js getProductsByTemplate  Gets products by template.
  index.js tagCustomers           Adds tags to customer, if customer does not
                                  exists it will create them.
  index.js updateMetafields       Updates metafields

Options:
      --version   Show version number                                  [boolean]
  -i, --import    The name of the csv to import ex: shopify-import      [string]
  -e, --export    What to name the errors export ex: shopify-errors     [string]
  -t, --tags      The tags to add to the product ex `tag1, tag2, tag3`  [string]
  -p, --template  The product template to search for `template-suffix`  [string]
  -h, --help      Show help                                            [boolean]
```

## Setup

### CSV Imports

CSV imports are expected to be in `/csv` directory

### Config

Copy `src/config/example.shopify.ts` to `src/config/shopify.ts` and update with env variables for the following:

```bash
# Shopify Admin API
SHOPIFY_API_VERSION="2024-07"
RETAIL_API_KEY="store api key"
RETAIL_API_PASSWORD="store api password"
RETAIL_STORE_NAME="store name"
WHOLESALE_API_KEY="store api key"
WHOLESALE_API_PASSWORD="store api password"
WHOLESALE_STORE_NAME="store name"
```

If more stores get added .env file should be updated, as well as the config object.

## Build

```bash
npm run build
```

## Run

### Commands

#### Update Prices

> Updates product variants price & compare at price.

CSV header

<table>
  <tr>
    <th>SKU</th>
    <th>NewPrice</th>
    <th>NewCompareAtPrice</th>
  </tr>
</table>

```bash
node lib/index.js updatePrices --store 'STORE_NAME' --import 'CSV_FILE_TO_IMPORT' --export 'CSV_FILE_TO_EXPORT_ERRORS'
```

ex: node lib/index.js updatePrices --store 'retail' --import 'shopify-import-test' --export 'shopify-errors'

#### Add Tags

> Adds tags to products. Tags can either be passed via an argument or via the csv. Will default to csv then argument.

CSV header: <em>tags are optional, if passed as argument</em>

<table>
  <tr>
    <th>SKU</th>
    <th>Tags</th>
  </tr>
</table>

```bash
node lib/index.js addProductTags --store 'STORE_NAME' --import 'CSV_FILE_TO_IMPORT' --export 'CSV_FILE_TO_EXPORT_ERRORS' --tags 'tag1, tag2, tag3'
```

ex: node lib/index.js addProductTags --store 'retail' --import 'shopify-import-test' --export 'shopify-errors' --tags 'tag1, tag2, tag3'

#### Remove Tags

> Remove tags from products. Tags can either be passed via an argument or via the csv. Will default to csv then argument.

CSV header: <em>tags are optional, if passed as argument</em>

<table>
  <tr>
    <th>SKU</th>
    <th>Tags</th>
  </tr>
</table>

```bash
node lib/index.js removeProductTags --store 'STORE_NAME' --import 'CSV_FILE_TO_IMPORT' --export 'CSV_FILE_TO_EXPORT_ERRORS' --tags 'tag1, tag2, tag3'
```

ex: node lib/index.js removeProductTags --store 'retail' --import 'shopify-import-test' --export 'shopify-errors' --tags 'tag1, tag2, tag3'

#### Customer Add Tags

CSV header: <em>tags are optional, if passed as argument</em>

<table>
  <tr>
    <th>Email</th>
    <th>FirstName</th>
    <th>LastName</th>
    <th>Tags</th>
  </tr>
</table>

> Add tags to customer, if customer not found it creates the customer and adds the tags. Tags can either be passed via an argument or via the csv. Will default to csv then argument.

```bash
node lib/index.js tagCustomers --store 'STORE_NAME' --import 'CSV_FILE_TO_IMPORT' --export 'CSV_FILE_TO_EXPORT_ERRORS' --tags 'tag1, tag2, tag3'
```

ex: node lib/index.js tagCustomers --store 'retail' --import 'shopify-import-test' --export 'shopify-errors' --tags 'tag1, tag2, tag3'

#### Get Products By Template

> Gets all products by product template.

```bash
node lib/index.js getProductsByTemplate --store 'STORE_NAME' --template 'TEMPLATE_SUFFIX'
```

ex: node lib/index.js getProductsByTemplate --store 'retail' --template 'template-suffix'

#### Update Metafields

> Updates metafields

CSV header

<table>
  <tr>
    <th>SKU</th>
    <th>MetafieldNamespace</th>
    <th>MetafieldKey</th>
    <th>MetafieldType</th>
    <th>MetafieldValue</th>
  </tr>
</table>

Metafield Types can be found [here](https://shopify.dev/apps/metafields/definitions/types).

```bash
node lib/index.js updateMetafields --store 'STORE_NAME' --import 'CSV_FILE_TO_IMPORT' --export 'CSV_FILE_TO_EXPORT_ERRORS'
```

ex: node lib/index.js updateMetafields --store 'retail' --import 'shopify-import-test' --export 'shopify-errors'
