import { CartItemPreview, CartItemUpdatePayload } from '@/types/domains/cart';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as cartServices from "@/services/cart";

interface CartState {
    items: CartItemPreview[];
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
            const response = await cartServices.getAllCartItems();
            if (response.success)
                return response.data;

            return rejectWithValue(response.error);
        } catch (error) {
            return rejectWithValue((error as { error: string }).error || 'Failed to fetch cart items');
        }
    }
);

export const addToCartAsync = createAsyncThunk(
    'cart/addToCartAsync',
    async (itemToAdd: CartItemPreview, { rejectWithValue }) => {
        try {
            const response = await cartServices.addCartItem({
                productVariantId: itemToAdd.productVariantId,
                quantity: itemToAdd.quantity,
                imageUrl: itemToAdd.imageUrl,
                personalization: itemToAdd.personalization
            });
            if (response.success)
                return itemToAdd;

            return rejectWithValue(response.error);
        } catch (error: any) {
            return rejectWithValue((error as { error: string }).error || 'Failed to add item to cart');
        }
    }
);

export const updateCartItemAsync = createAsyncThunk(
    'cart/updateCartItemAsync',
    async ({ cartItemId, payload }: { cartItemId: number, payload: CartItemUpdatePayload }, { dispatch, rejectWithValue }) => {
        try {
            const response = await cartServices.updateCartItem(cartItemId, payload);
            if (response.success)
                return response.data;

            return rejectWithValue(response.error);
        } catch (error: any) {
            return rejectWithValue((error as { error: string }).error || 'Failed to update cart item');
        }
    }
);

export const removeFromCartAsync = createAsyncThunk(
    'cart/removeFromCartAsync',
    async (cartItemId: number, { rejectWithValue }) => {
        try {
            const response = await cartServices.deleteCartItem(cartItemId);
            if (response.success)
                return cartItemId;

            return rejectWithValue(response.error);
        } catch (error: any) {
            return rejectWithValue((error as { error: string }).error || 'Failed to remove item from cart');
        }
    }
);

const calculateTotals = (state: CartState) => {
    state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0);
    state.totalAmount = state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
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
                state.items = [ ...state.items, action.payload ];
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
                state.items = state.items.map(item => {
                    if (item.cartItemId !== action.payload.cartItemId)
                        return item;

                    item.quantity = action.payload.quantity;
                    item.personalization = action.payload.personalization;
                    return item;
                });
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
                state.items = state.items.filter(item => item.cartItemId !== action.payload);
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