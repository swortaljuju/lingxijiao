// Contain functions to create redux store.
import {configureStore} from '@reduxjs/toolkit';
import {rootReducer} from './reducers';
import {createLogger} from 'redux-logger';
import {createInitialState, getCurrentGender} from './states';

export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(createLogger()),
    preloadedState: createInitialState(getCurrentGender()),
});
