import { Action, combineReducers, configureStore } from '@reduxjs/toolkit';
import { FLUSH, PAUSE, PERSIST, persistReducer, persistStore, PURGE, REGISTER, REHYDRATE } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { ThunkAction } from 'redux-thunk';

import authSlice from './slices/authSlice';
import { RESET_ROOT_STATE, SET_WHOLE_STATE } from './types';

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;

const persistConfig = {
    key: 'root',
    storage,
};

const rootReducer = combineReducers({
    auth: authSlice,
});

const rootReducerWithSet = (state: any, action: Action & { payload?: any }) => {
    if (action.type === SET_WHOLE_STATE && action.payload) {
        return action.payload;
    }
    return rootReducer(state, action);
};

const persistedReducer = persistReducer(persistConfig, rootReducerWithSet);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
});

export const persistor = persistStore(store);

export * from './slices/authSlice';
