import { Action, configureStore } from '@reduxjs/toolkit';

// Define the store type without importing the actual store
export type RootState = ReturnType<typeof configureStore>['getState'];
export type AppDispatch = ReturnType<typeof configureStore>['dispatch'];

export const RESET_ROOT_STATE = 'RESET_ROOT_STATE';
export const SET_WHOLE_STATE = 'SET_WHOLE_STATE'; 