export interface Product {
    productId: number;
    name: string;
    description: string;
    variants: ProductVariant[];
}

export interface ProductVariant {
    productVariantId: number;
    sizeOption: SizeOption;
    frameOption: FrameOption;
    price: number;
}

export interface SizeOption {
    sizeOptionId: number;
    value: string;
}

export interface FrameOption {
    frameOptionId: number;
    value: string;
}

export interface ProductCategory {
    productCategoryId: number;
    category: Category;
    product: Product;
}

export interface Category {
    categoryId: number;
    name: string;
    parentCategory?: Category;
}

export interface User {
    userId: number;
    username: string;
    name: string;
    password: string;
    address: string;
    role: Role;
}

export interface Role {
    roleId: number;
    name: string;
}

export interface ShopOrder {
    orderId: number;
    orderItems: OrderItem[];
    user: User;
    paymentType: string;
    orderDate: string;  // ISO DateTime string
    orderTotal: number;
    status: OrderStatus;
}

export interface OrderItem {
    orderItemId: number;
    productVariant: ProductVariant;
    quantity: number;
}



export interface OrderDetail {
    id: string;
    status: string;
    timeline: {
      date: string;
      time: string;
      status: string;
      location: string;
    }[];
    shipping: {
      origin: string;
      destination: string;
      courier: string;
      courierDetail: string;
    };
    delivery: {
      estimatedArrival: string;
      deliveredIn: string;
    };
    recipient: {
      name: string;
      address: string;
    };
    tracking: string;
    items: OrderItem[];
    payment: {
      status: string;
      total: number;
    };
  }

// export interface OrderItem {
//     orderItemId: number;
//     order: ShopOrder;
//     productVariant: ProductVariant;
//     quantity: number;
// }

export enum OrderStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    PROCESSING = 'PROCESSING',
    SHIPPED = 'SHIPPED',
    OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED',
    RETURNED = 'RETURNED',
    REFUNDED = 'REFUNDED',
    FAILED = 'FAILED'
}