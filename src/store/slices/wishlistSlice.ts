import { ProductPreview } from '@/types/domains/product';
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import * as wishlistServices from '@/services/wishlist';
import { WishlistItemDTO, WishlistItem } from '@/types/domains/wishlist_item';
import { login, logout, getMyInformation } from './authSlice';

export interface WishlistItemWithId extends Omit<ProductPreview, 'dateAdded'> {
    dateAdded: string; // Store as ISO string for Redux serialization
    wishlistItemId?: number;
}

interface WishlistState {
    items: WishlistItemWithId[];
    loading: boolean;
    error: string | null;
    currentUserId: number | null;
}

const initialState: WishlistState = {
    items: [], // Start empty - will be loaded from API
    loading: false,
    error: null,
    currentUserId: null
};

type ThunkApiConfig = { rejectValue: string };

// Fetch wishlist items from API
export const fetchWishlistItems = createAsyncThunk<WishlistItemWithId[], void, ThunkApiConfig>(
    'wishlist/fetchWishlistItems',
    async (_, { rejectWithValue }) => {
        try {
            const response = await wishlistServices.getWishlistItems();
            if (response.success) {
                // Map WishlistItemDTO to WishlistItemWithId
                // Note: API returns limited data, so we map what we can
                return response.data.map((dto: WishlistItemDTO): WishlistItemWithId => ({
                    productId: 0, // Not available in DTO
                    productVariantId: 0, // Not available in DTO - we'll need SKU matching
                    categoryId: 0, // Not available in DTO
                    dateAdded: new Date().toISOString(), // Convert to string for Redux serialization
                    quantityInStock: dto.productVariant.quantityInStock,
                    imageUrl: dto.productImageUrl,
                    price: dto.productVariant.price,
                    title: dto.productVariant.sku, // Using SKU as fallback for title
                    code: dto.productVariant.sku,
                    rating: 0,
                    starred: true, // Items from wishlist API are starred
                    wishlistItemId: dto.wishlistItemId
                }));
            }
            return rejectWithValue(response.error);
        } catch (error) {
            return rejectWithValue((error as { error: string }).error || 'Failed to fetch wishlist items');
        }
    }
);

// Add to wishlist via API
export const addToWishlistAsync = createAsyncThunk<
    WishlistItemWithId, 
    { product: ProductPreview; productVariantId: number }, 
    ThunkApiConfig
>(
    'wishlist/addToWishlistAsync',
    async ({ product, productVariantId }, { rejectWithValue }) => {
        try {
            const response = await wishlistServices.addToWishlist(productVariantId);
            if (response.success) {
                // Response has full productVariant with productVariantId
                const wishlistItem: WishlistItem = response.data;
                
                // Create item with full product data + wishlistItemId
                // Convert dateAdded to string if it's a Date object
                const serializedProduct = {
                    ...product,
                    dateAdded: product.dateAdded instanceof Date ? product.dateAdded.toISOString() : product.dateAdded
                };
                const newItem: WishlistItemWithId = {
                    ...serializedProduct,
                    starred: true, // Mark as starred when added to wishlist
                    wishlistItemId: wishlistItem.wishlistItemId,
                    productVariantId: wishlistItem.productVariant.productVariantId
                };
                
                return newItem;
            }
            return rejectWithValue(response.error);
        } catch (error: any) {
            return rejectWithValue((error as { error: string }).error || 'Failed to add item to wishlist');
        }
    }
);

// Remove from wishlist via API
export const removeFromWishlistAsync = createAsyncThunk<number, number, ThunkApiConfig>(
    'wishlist/removeFromWishlistAsync',
    async (wishlistItemId, { rejectWithValue }) => {
        try {
            const response = await wishlistServices.deleteWishlistItem(wishlistItemId);
            if (response.success) {
                return wishlistItemId;
            }
            return rejectWithValue(response.error);
        } catch (error: any) {
            return rejectWithValue((error as { error: string }).error || 'Failed to remove item from wishlist');
        }
    }
);

