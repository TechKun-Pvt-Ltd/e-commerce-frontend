import { configureStore } from '@reduxjs/toolkit';
import categoriesReducer from './slices/categorySlice';
import promotionsReducer from './slices/promotionSlice';
import cartReducer from './slices/cartSlice';
import authReducer from './slices/authSlice';
import variationsReducer from './slices/variationSlice';
import attributesReducer from './slices/attributeSlice';
import wishlistReducer from './slices/wishlistSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        cart: cartReducer,
        categories: categoriesReducer,
        promotions: promotionsReducer,
        variations: variationsReducer,
        attributes: attributesReducer,
        wishlist: wishlistReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            immutableCheck: false,
            serializableCheck: {
                ignoredActionPaths: [/payload\.\d+\.addedAt/],
                ignoredPaths: [/cart\.items\.\d+\.addedAt/]
            }
        })
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;