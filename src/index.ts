import yargs from 'yargs';
import { updatePrices } from './functions/update-prices-v2';
import { addTags } from './functions/add-tags';
import { removeTags } from './functions/remove-tags';
import { tagCustomers } from './functions/customer-add-tags';
import { getProductsByTemplate } from './functions/get-products-by-template';
import { updateMetafields } from './functions/update-metafields';

const argv: any = yargs
  .command(
    'updatePrices',
    'Updates product variants price & compare at price.',
    {
      store: {
        description:
          'The Shopify config to use. Valid values: retail, wholesale, warehouse, professional, staging_retail, staging_wholesale',
        alias: 's',
        type: 'string',
      },
    }
  )
  .command('addProductTags', 'Adds tags to products.', {
    store: {
      description:
        'The Shopify config to use. Valid values: retail, wholesale, warehouse, professional, staging_retail, staging_wholesale',
      alias: 's',
      type: 'string',
    },
  })
  .command('removeProductTags', 'Removes tags from products.', {
    store: {
      description:
        'The Shopify config to use. Valid values: retail, wholesale, warehouse, professional, staging_retail, staging_wholesale',
      alias: 's',
      type: 'string',
    },
  })
  .command('getProductsByTemplate', 'Gets products by template.', {
    store: {
      description:
        'The Shopify config to use. Valid values: retail, wholesale, warehouse, professional, staging_retail, staging_wholesale',
      alias: 's',
      type: 'string',
    },
  })
  .command(
    'tagCustomers',
    'Adds tags to customer, if customer does not exists it will create them.',
    {
      store: {
        description:
          'The Shopify config to use. Valid values: retail, wholesale, warehouse, professional, staging_retail, staging_wholesale',
        alias: 's',
        type: 'string',
      },
    }
  )
  .command('updateMetafields', 'Updates metafields', {
    store: {
      description:
        'The Shopify config to use. Valid values: retail, wholesale, warehouse, professional, staging_retail, staging_wholesale',
      alias: 's',
      type: 'string',
    },
    import: {
      description:
        'The name of the csv to import ex: shopify-import, expected header values: SKU, MetafieldNamespace, MetafieldKey, MetafieldType, MetafieldValue.',
      alias: 'i',
      type: 'string',
    },
  })
  .option('import', {
    description: 'The name of the csv to import ex: shopify-import',
    alias: 'i',
    type: 'string',
  })
  .option('export', {
    description: 'What to name the errors export ex: shopify-errors',
    alias: 'e',
    type: 'string',
  })
  .option('tags', {
    description: 'The tags to add to the product ex `tag1, tag2, tag3`',
    alias: 't',
    type: 'string',
  })
  .option('template', {
    description: 'The product template to search for `template-suffix`',
    alias: 'p',
    type: 'string',
  })
  .help()
  .alias('help', 'h')
  .demandCommand().argv;

const main = () => {
  if (argv.store) {
    if (argv._.includes('updatePrices') && argv.import) {
      updatePrices(argv);
    } else if (argv._.includes('addProductTags') && argv.import) {
      addTags(argv);
    } else if (argv._.includes('removeProductTags') && argv.import) {
      removeTags(argv);
    } else if (argv._.includes('tagCustomers') && argv.import) {
      tagCustomers(argv);
    } else if (argv._.includes('getProductsByTemplate') && argv.template) {
      getProductsByTemplate(argv);
    } else if (argv._.includes('updateMetafields') && argv.import) {
      updateMetafields(argv);
    } else {
      console.log('Invalid command.');
    }
  } else {
    console.log('Error! Please supply store. Ex: --store: retail');
  }
};

main();
