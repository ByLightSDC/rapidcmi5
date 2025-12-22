import { combineReducers } from 'redux';
import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';

//Internal
import courseBuilderReducer from './courseBuilderReducer';
import repoReducer from './repoManagerReducer';

//Branded, Shared Reducers
import {
  commonAppReducer,
  commonAppTransReducer,
  paginationReducer,
} from '@rapid-cmi5/ui';

//Persist
import storage from 'redux-persist/lib/storage';
import {
  createMigrate,
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

const persistConfig = {
  key: 'rapidCmi5Redux',
  version: CURRENT_STORE_VERSION,
  storage,
  whitelist: [
    'commonApp',
    'courseBuilder',
    'pagination',
    'repoManager',
  ],
  // migrate: createMigrate(storeMigrations, { debug: false }),
};

const rootReducer = combineReducers({
  commonApp: commonAppReducer,
  commonAppTrans: commonAppTransReducer,
  courseBuilder: courseBuilderReducer,
  pagination: paginationReducer,
  repoManager: repoReducer,
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
