import { fetchAdmin } from '../utils';
import {
  customerCreateMutation,
  customerUpdateMutation,
  getCustomersByEmailQuery,
} from '../schema/admin';
import type {
  CustomerCreateMutation,
  CustomerUpdateMutation,
  GetCustomersByEmailQuery,
} from '../types/admin.generated';

export const createCustomer = async (
  store: string,
  email: string,
  firstName: string,
  lastName: string,
  tags: string
) => {
  const variables = {
    input: {
      email: email,
      firstName: firstName,
      lastName: lastName,
      tags: tags,
    },
  };

  try {
    const createdCustomer = await fetchAdmin<CustomerCreateMutation>(
      store,
      customerCreateMutation,
      variables
    );

    if (createdCustomer?.errors && createdCustomer.errors.length > 0) {
      throw new Error(createdCustomer.errors[0].message);
    }

    if (!createdCustomer.data?.customerCreate) {
      throw new Error('Customer not created');
    }

    if (
      createdCustomer?.data?.customerCreate.userErrors &&
      createdCustomer.data.customerCreate.userErrors.length > 0
    ) {
      throw new Error(
        createdCustomer.data.customerCreate.userErrors[0].message
      );
    }

    console.log('CREATE CUSTOMER RESPONSE');
    console.log(createdCustomer.data.customerCreate);

    return createdCustomer;
  } catch (err: any) {
    console.log(err.message);
    return false;
  }
};

export const searchForCustomerByEmail = async (
  store: string,
  email: string,
  firstName: string,
  lastName: string,
  tags: string
) => {
  const variables = {
    filter: `email:${email}`,
  };

  try {
    const searchResult = await fetchAdmin<GetCustomersByEmailQuery>(
      store,
      getCustomersByEmailQuery,
      variables
    );

    if (searchResult?.errors && searchResult.errors.length > 0) {
      throw new Error(searchResult.errors[0].message);
    }

    if (!searchResult?.data?.customers) {
      throw new Error('Customer not found');
    }

    const { customers } = searchResult.data;

    console.log(searchResult);
    if (customers.edges.length > 0) {
      const shopifyCustomer = customers.edges[0].node;
      console.log('FOUND SHOPIFY CUSTOMER', shopifyCustomer.id);

      const customer = {
        customer: {
          id: shopifyCustomer.id,
        },
      };

      return customer;
    } else {
      console.log('CUSTOMER NOT FOUND, LETS CREATE THEM');
      // create customer
      const createdCustomer = await createCustomer(
        store,
        email,
        firstName,
        lastName,
        tags
      );

      if (!createdCustomer) {
        console.log('ERROR CREATING CUSTOMER');
        return false;
      }

      if (!createdCustomer?.data?.customerCreate?.customer) {
        console.log('ERROR CREATING CUSTOMER');
        return false;
      }
      const newCustomer = {
        customer: {
          id: createdCustomer.data.customerCreate.customer?.id,
        },
      };
      return newCustomer;
    }
  } catch (err: any) {
    console.log('ERROR', err.message);
    return false;
  }
};

export const customerUpdate = async (
  store: string,
  id: string,
  tags: string
) => {
  const variables = {
    input: {
      id: id,
      tags: tags,
    },
  };

  try {
    const updatedCustomer = await fetchAdmin<CustomerUpdateMutation>(
      store,
      customerUpdateMutation,
      variables
    );

    if (updatedCustomer?.errors && updatedCustomer.errors.length > 0) {
      throw new Error(updatedCustomer.errors[0].message);
    }

    if (!updatedCustomer?.data?.customerUpdate) {
      throw new Error('Customer not updated');
    }

    if (
      updatedCustomer?.data?.customerUpdate?.userErrors &&
      updatedCustomer.data.customerUpdate.userErrors.length > 0
    ) {
      throw new Error(
        updatedCustomer.data.customerUpdate.userErrors[0].message
      );
    }

    console.log('UPDATED CUSTOMER RESPONSE');
    console.log(updatedCustomer);

    return updatedCustomer;
  } catch (err: any) {
    console.log(err.message);
    return false;
  }
};
