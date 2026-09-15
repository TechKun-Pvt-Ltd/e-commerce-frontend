import { CartItemDTO, CartItemPreview, CartItemUpdatePayload } from '@/types/domains/cart';
import { Personalization } from '@/types/domains/personalization';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as cartServices from "@/services/cart";
import { RootState } from '../store';

const GUEST_CART_STORAGE_KEY = 'kavengo_guest_cart';

export type AddToCartPayload = CartItemDTO & {
    title?: string;
    sku?: string;
    price?: number;
    imageUrl?: string;
    quantityInStock?: number;
};

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

function getLocalGuestCart(): CartItemPreview[] {
    if (typeof window === 'undefined') return [];
    try {
        const raw = localStorage.getItem(GUEST_CART_STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function saveLocalGuestCart(items: CartItemPreview[]): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
        console.error('Failed to persist guest cart to localStorage:', e);
    }
}

type ThunkApiConfig = { state: RootState; rejectValue: string };

export const fetchCartItems = createAsyncThunk<CartItemPreview[], void, ThunkApiConfig>(
    'cart/fetchCartItems',
    async (_, { getState, rejectWithValue }) => {
        const { authenticated } = getState().auth;

        if (!authenticated) {
            return getLocalGuestCart();
        }

        try {
            // First migrate any guest items to backend cart if user just logged in
            const guestItems = getLocalGuestCart();
            if (guestItems.length > 0) {
                for (const item of guestItems) {
                    try {
                        await cartServices.addCartItem({
                            productVariantId: item.productVariantId,
                            quantity: item.quantity,
                            productImageId: undefined,
                            personalization: item.personalization
                        });
                    } catch (e) {
                        console.warn('Failed migrating guest cart item to server:', e);
                    }
                }
                saveLocalGuestCart([]);
            }

            const response = await cartServices.getAllCartItems();
            if (response.success) {
                return response.data;
            }

            return rejectWithValue(response.error);
        } catch (error) {
            return rejectWithValue((error as { error: string }).error || 'Failed to fetch cart items');
        }
    }
);

export const addToCart = createAsyncThunk<CartItemPreview[], AddToCartPayload, ThunkApiConfig>(
    'cart/addToCartAsync',
    async (itemToAdd, { getState, dispatch, rejectWithValue }) => {
        const { authenticated } = getState().auth;

        if (!authenticated) {
            const current = getLocalGuestCart();
            const existingIndex = current.findIndex(i => i.productVariantId === itemToAdd.productVariantId);
            if (existingIndex > -1) {
                current[existingIndex].quantity += itemToAdd.quantity;
            } else {
                current.push({
                    cartItemId: -Math.abs(Date.now()),
                    addedAt: new Date(),
                    imageUrl: itemToAdd.imageUrl || '',
                    title: itemToAdd.title || 'Product',
                    productVariantId: itemToAdd.productVariantId,
                    sku: itemToAdd.sku || '',
                    price: itemToAdd.price || 0,
                    quantityInStock: itemToAdd.quantityInStock ?? 99,
                    quantity: itemToAdd.quantity,
                    personalization: itemToAdd.personalization
                });
            }
            saveLocalGuestCart(current);
            return current;
        }

        try {
            const response = await cartServices.addCartItem({
                productVariantId: itemToAdd.productVariantId,
                quantity: itemToAdd.quantity,
                productImageId: itemToAdd.productImageId,
                personalization: itemToAdd.personalization
            });
            if (response.success) {
                const fetchAction = await dispatch(fetchCartItems());
                return fetchAction.meta.requestStatus === 'fulfilled'
                    ? (fetchAction.payload as CartItemPreview[])
                    : rejectWithValue(fetchAction.payload as string);
            }

            return rejectWithValue(response.error);
        } catch (error: unknown) {
            return rejectWithValue((error as { error: string }).error || 'Failed to add item to cart');
        }
    }
);

export const updateCartItemAsync = createAsyncThunk<
    { cartItemId: number; quantity: number; personalization?: Personalization },
    { cartItemId: number; payload: CartItemUpdatePayload },
    ThunkApiConfig
>(
    'cart/updateCartItemAsync',
    async ({ cartItemId, payload }, { getState, rejectWithValue }) => {
        const { authenticated } = getState().auth;

        if (!authenticated) {
            const current = getLocalGuestCart();
            const item = current.find(i => i.cartItemId === cartItemId);
            if (item && payload.quantity !== undefined) {
                item.quantity = payload.quantity;
                saveLocalGuestCart(current);
            }
            return { cartItemId, quantity: payload.quantity ?? 1, personalization: payload.personalization };
        }

        try {
            const response = await cartServices.updateCartItem(cartItemId, payload);
            if (response.success) {
                return {
                    cartItemId: response.data.cartItemId,
                    quantity: response.data.quantity,
                    personalization: response.data.personalization
                };
            }

            return rejectWithValue(response.error);
        } catch (error: unknown) {
            return rejectWithValue((error as { error: string }).error || 'Failed to update cart item');
        }
    }
);

export const removeFromCartAsync = createAsyncThunk<number, number, ThunkApiConfig>(
    'cart/removeFromCartAsync',
    async (cartItemId, { getState, rejectWithValue }) => {
        const { authenticated } = getState().auth;

        if (!authenticated) {
            const current = getLocalGuestCart().filter(i => i.cartItemId !== cartItemId);
            saveLocalGuestCart(current);
            return cartItemId;
        }

        try {
            const response = await cartServices.deleteCartItem(cartItemId);
            if (response.success)
                return cartItemId;

            return rejectWithValue(response.error);
        } catch (error: unknown) {
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
        updateCart: (state, action: PayloadAction<CartItemPreview[]>) => {
            state.items = action.payload;
            calculateTotals(state);
        },
        clearCart: (state) => {
            state.items = [];
            state.totalItems = 0;
            state.totalAmount = 0;
            if (typeof window !== 'undefined') {
                localStorage.removeItem(GUEST_CART_STORAGE_KEY);
            }
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
            .addCase(addToCart.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addToCart.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
                calculateTotals(state);
            })
            .addCase(addToCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(updateCartItemAsync.pending, (state, action) => {
                const { cartItemId, payload } = action.meta.arg;
                if (payload.quantity !== undefined) {
                    const item = state.items.find(i => i.cartItemId === cartItemId);
                    if (item) {
                        item.quantity = payload.quantity;
                        calculateTotals(state);
                    }
                }
                state.error = null;
            })
            .addCase(updateCartItemAsync.fulfilled, (state, action) => {
                const item = state.items.find(i => i.cartItemId === action.payload.cartItemId);
                if (item) {
                    item.quantity = action.payload.quantity;
                    if (action.payload.personalization !== undefined) {
                        item.personalization = action.payload.personalization;
                    }
                    calculateTotals(state);
                }
            })
            .addCase(updateCartItemAsync.rejected, (state, action) => {
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
                if (action.payload) state.error = action.payload;
            });
    },
});

export const { updateCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;