const wishlistSlice = createSlice({
    name: 'wishlist',
    initialState,
    reducers: {
        // Local state management (for optimistic updates)
        addToWishlist: (state, action: PayloadAction<ProductPreview>) => {
            const product = action.payload;
            const exists = state.items.some(item => item.productVariantId === product.productVariantId);
            if (!exists) {
                // Convert dateAdded to string if it's a Date object
                const serializedProduct: WishlistItemWithId = {
                    ...product,
                    dateAdded: product.dateAdded instanceof Date ? product.dateAdded.toISOString() : String(product.dateAdded)
                };
                state.items.push(serializedProduct);
            }
        },
        removeFromWishlist: (state, action: PayloadAction<number>) => {
            state.items = state.items.filter(item => 
                item.wishlistItemId !== action.payload && 
                item.productVariantId !== action.payload
            );
        },
        toggleWishlist: (state, action: PayloadAction<ProductPreview>) => {
            const product = action.payload;
            const exists = state.items.some(item => item.productVariantId === product.productVariantId);
            if (exists) {
                state.items = state.items.filter(item => item.productVariantId !== product.productVariantId);
            } else {
                // Convert dateAdded to string if it's a Date object
                const serializedProduct = {
                    ...product,
                    dateAdded: product.dateAdded instanceof Date ? product.dateAdded.toISOString() : product.dateAdded
                };
                state.items.push(serializedProduct);
            }
        },
        clearWishlist: (state) => {
            state.items = [];
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch wishlist items
            .addCase(fetchWishlistItems.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchWishlistItems.fulfilled, (state, action) => {
                state.loading = false;
                // Directly use API data - no localStorage merge
                state.items = action.payload;
            })
            .addCase(fetchWishlistItems.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string ?? null;
            })
            // Add to wishlist
            .addCase(addToWishlistAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addToWishlistAsync.fulfilled, (state, action) => {
                state.loading = false;
                const newItem = action.payload;
                // Check if item already exists (by productVariantId or wishlistItemId)
                const exists = state.items.some(
                    item => item.productVariantId === newItem.productVariantId || 
                    (newItem.wishlistItemId && item.wishlistItemId === newItem.wishlistItemId)
                );
                if (!exists) {
                    // Add new item to existing items, preserving all existing items
                    state.items.push(newItem);
                } else {
                    // Update existing item with new wishlistItemId if needed
                    const index = state.items.findIndex(
                        item => item.productVariantId === newItem.productVariantId
                    );
                    if (index !== -1) {
                        state.items[index] = { ...state.items[index], ...newItem };
                    }
                }
            })
            .addCase(addToWishlistAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string ?? null;
            })
            // Remove from wishlist
            .addCase(removeFromWishlistAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(removeFromWishlistAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.items = state.items.filter(item => item.wishlistItemId !== action.payload);
            })
            .addCase(removeFromWishlistAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string ?? null;
            })
            // Listen to auth actions to clear wishlist per user
            .addCase(login.fulfilled, (state, action) => {
                // Set userId and clear items - will be fetched from API
                const userId = action.payload.user?.userId;
                if (userId) {
                    state.currentUserId = userId;
                    state.items = []; // Clear - API will fetch fresh data
                }
            })
            .addCase(getMyInformation.fulfilled, (state, action) => {
                // Set userId when user info is fetched
                const userId = action.payload?.userId;
                if (userId) {
                    // If user changed, clear old data
                    if (state.currentUserId && state.currentUserId !== userId) {
                        state.items = [];
                    }
                    state.currentUserId = userId;
                    // Clear items - API will fetch fresh data
                    if (state.items.length === 0) {
                        // Items will be fetched by Header/Drawer components
                    }
                }
            })
            .addCase(logout.fulfilled, (state) => {
                // Clear wishlist on logout
                state.items = [];
                state.currentUserId = null;
            });
    },
});

export const { addToWishlist, removeFromWishlist, toggleWishlist, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
