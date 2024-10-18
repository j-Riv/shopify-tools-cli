import { fetchAdmin } from '../utils';
import {
  tagsAddMutation,
  tagsRemoveMutation,
  searchBySKUQuery,
  searchBySKUv2Query,
  metafieldsSetMutation,
  productVariantUpdateMutation,
} from '../schema/admin';
import type {
  TagsAddMutation,
  TagsRemoveMutation,
  SearchBySkuQuery,
  SearchBySkUv2Query,
  MetafieldsSetMutation,
  ProductVariantUpdateMutation,
} from '../types/admin.generated';

export const addShopifyProductTags = async (
  store: string,
  id: string,
  tags: string[]
) => {
  const variables = {
    id: id,
    tags: tags,
  };

  try {
    const updatedProduct = await fetchAdmin<TagsAddMutation>(
      store,
      tagsAddMutation,
      variables
    );

    if (updatedProduct?.errors) {
      throw new Error(updatedProduct.errors[0].message);
    }

    if (updatedProduct?.data?.tagsAdd?.userErrors) {
      throw new Error(updatedProduct.data.tagsAdd.userErrors[0].message);
    }

    if (!updatedProduct.data) {
      throw new Error('Product tags not updated');
    }

    console.log('UPDATED PRODUCT RESPONSE');
    console.log(updatedProduct);

    return updatedProduct;
  } catch (err: any) {
    console.log('ERROR UPDATING PRODUCT TAGS', err.message);
    return false;
  }
};

export const removeShopifyProductTags = async (
  store: string,
  id: string,
  tags: string[]
) => {
  const variables = {
    id: id,
    tags: tags,
  };

  try {
    const updatedProduct = await fetchAdmin<TagsRemoveMutation>(
      store,
      tagsRemoveMutation,
      variables
    );

    if (updatedProduct?.errors) {
      throw new Error(updatedProduct.errors[0].message);
    }

    if (updatedProduct?.data?.tagsRemove?.userErrors) {
      throw new Error(updatedProduct.data.tagsRemove.userErrors[0].message);
    }

    if (!updatedProduct.data) {
      throw new Error('Product tags not updated');
    }

    console.log('UPDATED PRODUCT RESPONSE');
    console.log(updatedProduct);

    return updatedProduct;
  } catch (err: any) {
    console.log(err.message);
    return false;
  }
};

export const searchBySku = async (store: string, sku: string) => {
  const variables = {
    filter: `sku:${sku}`,
  };

  try {
    const searchResult = await fetchAdmin<SearchBySkuQuery>(
      store,
      searchBySKUQuery,
      variables
    );

    if (searchResult.errors) {
      throw new Error(searchResult.errors[0].message);
    }

    if (!searchResult.data) {
      throw new Error('Product not found');
    }

    if (!searchResult.data.products) {
      throw new Error('Product not found');
    }

    const product = searchResult.data.products.edges[0].node;
    console.log('FOUND SHOPIFY PRODUCTS', product.id);
    let id: string;
    if (product.hasOnlyDefaultVariant) {
      id = product.id;
    } else {
      console.log('MATCHING SKU TO PRODUCT VARIANT');
      const variants = product.variants.edges;
      const found = variants.find(function (variant) {
        return variant.node.sku === sku;
      });

      if (!found) {
        throw new Error('Variant not found');
      }

      console.log('VARIANT FOUND', found.node.id);
      id = found.node.id;
    }

    const item = {
      product: {
        id: id,
      },
    };

    return item;
  } catch (err: any) {
    console.log(err.message);
    return false;
  }
};

export const searchBySkuV2 = async (
  store: string,
  sku: string,
  isProduct = false
) => {
  const type = isProduct ? 'PRODUCT' : 'VARIANT';

  const variables = {
    filter: `sku:${sku}`,
  };

  try {
    const searchResult = await fetchAdmin<SearchBySkUv2Query>(
      store,
      searchBySKUv2Query,
      variables
    );

    if (searchResult?.errors) {
      throw new Error(searchResult.errors[0].message);
    }

    if (!searchResult?.data?.products) {
      throw new Error('Product not found');
    }

    // loop through products
    const products = searchResult.data.products.edges;
    let productFound: string | null = null;
    console.log(`FOUND ${products.length} POSSIBLE PRODUCTS`);
    console.log('MATCHING SKU TO PRODUCT VARIANT');
    products.forEach(product => {
      if (productFound) return;
      const variants = product.node.variants.edges;
      const found = variants.find(function (variant) {
        return variant.node.sku === sku;
      });
      if (found) {
        console.log(`${type} FOUND`, found.node.id);
        productFound = isProduct ? product.node.id : found.node.id;
      }
    });

    if (productFound) {
      console.log(`BUILDING ${type} OBJECT`, productFound);
      const variant = {
        product: {
          id: productFound,
        },
      };

      return variant;
    } else {
      return false;
    }
  } catch (err: any) {
    console.log(err.message);
    return false;
  }
};

export const updateShopifyProductMetafields = async (
  store: string,
  id: string,
  metafield: {
    type: string;
    namespace: string;
    key: string;
    value: string;
  }
) => {
  const variables = {
    metafields: {
      ownerId: id,
      type: metafield.type,
      namespace: metafield.namespace,
      key: metafield.key,
      value: metafield.value,
    },
  };

  console.log('UPDATING OWNER ID', id);
  console.log('METAFIELD VALUE', variables);

  try {
    const updatedMetafield = await fetchAdmin<MetafieldsSetMutation>(
      store,
      metafieldsSetMutation,
      variables
    );

    if (updatedMetafield?.errors) {
      throw new Error(updatedMetafield.errors[0].message);
    }

    if (updatedMetafield?.data?.metafieldsSet?.userErrors) {
      throw new Error(
        updatedMetafield.data.metafieldsSet.userErrors[0].message
      );
    }

    if (!updatedMetafield.data) {
      throw new Error('Metafield not updated');
    }

    console.log('UPDATED METAFIELD RESPONSE');

    return updatedMetafield;
  } catch (err: any) {
    console.log('ERROR:', err.message);
    return false;
  }
};

export const updateShopifyProductVariantPrice = async (
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

  try {
    const updatedProduct = await fetchAdmin<ProductVariantUpdateMutation>(
      store,
      productVariantUpdateMutation,
      variables
    );

    if (updatedProduct?.errors) {
      throw new Error(updatedProduct.errors[0].message);
    }

    if (updatedProduct?.data?.productVariantUpdate?.userErrors) {
      throw new Error(
        updatedProduct.data.productVariantUpdate.userErrors[0].message
      );
    }

    if (!updatedProduct.data) {
      throw new Error('Product price not updated');
    }

    console.log('UPDATED PRODUCT RESPONSE');
    console.log(updatedProduct);

    return updatedProduct;
  } catch (err: any) {
    console.log(err.message);
    return false;
  }
};
