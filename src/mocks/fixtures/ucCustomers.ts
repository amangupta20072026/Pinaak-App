import { mockCustomers } from '@mocks/data/customers';
import type { Customer } from '@features/uc/customers/types';

export const fixtureUcCustomersEmpty: Customer[] = [];

export const fixtureUcCustomersAll: Customer[] = mockCustomers;

export const fixtureUcCustomersPersonalOnly: Customer[] = mockCustomers.filter(
  c => c.type === 'personal',
);

export const fixtureUcCustomersCorporateOnly: Customer[] = mockCustomers.filter(
  c => c.type === 'corporate',
);