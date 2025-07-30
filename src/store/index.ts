import { configureStore } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import { combineReducers } from 'redux';
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';

// Create a safe storage that works in both server and client
const createNoopStorage = () => {
  return {
    getItem(_key: string) {
      return Promise.resolve(null);
    },
    setItem(_key: string, value: any) {
      return Promise.resolve(value);
    },
    removeItem(_key: string) {
      return Promise.resolve();
    },
  };
};

// Check if we're on the client side
const isClient = typeof window !== 'undefined';

// Use appropriate storage based on environment
const storage = isClient 
  ? require('redux-persist/lib/storage').default 
  : createNoopStorage();

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'cart'],
  // Add these options for better error handling
  serialize: true,
  deserialize: true,
};

const rootReducer = combineReducers({
  auth: authReducer,
  cart: cartReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST', 
          'persist/REHYDRATE',
          'persist/REGISTER',
          'persist/PURGE',
          'persist/FLUSH',
          'persist/PAUSE',
        ],
      },
    }),
  // Only enable devtools in development
  devTools: process.env.NODE_ENV !== 'production',
});

// Only create persistor on client side
export const persistor = isClient ? persistStore(store) : null;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;