import type { ISODateTime } from '@app-types/datetime';

export type CustomerType = 'personal' | 'corporate';
export type CustomerStatus = 'active' | 'inactive' | 'blocked';

export type Customer = {
  id: string;
  type: CustomerType;
  status: CustomerStatus;
  name: string;
  phone: string;
  email: string;
  city: string;
  gstin?: string;
  createdAt: ISODateTime;
  totalBookings: number;
  lastBookingAt: ISODateTime | null;
};

export type CustomerFilter = 'all' | CustomerType;
export type StatusFilter = 'all' | CustomerStatus;