import { configureStore } from '@reduxjs/toolkit';
import categoriesReducer from './slices/categorySlice';
import promotionsReducer from './slices/promotionSlice';
import cartReducer from './slices/cartSlice';
import authReducer from './slices/authSlice';

export const store = configureStore({
    reducer: {
        categories: categoriesReducer,
        promotions: promotionsReducer,
        cart: cartReducer,
        auth: authReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;