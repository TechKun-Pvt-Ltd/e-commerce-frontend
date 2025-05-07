import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Product } from '@/app/types/models';
// import apiInstance from '@/app/services/api.service';
import { mockProducts } from '@/app/mock/products';

interface ProductsState {
    items: Product[];
    loading: boolean;
    error: string | null;
    selectedProduct: Product | null;
}

const initialState: ProductsState = {
    items: [],
    loading: false,
    error: null,
    selectedProduct: null,
};

export const fetchProducts = createAsyncThunk(
    'products/fetchProducts',
    async (_, { rejectWithValue }) => {
        try {
            // const response = await apiInstance.get('/products');
            // return response.data;

            return mockProducts;
        } catch (error: any) {
            return rejectWithValue('Failed to fetch products');
        }
    }
);

export const fetchProductById = createAsyncThunk(
    'products/fetchProductById',
    async (id: number, { rejectWithValue }) => {
        try {
            // const response = await apiInstance.get(`/products/${id}`);
            // return response.data;

            return mockProducts[0];
        } catch (error: any) {
            return rejectWithValue(error.response?.data || 'Failed to fetch product');
        }
    }
);

const productsSlice = createSlice({
    name: 'products',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchProducts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchProductById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProductById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedProduct = action.payload;
            })
            .addCase(fetchProductById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export default productsSlice.reducer;