const mutation = `#graphql
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

export default mutation;
