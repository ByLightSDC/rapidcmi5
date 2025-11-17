// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { configureStore } from '@reduxjs/toolkit';
// import { Provider } from 'react-redux';
// import { NotificationsProvider } from '@toolpad/core';
// import { QueryClient, QueryClientProvider } from 'react-query';
// import { ComponentStory, ComponentMeta, } from '@storybook/react';
// import { PaginationListView } from './PaginationListView';
// import { keycloakUiReducer } from '@rangeos-nx/ui/keycloak';
// import { paginationReducer, PaperWrapper } from '@rangeos-nx/ui/branded';

// // MUI
// import ListItemIcon from '@mui/material/ListItemIcon';
// import ListItemText from '@mui/material/ListItemText';
// import StarIcon from '@mui/icons-material/Star';
// import DeleteIcon from '@mui/icons-material/Delete';
// import EditIcon from '@mui/icons-material/Edit';
// import Typography from '@mui/material/Typography';

// export default {
//   component: PaginationListView,
//   title: 'Navigation/PaginationListView',
// } as ComponentMeta<typeof PaginationListView>;
// const queryClient = new QueryClient();
// const store = configureStore({
//   reducer: {
//     keycloakUi: keycloakUiReducer,
//     pagination: paginationReducer,
//   },
// });

// const Template: ComponentStory<typeof PaginationListView> = (args) => (
//   <QueryClientProvider client={queryClient}>
//     <NotificationsProvider
//       slotProps={{
//         snackbar: {
//           anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
//         },
//       }}
//     >
//       <Provider store={store}>
//         <PaperWrapper>
//           <PaginationListView {...args} />
//         </PaperWrapper>
//       </Provider>
//     </NotificationsProvider>
//   </QueryClientProvider>
// );

// // This simulates an Action Row which does not exist in the Branded Component Library
// const renderItem = (item: any) => (
//   <div //className="list-row"
//     style={{
//       display: 'flex',
//       flexDirection: 'row',
//       justifyContent: 'space-between',
//       padding: '6px 0px',
//       width: '100%',
//     }}
//   >
//     <div //className="list-row-start"
//       style={{
//         display: 'flex',
//         flexDirection: 'row',
//         alignItems: 'center',
//         overflow: 'clip',
//         whiteSpace: 'nowrap',
//         textOverflow: 'ellipsis',
//         width: '100%',
//         minWidth: '128px',
//         marginLeft: '16px',
//       }}
//     >
//       <ListItemIcon
//         sx={{ color: (theme: any) => `${theme.palette.primary.main}` }}
//       >
//         <StarIcon />
//       </ListItemIcon>
//       <ListItemText>{item.name}</ListItemText>
//     </div>
//     <div //className="list-row-item"
//       style={{
//         display: 'flex',
//         flexDirection: 'row',
//         alignItems: 'center',
//         overflow: 'clip',
//         whiteSpace: 'nowrap',
//         textOverflow: 'ellipsis',
//         width: '70%',
//         minWidth: '128px',
//         marginLeft: '8px',
//       }}
//     >
//       <Typography
//         color="text.interactable"
//         variant="body2"
//         className="clipped-text"
//       >
//         {item.author}
//       </Typography>
//     </div>
//     <div //className="list-row-date"
//       style={{
//         display: 'flex',
//         flexDirection: 'row',
//         alignItems: 'center',
//         overflow: 'clip',
//         whiteSpace: 'nowrap',
//         textOverflow: 'ellipsis',
//         width: '50%',
//         maxWidth: '144px',
//         minWidth: '84px',
//         marginLeft: '8px',
//       }}
//     >
//       <Typography
//         color="text.interactable"
//         variant="body2"
//         className="clipped-text"
//       >
//         {item.lastEdit}
//       </Typography>
//     </div>
//     <div //className="list-row-actions"
//       style={{
//         whiteSpace: 'nowrap',
//         marginLeft: '16px',
//       }}
//     >
//       <ListItemIcon>
//         <EditIcon />
//       </ListItemIcon>
//       <ListItemIcon>
//         <DeleteIcon />
//       </ListItemIcon>
//     </div>
//   </div>
// );

// //TODO - may need more details when we really have paging options for endpoint
// const mockApi = (options: any) => {
//   return {
//     isSuccess: true,
//     error: null,
//     data: {
//       totalCount: 7,
//       data: [
//         {
//           name: 'First One',
//           author: 'author.name.one@domain.com',
//           lastEdit: '01/01/2023 12:00 AM',
//         },
//         {
//           name: 'Second One',
//           author: 'author.name.one@domain.com',
//           lastEdit: '01/01/2023 01:00 PM',
//         },
//         {
//           name: 'Third One',
//           author: 'author.name.one@domain.com',
//           lastEdit: '01/01/2023 02:00 PM',
//         },
//         {
//           name: 'Fourth One',
//           author: 'author.name.one@domain.com',
//           lastEdit: '01/01/2023 02:30 PM',
//         },
//         {
//           name: 'Fifth One',
//           author: 'author.name.one@domain.com',
//           lastEdit: '01/01/2023 02:45 PM',
//         },
//       ],
//     },
//   };
// };

// export const Primary = Template.bind({});
// Primary.args = {
//   apiHook: mockApi,
//   paginationLabel: 'Items',
//   rowsPerPage: 5,
//   renderItem,
// };

// Primary.parameters = {
//   design: {
//     type: 'figma',
//     url: 'https://www.figma.com/file/b3uDt9fku55RZwMBU1vaHW/Imerzi-Style-Guide?node-id=363%3A19424',
//   },
//   docs: {
//     description: {
//       component: 'Styled Material UI Pagination component.',
//       story: 'An example story description',
//     },
//   },
// };
