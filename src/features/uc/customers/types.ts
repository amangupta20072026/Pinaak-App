import type { ISODateTime } from '@app-types/datetime';

export type CustomerType = 'personal' | 'corporate';

export type Customer = {
  id: string;
  type: CustomerType;
  name: string;
  phone: string;            // E.164 preferred, but service normalises anyway
  email: string;
  city: string;
  gstin?: string;           // corporate only
  createdAt: ISODateTime;
  totalBookings: number;
  lastBookingAt: ISODateTime | null;
};

export type CustomerFilter = 'all' | CustomerType;