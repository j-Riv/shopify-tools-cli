const mutation = `#graphql
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

export default mutation;
