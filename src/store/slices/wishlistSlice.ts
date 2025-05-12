import { WishlistItemDTO } from '@/types/domains/wishlist_item';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as wishlistServices from '@/services/wishlist';

interface WishlistState {
    items: WishlistItemDTO[];
    loading: boolean;
    error: string | null;
}

const initialState: WishlistState = {
    items: [],
    loading: false,
    error: null
};

export const fetchWishlistItems = createAsyncThunk(
    'wishlist/fetchWishlistItems',
    async (_, { rejectWithValue }) => {
        try {
            const response = await wishlistServices.getWishlistItems();
            if (response.success)
                return response.data;

            return rejectWithValue(response.error);
        } catch (error) {
            return rejectWithValue((error as { error: string }).error || 'Failed to fetch wishlist items');
        }
    }
);

export const addToWishlistAsync = createAsyncThunk(
    'wishlist/addToWishlistAsync',
    async (productVariantId: number, { rejectWithValue }) => {
        try {
            const response = await wishlistServices.addToWishlist(productVariantId);
            if (response.success)
                return response.data;

            return rejectWithValue(response.error);
        } catch (error) {
            return rejectWithValue((error as { error: string }).error || 'Failed to add item to wishlist');
        }
    }
);

export const removeFromWishlistAsync = createAsyncThunk(
    'wishlist/removeFromWishlistAsync',
    async (wishlistItemId: number, { rejectWithValue }) => {
        try {
            const response = await wishlistServices.deleteWishlistItem(wishlistItemId);
            if (response.success)
                return wishlistItemId;

            return rejectWithValue(response.error);
        } catch (error) {
            return rejectWithValue((error as { error: string }).error || 'Failed to remove item from wishlist');
        }
    }
);

const wishlistSlice = createSlice({
    name: 'wishlist',
    initialState,
    reducers: {
        clearWishlist: (state) => {
            state.items = [];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchWishlistItems.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchWishlistItems.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchWishlistItems.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(addToWishlistAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addToWishlistAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.items.push(action.payload);
            })
            .addCase(addToWishlistAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
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
                state.error = action.payload as string;
            });
    },
});

export const { clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;