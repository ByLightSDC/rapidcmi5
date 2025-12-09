// import { ComponentStory, ComponentMeta } from '@storybook/react';
// import { ColorVariables } from './ColorVariables';
// import { PaperWrapper } from '../storybook/PaperWrapper';
// import { configureStore, createSlice } from '@reduxjs/toolkit';
// import { commonAppReducer } from '@rangeos-nx/ui/redux';
// import { Provider } from 'react-redux';
// import { BrowserRouter } from 'react-router';

// export default {
//   component: ColorVariables,
//   title: 'Colors/Color Variables',
// } as ComponentMeta<typeof ColorVariables>;

// const mock = createSlice({
//   name: 'commonAppTrans',
//   initialState: {
//     appHeaderVisible: true,
//     breadCrumbLeft: 8,
//     breadCrumbVisible: true,
//     plugins: [],
//   },

//   reducers: {
//     setAppHeaderVisible: (state, action) => {
//       //
//     },
//     setBreadCrumbLeft: (state, action) => {
//       //
//     },
//     setBreadCrumbVisible: (state, action) => {
//       //
//     },
//     setPlugins: (state, action) => {
//       //
//     },
//   },
// });

// const store = configureStore({
//   reducer: {
//     commonApp: commonAppReducer,
//     commonAppTrans: mock.reducer,
//   },
// });

// const Template: ComponentStory<typeof ColorVariables> = (args) => (
//   <PaperWrapper>
//     <Provider store={store}>
//       <BrowserRouter>
//         <ColorVariables {...args} />
//       </BrowserRouter>
//     </Provider>
//   </PaperWrapper>
// );

// export const Primary = Template.bind({});
// Primary.args = {};

// Primary.argTypes = {};
