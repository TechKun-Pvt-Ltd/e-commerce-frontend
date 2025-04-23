import { OrderStatus, ShopOrder, User, OrderItem, ProductVariant, ProductImage, SizeOption, FrameOption } from '../types/models';

const mockUser: User = {
    userId: 1,
    username: "john.doe",
    name: "John Doe",
    password: "hashedPassword123",
    address: "123 Main St, New York, NY 10001",
    role: { roleId: 1, name: "USER" }
};

const mockFrameOption: FrameOption = {
    frameOptionId: 1,
    value: "Wood"
};

const mockSizeOption: SizeOption = {
    sizeOptionId: 1,
    value: "24x36"
};

const mockProductVariant: ProductVariant = {
    productVariantId: 1,
    name: "Classic Frame",
    sizeOption: mockSizeOption,
    frameOption: mockFrameOption,
    price: 149.99
};

const mockProductImage: ProductImage = {
    productImageId: 1,
    imageUrl: "https://example.com/image1.jpg"
};

const mockOrderItems: OrderItem[] = [
    {
        orderItemId: 1,
        productVariant: mockProductVariant,
        image: mockProductImage,
        quantity: 2
    }
];

export const mockOrders: ShopOrder[] = [
    {
        orderId: 1001,
        orderItems: mockOrderItems,
        user: mockUser,
        paymentType: "CREDIT_CARD",
        orderDate: "2024-01-15T10:30:00Z",
        orderTotal: 299.98,
        status: OrderStatus.DELIVERED
    },
    {
        orderId: 1002,
        orderItems: mockOrderItems,
        user: mockUser,
        paymentType: "PAYPAL",
        orderDate: "2024-01-16T14:20:00Z",
        orderTotal: 299.98,
        status: OrderStatus.PROCESSING
    },
    {
        orderId: 1003,
        orderItems: mockOrderItems,
        user: mockUser,
        paymentType: "DEBIT_CARD",
        orderDate: "2024-01-17T09:15:00Z",
        orderTotal: 299.98,
        status: OrderStatus.PENDING
    }
];

export default mockOrders;