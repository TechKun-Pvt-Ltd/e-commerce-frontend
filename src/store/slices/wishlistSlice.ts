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

// Load from localStorage on init
const loadWishlistFromStorage = (): WishlistItemWithId[] => {
    if (typeof window === 'undefined') return [];
    try {
        const stored = localStorage.getItem('wishlistItems');
        if (stored) {
            const parsed = JSON.parse(stored);
            // Only restore items with full data (productVariantId > 0)
            return parsed.filter((item: WishlistItemWithId) => item.productVariantId > 0);
        }
    } catch (error) {
        console.error('Failed to load wishlist from storage:', error);
    }
    return [];
};

const initialState: WishlistState = {
    items: loadWishlistFromStorage(),
    loading: false,
    error: null
};

// Helper to save to localStorage
const saveWishlistToStorage = (items: WishlistItemWithId[]) => {
    if (typeof window === 'undefined') return;
    try {
        // Only save items with full data
        const itemsToSave = items.filter(item => item.productVariantId > 0);
        localStorage.setItem('wishlistItems', JSON.stringify(itemsToSave));
    } catch (error) {
        console.error('Failed to save wishlist to storage:', error);
    }
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
            saveWishlistToStorage([]);
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
                const fetchedItems = action.payload;
                
                // Separate existing items with full data vs limited data
                const existingItemsWithFullData = state.items.filter(item => item.productVariantId > 0);
                
                // Create maps for lookup by wishlistItemId and by SKU/code
                const existingByWishlistId = new Map<number, WishlistItemWithId>();
                const existingBySku = new Map<string, WishlistItemWithId>();
                existingItemsWithFullData.forEach(item => {
                    if (item.wishlistItemId) {
                        existingByWishlistId.set(item.wishlistItemId, item);
                    }
                    if (item.code) {
                        existingBySku.set(item.code, item);
                    }
                });
                
                // Start with existing items that have full data - these are the source of truth
                const merged: WishlistItemWithId[] = [...existingItemsWithFullData];
                
                // For fetched items, try to match with existing items
                fetchedItems.forEach(fetched => {
                    if (fetched.wishlistItemId) {
                        // First try matching by wishlistItemId
                        const existingById = existingByWishlistId.get(fetched.wishlistItemId);
                        if (existingById) {
                            // Update existing item with latest wishlistItemId if needed
                            const index = merged.findIndex(item => item.productVariantId === existingById.productVariantId);
                            if (index !== -1 && merged[index].wishlistItemId !== fetched.wishlistItemId) {
                                merged[index] = { ...merged[index], wishlistItemId: fetched.wishlistItemId };
                            }
                        } else if (fetched.code) {
                            // Try matching by SKU/code
                            const existingByCode = existingBySku.get(fetched.code);
                            if (existingByCode) {
                                // Update existing item with wishlistItemId from fetched
                                const index = merged.findIndex(item => item.productVariantId === existingByCode.productVariantId);
                                if (index !== -1) {
                                    merged[index] = { ...merged[index], wishlistItemId: fetched.wishlistItemId };
                                }
                            } else {
                                // No match found, add fetched item (will have limited data)
                                merged.push(fetched);
                            }
                        } else {
                            // No code, just add it
                            merged.push(fetched);
                        }
                    }
                });
                
                state.items = merged;
                saveWishlistToStorage(merged);
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
                saveWishlistToStorage(state.items);
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
                saveWishlistToStorage(state.items);
            })
            .addCase(removeFromWishlistAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string ?? null;
            });
    },
});

export const { addToWishlist, removeFromWishlist, toggleWishlist, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
