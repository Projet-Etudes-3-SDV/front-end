export interface ProductFeature {
  title: string;
  description: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: {
    id: string;
    name: string;
    description: string;
    imageUrl?: string;
  }
  available: boolean;
  addedDate: Date;
  stripeProductId: string;
  stripePriceId: string;
  stripePriceIdYearly: string;
  features: ProductFeature[];
  imageUrl?: string;
  active?: boolean;
}
