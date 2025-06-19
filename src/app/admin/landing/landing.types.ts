// Interface pour les produits du carousel quand ils sont populés (réception depuis le backend)
export interface ICarouselProductPopulated {
  product: {
    id: string;
    name: string;
    description: string;
    category: {
      id: string;
      name: string;
      description: string;
      imageUrl?: string;
    };
    monthlyPrice: number;
    yearlyPrice: number;
    available: boolean;
    features: Array<{
      title: string;
      description: string;
    }>;
    imageUrl?: string;
  };
  order: number;
}

// Interface pour les produits du carousel quand on envoie au backend (création/édition)
export interface ICarouselProductRequest {
  product: string; // ID du produit
  order: number;
}

// Interface pour les landing pages reçues du backend (avec produits populés)
export interface ILanding {
  id: string;
  header: { 
    title: string; 
    subtitle?: string;
  };
  carouselSection: { 
    title: string; 
    description: string; 
    products: ICarouselProductPopulated[]; 
    order: number;
  };
  categorySection: { 
    title: string; 
    description: string; 
    order: number;
    categories: ICategory[]; // Directement la liste des catégories, pas de structure wrapper
  };
  alert?: { 
    title: string; 
    description?: string; 
    type: "info" | "warning" | "error" | "success"; 
    order: number;
  };
  isMain?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Interface pour les catégories sélectionnées pour l'affichage
export interface ICategorySelection {
  category: string; // ID de la catégorie
  order: number;
}

// Interface pour les catégories
export interface ICategory {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
}

// Interface pour les landing pages envoyées au backend (création/édition)
export interface ILandingRequest {
  header: { 
    title: string; 
    subtitle?: string;
  };
  carouselSection?: { 
    title: string; 
    description: string; 
    products: ICarouselProductRequest[]; 
    order: number;
  };
  categorySection?: { 
    title: string; 
    description: string; 
    order: number;
    categories: ICategorySelection[]; // Catégories sélectionnées avec ordre
  };
  alert?: ({
    title: string;
    description?: string;
    type: "info" | "warning" | "error" | "success";
    order: number;
  } | null);
  isMain: boolean;
}

// Interface pour les produits avec prix (utilisée pour l'affichage)
export interface DisplayProduct {
  id: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  imageUrl?: string;
  order: number;
}

export interface LandingTableData extends ILanding {
  selected: boolean;
}

export interface LandingFormData {
  header: {
    title: string;
    subtitle: string;
  };
  carouselSection: {
    enabled: boolean;
    title: string;
    description: string;
    order: number;
    selectedProducts: Array<{ productId: string; order: number }>;
  };
  categorySection: {
    enabled: boolean;
    title: string;
    description: string;
    order: number;
    selectedCategories: Array<{ categoryId: string; order: number }>;
  };
  alert: {
    enabled: boolean;
    title: string;
    description: string;
    type: "info" | "warning" | "error" | "success";
    order: number;
  };
  isMain: boolean;
}