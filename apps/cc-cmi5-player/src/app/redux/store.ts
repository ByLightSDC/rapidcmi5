/* eslint-disable @typescript-eslint/no-explicit-any */
import { combineReducers } from 'redux';
import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import activitySessionReducer from './activitySessionReducer';

//Branded, Shared Reducers
import { commonAppReducer } from '@rapid-cmi5/ui/branded';
import { keycloakUiReducer } from '@rapid-cmi5/ui/keycloak';

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
import auReducer from './auReducer';
import navigationReducer from './navigationReducer';
import { ctfReducer } from '@rapid-cmi5/ui/branded';

//Config for persisting redux
//Referenced guide here
//https://blog.logrocket.com/persist-state-redux-persist-redux-toolkit-react/
const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  whitelist: ['commonApp'],
};

const rootReducer = combineReducers({
  au: auReducer,
  auCTF: ctfReducer,
  navigation: navigationReducer,
  commonApp: commonAppReducer,
  activitySession: activitySessionReducer,
  keycloakUi: keycloakUiReducer, //this app does not use keycloak login, but we store authToken here for branded components (TODO decouple)
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
