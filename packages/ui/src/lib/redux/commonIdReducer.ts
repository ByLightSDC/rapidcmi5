// import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit';
// import { resetPersistance } from './utils/store';
// import { FormCrudType } from './utils/types';

// /**
//  * @typedef tCommonId The type of data for this slice
//  * @property {string} id Unique identifier for an item (usually a UUID)
//  * @property {string} name Name of item
//  * @property {FormCrudType} [crudType] Current mode
//  * @property {*} {meta} Additional information needed
//  * @property {boolean} [shouldOverride] Whether to override entry if already in list
//  */
// export type tCommonId = {
//   id: string;
//   name: string;
//   crudType?: FormCrudType;
//   meta?: any;
//   shouldOverride?: boolean;
// };

// export type tCommonIdState = {
//   commonIds: tCommonId[];
// };

// export interface State {
//   commonId: tCommonIdState;
// }

// /** @constant
//  * DEFAULT_NETWORK_UUID from back end services
//  * @type {tCommonId}
//  */
// const defaultRangeNetwork: tCommonId = {
//   id: 'c972fe39-9dc3-44fc-a54e-013666d8edc5',
//   name: 'Default Network',
// };

// //Defaults
// const initialState: tCommonIdState = {
//   commonIds: [defaultRangeNetwork], //lookup table to retrieve meta data based on uuid
// };

// /**
//  * Slice to persist redux states as lookup table of any uuid/name information (example: used to resolve UUIDs in breadcrumbs)
//  */
// export const commonIdSlice : Slice = createSlice({
//   name: 'commonId',
//   initialState,
//   extraReducers: (builder) =>
//     builder.addCase(resetPersistance, () => {
//       return { ...initialState };
//     }),
//   reducers: {
//     resetCommonIds: (state, action: PayloadAction) => {
//       state.commonIds = initialState.commonIds;
//     },
//     setCommonId: (state, action: PayloadAction<tCommonId>) => {
//       const { name, shouldOverride = true } = action.payload;
//       const selIndex = state.commonIds.findIndex(
//         (item : any) => item.id === action.payload.id,
//       );
//       if (selIndex < 0) {
//         state.commonIds.push(action.payload);
//       } else {
//         if (shouldOverride) {
//           state.commonIds[selIndex] = action.payload;
//         } else {
//           state.commonIds[selIndex].name = name;
//         }
//       }
//     },
//     setCommonIds: (state, action: PayloadAction<tCommonId[]>) => {
//       const arr: tCommonId[] = action.payload;
//       for (let i = 0; i < arr.length; i++) {
//         const commonItem: tCommonId = arr[i];
//         const selIndex = state.commonIds.findIndex(
//           (item : any) => item.id === commonItem.id,
//         );
//         if (selIndex < 0) {
//           state.commonIds.push(commonItem);
//         } else {
//           if (commonItem.shouldOverride) {
//             state.commonIds[selIndex] = commonItem;
//           } else {
//             state.commonIds[selIndex].name = commonItem.name;
//           }
//         }
//       }
//     },
//   },
// });

// // export actions to dispatch from components
// export const { resetCommonIds, setCommonId, setCommonIds } =
//   commonIdSlice.actions;

// // The function below is called a selector and allows us to select a value from
// // the state. Selectors can also be defined inline where they're used instead of
// // in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
// export const commonIds = (state: State) => state.commonId.commonIds;

// export const commonIdReducer = commonIdSlice.reducer;
