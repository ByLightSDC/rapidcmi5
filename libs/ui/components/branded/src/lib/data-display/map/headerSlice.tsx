// import { createSlice } from '@reduxjs/toolkit';

// const initialState = {
//   requestProcessing: false,
//   goodToClose: false
// };

// const headerSlice = createSlice({
//   name: 'header',
//   initialState,
//   reducers: {
//     setRequestProcessing: (state: any, action: { payload: { requestProcessing: boolean }; type: string }) => {
//       state.requestProcessing = action.payload.requestProcessing;
//     },
//     setGoodToClose: (state: any, action: { payload: { goodToClose: boolean }; type: string }) => {
//       state.goodToClose = action.payload.goodToClose;
//     },
//   },
// });

// export const selectRequestProcessing = (state: any): boolean => {
//   return state.header.requestProcessing;
// };

// export const selectGoodToClose = (state: any): boolean => {
//   return state.header.goodToClose;
// };

// export const {
//   setRequestProcessing,
//   setGoodToClose
// } = headerSlice.actions;

// export default headerSlice.reducer;
