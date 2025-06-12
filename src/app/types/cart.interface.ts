import { SubscriptionPlan } from './subscription.interface';

export interface CartProductItem {
  product: string;
  quantity: number;
  plan: SubscriptionPlan;
}

export interface Cart {
  id: string;
  products: CartProductItem[];
  owner: string;
}
