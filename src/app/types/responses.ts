export interface FiltersProps {
  priceRange: [number, number];
  setPriceRange: React.Dispatch<React.SetStateAction<[number, number]>>;
  selectedColors: string[];
  setSelectedColors: React.Dispatch<React.SetStateAction<string[]>>;
  selectedSizes: string[];
  setSelectedSizes: React.Dispatch<React.SetStateAction<string[]>>;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
}

// ProductGridProps
export interface ProductGridProps {
    products: Product[];
  }
  type Product = {
    id: number;
    name: string;
    price: number;
    originalPrice?: number;
    onSale: boolean;
    image: string;
  };

// Product-Detail Interfaces
export interface Size {
    sizeId: number;
    name: string;
}

export interface ProductSize {
    productSizeId: number;
    size: Size;
    price: number;
}

export interface ProductType {
    productId: number;
    name: string;
    description: string;
    images: string[];
    sizes: ProductSize[];
}