import { combineReducers } from 'redux';
import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';

//Persist
import storage from 'redux-persist/lib/storage';
import {
  persistReducer,
  persistStore,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import { CURRENT_STORE_VERSION, storeMigrations } from './storeMigrations';
import { keycloakUiReducer } from '@rapid-cmi5/keycloak';
import { commonAppReducer, commonAppTransReducer } from '@rapid-cmi5/ui';
import globalReducer from './globalReducer';

const persistConfig = {
  key: 'rapidCmi5FrontendRedux',
  version: CURRENT_STORE_VERSION,
  storage,
  whitelist: ['commonApp', 'global', 'pagination'],
  // migrate: createMigrate(storeMigrations, { debug: false }),
};

const rootReducer = combineReducers({
  keycloakUi: keycloakUiReducer,
  commonApp: commonAppReducer,
  commonAppTrans: commonAppTransReducer,
  global: globalReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

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

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  any,
  Action<string>
>;
