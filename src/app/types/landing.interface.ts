export interface CarouselProduct {
  product: string;
  order: number;
}

export interface Landing {
  id: string;
  header: {
    title: string;
    subtitle?: string;
  };
  carouselSection?: {
    title: string;
    description?: string;
    products: CarouselProduct[];
    order: number;
  };
  categorySection?: {
    title: string;
    description?: string;
    order: number;
  };
}
