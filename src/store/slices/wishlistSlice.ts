import { ProductPreview } from '@/types/domains/product';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WishlistState {
    items: ProductPreview[];
}

const initialState: WishlistState = {
    items: []
};

const wishlistSlice = createSlice({
    name: 'wishlist',
    initialState,
    reducers: {
        addToWishlist: (state, action: PayloadAction<ProductPreview>) => {
            const product = action.payload;
            const exists = state.items.some(item => item.productVariantId === product.productVariantId);
            if (!exists) {
                state.items.push(product);
            }
        },
        removeFromWishlist: (state, action: PayloadAction<number>) => {
            state.items = state.items.filter(item => item.productVariantId !== action.payload);
        },
        toggleWishlist: (state, action: PayloadAction<ProductPreview>) => {
            const product = action.payload;
            const exists = state.items.some(item => item.productVariantId === product.productVariantId);
            if (exists) {
                state.items = state.items.filter(item => item.productVariantId !== product.productVariantId);
            } else {
                state.items.push(product);
            }
        },
        clearWishlist: (state) => {
            state.items = [];
        },
    },
});

export const { addToWishlist, removeFromWishlist, toggleWishlist, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;

