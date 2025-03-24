import { OrderStatus } from './models';

export interface CartItemDTO {
  userId: number;
  productVariantId: number;
  quantity: number;
}

export interface CategoryDTO {
  id: number;
  name: string;
  parentCategoryId: number;
}

export interface CategoryTreeDTO {
  categoryId: number;
  name: string;
  subcategories: SubcategoryDTO[];
}

export interface SubcategoryDTO {
  subcategoryId: number;
  name: string;
}

export interface OrderDTO {
  userId: number;
  paymentType: string;
  status: OrderStatus;
}

export interface ProductVariantDTO {
  productId: number;
  sizeOptionId: number;
  frameOptionId: number;
  price: number;
}

export interface UserDTO {
  name: string;
  username: string;
  password: string;
  address: string;
  roleId: number;
}