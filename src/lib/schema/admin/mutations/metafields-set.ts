const mutation = `#graphql
  mutation metafieldsSet($metafields: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafields) {
      metafields {
        namespace
        key
        value
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export default mutation;
