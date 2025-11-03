import { ProductPreview } from '@/types/domains/product';
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import * as wishlistServices from '@/services/wishlist';
import { WishlistItemDTO, WishlistItem } from '@/types/domains/wishlist_item';

export interface WishlistItemWithId extends Omit<ProductPreview, 'dateAdded'> {
    dateAdded: string; // Store as ISO string for Redux serialization
    wishlistItemId?: number;
}

interface WishlistState {
    items: WishlistItemWithId[];
    loading: boolean;
    error: string | null;
}

const initialState: WishlistState = {
    items: [],
    loading: false,
    error: null
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
                    starred: false,
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
    WishlistItemWithId[], 
    { product: ProductPreview; productVariantId: number }, 
    ThunkApiConfig
>(
    'wishlist/addToWishlistAsync',
    async ({ product, productVariantId }, { dispatch, rejectWithValue }) => {
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
                    wishlistItemId: wishlistItem.wishlistItemId,
                    productVariantId: wishlistItem.productVariant.productVariantId
                };
                
                // After adding, fetch updated list to sync with server
                const fetchAction = await dispatch(fetchWishlistItems());
                if (fetchAction.meta.requestStatus === "fulfilled") {
                    // Merge with local product data for items that match
                    const fetchedItems = fetchAction.payload as WishlistItemWithId[];
                    return fetchedItems.map(item => {
                        // If we can match by productVariantId, use full product data
                        if (item.wishlistItemId === newItem.wishlistItemId && product.productVariantId === wishlistItem.productVariant.productVariantId) {
                            const serializedProduct = {
                                ...product,
                                dateAdded: product.dateAdded instanceof Date ? product.dateAdded.toISOString() : product.dateAdded
                            };
                            return { ...serializedProduct, wishlistItemId: item.wishlistItemId };
                        }
                        return item;
                    });
                }
                return fetchAction.payload as WishlistItemWithId[];
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
                // Merge with existing items to preserve full product data
                const existingItems = state.items.filter(item => item.wishlistItemId);
                const fetchedItems = action.payload;
                
                // Merge: use fetched items as base, but keep full product data from existing items if available
                const merged = fetchedItems.map(fetched => {
                    const existing = existingItems.find(e => e.wishlistItemId === fetched.wishlistItemId);
                    if (existing && existing.productVariantId > 0) {
                        // Ensure dateAdded is serialized (already should be string, but just in case)
                        const serializedExisting: WishlistItemWithId = {
                            ...existing,
                            dateAdded: typeof existing.dateAdded === 'string' ? existing.dateAdded : String(existing.dateAdded),
                            wishlistItemId: fetched.wishlistItemId
                        };
                        return serializedExisting;
                    }
                    return fetched;
                });
                
                state.items = merged;
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
                state.items = action.payload;
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
            });
    },
});

export const { addToWishlist, removeFromWishlist, toggleWishlist, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
