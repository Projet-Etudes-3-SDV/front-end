import { SubscriptionPlan } from './subscription.interface';

export enum OrderStatus {
  PAID = 'paid',
  PENDING = 'pending',
  CANCELLED = 'cancelled',
}

export interface OrderProductItem {
  product: string;
  plan: SubscriptionPlan;
}

export interface Order {
  id: string;
  user: string;
  total: number;
  status: OrderStatus;
  sessionId?: string;
  orderDate: Date;
  products: OrderProductItem[];
}
