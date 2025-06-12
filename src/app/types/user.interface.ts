import { Address } from './address.interface';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  SUPERADMIN = 'superadmin',
  SUPPORT = 'support',
  CLIENT = 'client'
}

export interface User {
  id: string;
  lastName: string;
  firstName: string;
  email: string;
  phone?: string;
  role: UserRole;
  registrationDate: Date;
  lastLogin?: Date;
  cart: string[]; // or string if single cart
  isValidated: boolean;
  addresses: Address[];
  stripeCustomerId?: string;
}
