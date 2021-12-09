# SHOPIFY TOOLS

> CLI to bulk edit Shopify Products / Variants, and Customers. Uses CSV to import and iterate over data.

```
index.js <command> <option> <option-value>

Commands:
  index.js updatePrices       Updates product variants price & compare at price.
  index.js addProductTags     Adds tags to products.
  index.js removeProductTags  Removes tags from products.
  index.js tagCustomers       Adds tags to customer, if customer does not exists it will create them.

Options:
      --version  Show version number                                   [boolean]
  -i, --import   The name of the csv to import ex: shopify-import       [string]
  -e, --export   What to name the errors export ex: shopify-errors      [string]
  -t, --tags     The tags to add to the product ex `tag1, tag2, tag3`   [string]
  -h, --help     Show help                                             [boolean]
```

## Setup

### CSV Imports

Product csv imports require the following columns.

<table>
  <tr>
    <th>Internal ID</th>
    <th>SKU</th>
    <th>NewPrice</th>
    <th>NewCompareAtPrice</th>
    <th>Tags</th>
  </tr>
  <tr>
    <td>Optional</td>
    <td>Required for product matching</td>
    <td>Required for updating pricing</td>
    <td>Required for updating pricing</td>
    <td>Optional, if not used, you must pass tags via argument</td>
  </tr>
</table>

Customer csv imports require the following columns.

<table>
  <tr>
    <th>Internal ID</th>
    <th>Email</th>
    <th>FirstName</th>
    <th>LastName</th>
    <th>Tags</th>
  </tr>
  <tr>
    <td>Optional</td>
    <td>Required for customer matching</td>
    <td>Optional, used during customer creation</td>
    <td>Optional, used during customer creation</td>
    <td>Optional, if not used, you must pass tags via argument</td>
  </tr>
</table>

### Config

Requires .env (config/shopify) file with the following:

```bash
# Retail
RETAIL_API_KEY="store api key"
RETAIL_API_PASSWORD="store api password"
RETAIL_STORE_NAME="store name"
# Wholesale
WHOLESALE_API_KEY="store api key"
WHOLESALE_API_PASSWORD="store api password"
WHOLESALE_STORE_NAME="store name"
# Warehouse
WAREHOUSE_API_KEY="store api key"
WAREHOUSE_API_PASSWORD="store api password"
WAREHOUSE_STORE_NAME="store name"
# Professional
PROFESSIONAL_API_KEY="store api key"
PROFESSIONAL_API_PASSWORD="store api password"
PROFESSIONAL_STORE_NAME="store name"
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

```
node lib/index.js updatePrices --store 'STORE_NAME' --import 'CSV_FILE_TO_IMPORT' --export 'CSV_FILE_TO_EXPORT_ERRORS'
```

ex: node lib/index.js updatePrices --store 'retail' --import 'shopify-import-test' --export 'shopify-errors'

#### Add Tags

> Adds tags to products. Tags can either be passed via an argument or via the csv. Will default to csv then argument.

```
node lib/index.js addProductTags --store 'STORE_NAME' --import 'CSV_FILE_TO_IMPORT' --export 'CSV_FILE_TO_EXPORT_ERRORS' --tags 'tag1, tag2, tag3'
```

ex: node lib/index.js addProductTags --store 'retail' --import 'shopify-import-test' --export 'shopify-errors' --tags 'tag1, tag2, tag3'

#### Remove Tags

> Remove tags from products. Tags can either be passed via an argument or via the csv. Will default to csv then argument.

```
node lib/index.js removeProductTags --store 'STORE_NAME' --import 'CSV_FILE_TO_IMPORT' --export 'CSV_FILE_TO_EXPORT_ERRORS' --tags 'tag1, tag2, tag3'
```

ex: node lib/index.js removeProductTags --store 'retail' --import 'shopify-import-test' --export 'shopify-errors' --tags 'tag1, tag2, tag3'

#### Customer Add Tags

> Add tags to customer, if customer not found it creates the customer and adds the tags. Tags can either be passed via an argument or via the csv. Will default to csv then argument.

```
node lib/index.js tagCustomers --store 'STORE_NAME' --import 'CSV_FILE_TO_IMPORT' --export 'CSV_FILE_TO_EXPORT_ERRORS' --tags 'tag1, tag2, tag3'
```

ex: node lib/index.js tagCustomers --store 'retail' --import 'shopify-import-test' --export 'shopify-errors' --tags 'tag1, tag2, tag3'

#### Get Products By Template

> Gets all products by product template.

```
node lib/index.js getProductsByTemplate --store 'STORE_NAME' --template 'TEMPLATE_SUFFIX'
```

ex: node lib/index.js getProductsByTemplate --store 'retail' --template 'template-suffix'
