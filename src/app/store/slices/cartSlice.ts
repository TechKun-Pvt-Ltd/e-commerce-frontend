import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiInstance from '@/app/services/api.service';
import { CartItem, ProductVariant, User } from '@/app/types/models';

interface CartState {
    items: CartItem[];
    totalItems: number;
    totalAmount: number;
    loading: boolean;
    error: string | null;
}

const initialState: CartState = {
    items: [],
    totalItems: 0,
    totalAmount: 0,
    loading: false,
    error: null
};

export const fetchCartItems = createAsyncThunk(
    'cart/fetchCartItems',
    async (_, { rejectWithValue }) => {
        try {
            // const response = await apiInstance.get('/cart-items');
            // return response.data;
            return [];
        } catch (error: any) {
            return rejectWithValue(error.response?.data || 'Failed to fetch cart items');
        }
    }
);

export const addToCartAsync = createAsyncThunk(
    'cart/addToCartAsync',
    async (variant: ProductVariant, { rejectWithValue }) => {
        try {
            // const response = await apiInstance.post('/cart-items', { productVariantId: variant.productVariantId });
            // return response.data;
            return [
                {
                    cartId: 1,
                    productVariant: variant,
                    user: {} as User,
                    quantity: 1 
                }
            ];
        } catch (error: any) {
            return rejectWithValue(error.response?.data || 'Failed to add item to cart');
        }
    }
);

export const updateCartItemAsync = createAsyncThunk(
    'cart/updateCartItemAsync',
    async ({ variantId, quantity }: { variantId: number; quantity: number }, { rejectWithValue }) => {
        try {
            const response = await apiInstance.put(`/cart-items/${variantId}`, { quantity });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || 'Failed to update cart item');
        }
    }
);

export const removeFromCartAsync = createAsyncThunk(
    'cart/removeFromCartAsync',
    async (variantId: number, { rejectWithValue }) => {
        try {
            await apiInstance.delete(`/cart-items/${variantId}`);
            return variantId;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || 'Failed to remove item from cart');
        }
    }
);

const calculateTotals = (state: CartState) => {
    state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0);
    state.totalAmount = state.items.reduce((total, item) => total + (item.productVariant.price * item.quantity), 0);
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        clearCart: (state) => {
            state.items = [];
            state.totalItems = 0;
            state.totalAmount = 0;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCartItems.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCartItems.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
                calculateTotals(state);
            })
            .addCase(fetchCartItems.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(addToCartAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addToCartAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
                calculateTotals(state);
            })
            .addCase(addToCartAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(updateCartItemAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateCartItemAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
                calculateTotals(state);
            })
            .addCase(updateCartItemAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(removeFromCartAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(removeFromCartAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.items = state.items.filter(item => item.productVariant.productVariantId !== action.payload);
                calculateTotals(state);
            })
            .addCase(removeFromCartAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearCart } = cartSlice.actions;
export default cartSlice.reducer;