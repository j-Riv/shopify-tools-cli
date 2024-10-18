const query = `#graphql
  query getCustomersByEmail($filter: String!) {
    customers(first:10, query: $filter) {
      edges {
        node {
          id
          verifiedEmail
          firstName
          lastName
        }
      }
    }
  }
`;

export default query;
