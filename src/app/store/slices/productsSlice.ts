import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Product } from '@/app/types/models';
import apiInstance from '@/app/services/api.service';

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

            // Mock data instead of API call
            const mockProducts: Product[] = [
                {
                    productId: 1,
                    name: "Classic Wall Art",
                    description: "Beautiful classic wall art piece",
                    variants: [
                        {
                            productVariantId: 1,
                            price: 99.99,
                            sizeOption: { sizeOptionId: 1, value: "Small (8x10)" },
                            frameOption: { frameOptionId: 1, value: "Black Wood" }
                        },
                        {
                            productVariantId: 2,
                            price: 149.99,
                            sizeOption: { sizeOptionId: 2, value: "Medium (16x20)" },
                            frameOption: { frameOptionId: 2, value: "Gold Metal" }
                        }
                    ]
                },
                {
                    productId: 2,
                    name: "Modern Abstract Print",
                    description: "Contemporary abstract art design",
                    variants: [
                        {
                            productVariantId: 3,
                            price: 129.99,
                            sizeOption: { sizeOptionId: 1, value: "Small (8x10)" },
                            frameOption: { frameOptionId: 3, value: "White Wood" }
                        },
                        {
                            productVariantId: 4,
                            price: 179.99,
                            sizeOption: { sizeOptionId: 2, value: "Medium (16x20)" },
                            frameOption: { frameOptionId: 4, value: "Silver Metal" }
                        }
                    ]
                }
            ];
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
            const response = await apiInstance.get(`/products/${id}`);
            return response.data;
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