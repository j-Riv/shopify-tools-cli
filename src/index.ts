import yargs from 'yargs';
import { updatePrices } from './functions/update-prices';
import { addTags } from './functions/add-tags';
import { removeTags } from './functions/remove-tags';
import { tagCustomers } from './functions/customer-add-tags';
import { getProductsByTemplate } from './functions/get-products-by-template';

const argv: any = yargs
  .command(
    'updatePrices',
    'Updates product variants price & compare at price.',
    {
      store: {
        description:
          'The Shopify config to use. Valid values: retail, wholesale, warehouse, professional',
        alias: 's',
        type: 'string',
      },
    }
  )
  .command('addProductTags', 'Adds tags to products.', {
    store: {
      description:
        'The Shopify config to use. Valid values: retail, wholesale, warehouse, professional',
      alias: 's',
      type: 'string',
    },
  })
  .command('removeProductTags', 'Removes tags from products.', {
    store: {
      description:
        'The Shopify config to use. Valid values: retail, wholesale, warehouse, professional',
      alias: 's',
      type: 'string',
    },
  })
  .command('getProductsByTemplate', 'Gets products by template.', {
    store: {
      description:
        'The Shopify config to use. Valid values: retail, wholesale, warehouse, professional',
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
          'The Shopify config to use. Valid values: retail, wholesale, warehouse, professional',
        alias: 's',
        type: 'string',
      },
    }
  )
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
    description:
      'The product template to search for `description-metafield-options`',
    alias: 'te',
    type: 'string',
  })
  .help()
  .alias('help', 'h')
  .demandCommand().argv;

const main = () => {
  if (argv._.includes('updatePrices')) {
    updatePrices(argv);
  } else if (argv._.includes('addProductTags')) {
    addTags(argv);
  } else if (argv._.includes('removeProductTags')) {
    removeTags(argv);
  } else if (argv._.includes('tagCustomers')) {
    tagCustomers(argv);
  } else if (argv._.includes('getProductsByTemplate')) {
    getProductsByTemplate(argv);
  } else {
    console.log('Invalid command.');
  }
};

main();
