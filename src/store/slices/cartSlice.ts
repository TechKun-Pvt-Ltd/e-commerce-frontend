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
    // Optimistic updates tracking
    pendingAdditions: Set<number>; // productVariantIds being added
    pendingUpdates: Map<number, Partial<CartItemPreview>>; // cartItemId -> updates
    pendingRemovals: Set<number>; // cartItemIds being removed
}

const initialState: CartState = {
    items: [],
    totalItems: 0,
    totalAmount: 0,
    loading: false,
    error: null,
    pendingAdditions: new Set(),
    pendingUpdates: new Map(),
    pendingRemovals: new Set(),
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

// Parallel guest cart migration
async function migrateGuestCartParallel(guestItems: CartItemPreview[]): Promise<void> {
    if (guestItems.length === 0) return;

    await Promise.allSettled(guestItems.map(async (item) => {
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
    }));

    saveLocalGuestCart([]);
}

export const fetchCartItems = createAsyncThunk<CartItemPreview[], void, ThunkApiConfig>(
    'cart/fetchCartItems',
    async (_, { getState, rejectWithValue }) => {
        const { authenticated } = getState().auth;

        if (!authenticated) {
            return getLocalGuestCart();
        }

        try {
            // Migrate guest cart in parallel
            const guestItems = getLocalGuestCart();
            if (guestItems.length > 0) {
                await migrateGuestCartParallel(guestItems);
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

const applyOptimisticAddition = (state: CartState, item: AddToCartPayload) => {
    const existingIndex = state.items.findIndex(i => i.productVariantId === item.productVariantId);
    const tempId = -Math.abs(Date.now());

    if (existingIndex > -1) {
        state.items[existingIndex].quantity += item.quantity;
        state.pendingUpdates.set(state.items[existingIndex].cartItemId, {
            quantity: state.items[existingIndex].quantity
        });
    } else {
        const newItem: CartItemPreview = {
            cartItemId: tempId,
            addedAt: new Date(),
            imageUrl: item.imageUrl || '',
            title: item.title || 'Product',
            productVariantId: item.productVariantId,
            sku: item.sku || '',
            price: item.price || 0,
            quantityInStock: item.quantityInStock ?? 99,
            quantity: item.quantity,
            personalization: item.personalization
        };
        state.items.push(newItem);
        state.pendingAdditions.add(tempId);
    }
    calculateTotals(state);
};

const rollbackOptimisticAddition = (state: CartState, productVariantId: number) => {
    const item = state.items.find(i => i.productVariantId === productVariantId);
    if (item) {
        if (state.pendingAdditions.has(item.cartItemId)) {
            state.items = state.items.filter(i => i.cartItemId !== item.cartItemId);
            state.pendingAdditions.delete(item.cartItemId);
        } else if (state.pendingUpdates.has(item.cartItemId)) {
            state.pendingUpdates.delete(item.cartItemId);
        }
    }
    calculateTotals(state);
};

const applyOptimisticUpdate = (state: CartState, cartItemId: number, payload: CartItemUpdatePayload) => {
    const item = state.items.find(i => i.cartItemId === cartItemId);
    if (item) {
        if (payload.quantity !== undefined) {
            item.quantity = payload.quantity;
        }
        if (payload.personalization !== undefined) {
            item.personalization = payload.personalization;
        }
        state.pendingUpdates.set(cartItemId, { ...item });
        calculateTotals(state);
    }
};

const rollbackOptimisticUpdate = (state: CartState, cartItemId: number) => {
    state.pendingUpdates.delete(cartItemId);
    // Refetch would be needed for full rollback, but we keep local state
};

const applyOptimisticRemoval = (state: CartState, cartItemId: number) => {
    const itemIndex = state.items.findIndex(i => i.cartItemId === cartItemId);
    if (itemIndex > -1) {
        const removedItem = state.items[itemIndex];
        state.items.splice(itemIndex, 1);
        state.pendingRemovals.add(cartItemId);
        calculateTotals(state);
        return removedItem;
    }
    return null;
};

const rollbackOptimisticRemoval = (state: CartState, item: CartItemPreview) => {
    if (item) {
        state.items.push(item);
        state.pendingRemovals.delete(item.cartItemId);
        calculateTotals(state);
    }
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        updateCart: (state, action: PayloadAction<CartItemPreview[]>) => {
            state.items = action.payload;
            state.pendingAdditions.clear();
            state.pendingUpdates.clear();
            state.pendingRemovals.clear();
            calculateTotals(state);
        },
        clearCart: (state) => {
            state.items = [];
            state.totalItems = 0;
            state.totalAmount = 0;
            state.pendingAdditions.clear();
            state.pendingUpdates.clear();
            state.pendingRemovals.clear();
            if (typeof window !== 'undefined') {
                localStorage.removeItem(GUEST_CART_STORAGE_KEY);
            }
        },
        // Optimistic add to cart (instant UI update)
        optimisticAddToCart: (state, action: PayloadAction<AddToCartPayload>) => {
            applyOptimisticAddition(state, action.payload);
        },
        // Optimistic update
        optimisticUpdateCartItem: (state, action: PayloadAction<{ cartItemId: number; payload: CartItemUpdatePayload }>) => {
            applyOptimisticUpdate(state, action.payload.cartItemId, action.payload.payload);
        },
        // Optimistic remove
        optimisticRemoveFromCart: (state, action: PayloadAction<number>) => {
            applyOptimisticRemoval(state, action.payload);
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
                state.pendingAdditions.clear();
                state.pendingUpdates.clear();
                state.pendingRemovals.clear();
                calculateTotals(state);
            })
            .addCase(fetchCartItems.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(addToCart.pending, (state, action) => {
                state.loading = true;
                state.error = null;
                // Apply optimistic update immediately
                applyOptimisticAddition(state, action.meta.arg);
            })
            .addCase(addToCart.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
                state.pendingAdditions.clear();
                state.pendingUpdates.clear();
                calculateTotals(state);
            })
            .addCase(addToCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                // Rollback optimistic update
                rollbackOptimisticAddition(state, action.meta.arg.productVariantId);
            })
            .addCase(updateCartItemAsync.pending, (state, action) => {
                const { cartItemId, payload } = action.meta.arg;
                if (payload.quantity !== undefined) {
                    applyOptimisticUpdate(state, cartItemId, payload);
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
                    state.pendingUpdates.delete(action.payload.cartItemId);
                    calculateTotals(state);
                }
            })
            .addCase(updateCartItemAsync.rejected, (state, action) => {
                state.error = action.payload as string;
                state.pendingUpdates.delete(action.meta.arg.cartItemId);
            })
            .addCase(removeFromCartAsync.pending, (state, action) => {
                state.loading = true;
                state.error = null;
                // Store removed item for potential rollback
                const removedItem = applyOptimisticRemoval(state, action.meta.arg);
                (action as any).meta.removedItem = removedItem;
            })
            .addCase(removeFromCartAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.items = state.items.filter(item => item.cartItemId !== action.payload);
                state.pendingRemovals.delete(action.payload);
                calculateTotals(state);
            })
            .addCase(removeFromCartAsync.rejected, (state, action) => {
                state.loading = false;
                if (action.payload) state.error = action.payload;
                // Rollback
                const removedItem = (action as any).meta?.removedItem;
                if (removedItem) {
                    rollbackOptimisticRemoval(state, removedItem);
                }
                state.pendingRemovals.delete(action.meta.arg);
            });
    },
});

export const {
    updateCart,
    clearCart,
    optimisticAddToCart,
    optimisticUpdateCartItem,
    optimisticRemoveFromCart,
} = cartSlice.actions;
export default cartSlice.reducer;