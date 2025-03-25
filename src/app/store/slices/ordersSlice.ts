import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ShopOrder } from '@/app/types/models';
import apiInstance from '@/app/services/api.service';

interface OrdersState {
    items: ShopOrder[];
    loading: boolean;
    error: string | null;
    selectedOrder: ShopOrder | null;
}

const initialState: OrdersState = {
    items: [],
    loading: false,
    error: null,
    selectedOrder: null,
};

export const fetchOrders = createAsyncThunk(
    'orders/fetchOrders',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiInstance.get('/orders');
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || 'Failed to fetch orders');
        }
    }
);

export const fetchOrderById = createAsyncThunk(
    'orders/fetchOrderById',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await apiInstance.get(`/orders/${id}`);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || 'Failed to fetch order');
        }
    }
);

export const createOrder = createAsyncThunk(
    'orders/createOrder',
    async (orderData: Partial<ShopOrder>, { rejectWithValue }) => {
        try {
            const response = await apiInstance.post('/orders', orderData);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || 'Failed to create order');
        }
    }
);

export const updateOrderStatus = createAsyncThunk(
    'orders/updateOrderStatus',
    async ({ id, status }: { id: number; status: string }, { rejectWithValue }) => {
        try {
            const response = await apiInstance.patch(`/orders/${id}`, { status });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || 'Failed to update order status');
        }
    }
);

const ordersSlice = createSlice({
    name: 'orders',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchOrders.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchOrderById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOrderById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedOrder = action.payload;
            })
            .addCase(fetchOrderById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(createOrder.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createOrder.fulfilled, (state, action) => {
                state.loading = false;
                state.items.push(action.payload);
            })
            .addCase(createOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(updateOrderStatus.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateOrderStatus.fulfilled, (state, action) => {
                state.loading = false;
                const updatedOrder = action.payload;
                const index = state.items.findIndex(order => order.orderId === updatedOrder.orderId);
                if (index !== -1) {
                    state.items[index] = updatedOrder;
                }
                if (state.selectedOrder?.orderId === updatedOrder.orderId) {
                    state.selectedOrder = updatedOrder;
                }
            })
            .addCase(updateOrderStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export default ordersSlice.reducer;