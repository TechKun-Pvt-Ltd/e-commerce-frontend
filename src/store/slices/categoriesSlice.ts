import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Category } from '@/app/types/models';
import apiInstance from '@/app/services/api.service';

interface CategoriesState {
    items: Category[];
    loading: boolean;
    error: string | null;
    selectedCategory: Category | null;
}

const initialState: CategoriesState = {
    items: [],
    loading: false,
    error: null,
    selectedCategory: null,
};

export const fetchCategories = createAsyncThunk(
    'categories/fetchCategories',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiInstance.get('/categories');
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || 'Failed to fetch categories');
        }
    }
);

export const fetchCategoryById = createAsyncThunk(
    'categories/fetchCategoryById',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await apiInstance.get(`/categories/${id}`);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || 'Failed to fetch category');
        }
    }
);

const categoriesSlice = createSlice({
    name: 'categories',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchCategories.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchCategories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchCategoryById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCategoryById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedCategory = action.payload;
            })
            .addCase(fetchCategoryById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export default categoriesSlice.reducer;