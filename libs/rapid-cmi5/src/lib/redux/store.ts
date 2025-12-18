import { combineReducers } from 'redux';
import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';

//Internal Global
import globalReducer from './globalReducer';

//Internal
import { dynamicSchemaReducer } from '@rapid-cmi5/ui/redux';
import courseBuilderReducer from './courseBuilderReducer';
import repoReducer from './repoManagerReducer';

//Branded, Shared Reducers
import { keycloakUiReducer } from '@rapid-cmi5/ui/keycloak';
import {
  accordionReducer,
  bookmarksReducer,
  ctfReducer,
  paginationReducer,
} from '@rapid-cmi5/ui/branded';
import { commonAppReducer, commonAppTransReducer } from '@rapid-cmi5/ui/redux';

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
  key: 'root',
  version: CURRENT_STORE_VERSION,
  storage,
  whitelist: [
    'bookmarks',
    'commonApp',
    'commonId',
    'courseBuilder',
    'global',
    'deployRangeContent',
    'pagination',
    'project',
    'repoManager',
  ],
  migrate: createMigrate(storeMigrations, { debug: false }),
};

const rootReducer = combineReducers({
  global: globalReducer,
  commonApp: commonAppReducer,
  commonAppTrans: commonAppTransReducer,
  courseBuilder: courseBuilderReducer,
  keycloakUi: keycloakUiReducer,
  schemaData: dynamicSchemaReducer,
  accordion: accordionReducer,
  bookmarks: bookmarksReducer,
  pagination: paginationReducer,
  auCTF: ctfReducer,
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
