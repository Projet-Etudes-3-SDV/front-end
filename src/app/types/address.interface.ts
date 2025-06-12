export enum AddressType {
  BILLING = 'billing',
  SHIPPING = 'shipping',
}

export interface Address {
  street: string;
  city: string;
  postalCode: string;
  country: string;
  type: AddressType;
  phone?: string;
}
