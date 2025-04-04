import { CartItem } from '../types/models';

export const mockCartItems: CartItem[] = [
    {
        cartItemId: 1,
        user: {
            userId: 1,
            username: 'john.doe',
            name: 'John Doe',
            password: 'hashedPassword123',
            address: '123 Main Street, Cityville, ST 12345',
            role: {
                roleId: 1,
                name: 'USER'
            }
        },
        productVariant: {
            productVariantId: 1,
            name: 'Classic Frame - Large',
            sizeOption: {
                sizeOptionId: 1,
                value: 'Large'
            },
            frameOption: {
                frameOptionId: 1,
                value: 'Classic Black'
            },
            price: 129.99
        },
        quantity: 2
    },
    {
        cartItemId: 2,
        user: {
            userId: 1,
            username: 'john.doe',
            name: 'John Doe',
            password: 'hashedPassword123',
            address: '123 Main Street, Cityville, ST 12345',
            role: {
                roleId: 1,
                name: 'USER'
            }
        },
        productVariant: {
            productVariantId: 2,
            name: 'Modern Frame - Medium',
            sizeOption: {
                sizeOptionId: 2,
                value: 'Medium'
            },
            frameOption: {
                frameOptionId: 2,
                value: 'Modern Silver'
            },
            price: 99.99
        },
        quantity: 1
    }
];