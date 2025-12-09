// import { ListView } from './ListView';

// // MUI
// import DeleteIcon from '@mui/icons-material/Delete';


// /* Icon */
// import HubIcon from '@mui/icons-material/Hub';
// import { PaperWrapper } from '../storybook/PaperWrapper';

// export default {
//   component: ListView,
//   title: 'DataDisplay/ListView',
// } as ComponentMeta<typeof ListView>;

// const rowActions = [
//   {
//     tooltip: 'Delete',
//     icon: <DeleteIcon fontSize="medium" />,
//   },
// ];

// // This simulates an Action Row which does not exist in the Branded Component Library
// const renderItem = (item: any, index: number) => (
//   <ActionRow
//     data={item}
//     isTitleDisplay={index === -1}
//     rowIcon={<HubIcon color="primary" />}
//     rowTitle={item.name}
//     rowDate={item.dateCreated}
//     rowActions={rowActions}
//   />
// );

// export const Primary = Template.bind({});
// Primary.args = {
//   testId: 'item_list',
//   title: '',
//   sxProps: {},
//   items: [
//     {
//       name: 'Item One',
//       author: 'author.name.one@domain.com',
//       dateCreated: '01/01/2023 12:00 AM',
//     },
//     {
//       name: 'Item Two',
//       author: 'author.name.one@domain.com',
//       dateCreated: '01/01/2023 12:00 AM',
//     },
//     {
//       name: 'Item Three',
//       author: 'author.name.one@domain.com',
//       dateCreated: '01/01/2023 12:00 AM',
//     },
//   ],
//   renderItem: renderItem,
//   shouldShowColumnHeaders: true,
// };

// Primary.parameters = {
//   design: {
//     type: 'figma',
//     url: 'https://www.figma.com/file/b3uDt9fku55RZwMBU1vaHW/Imerzi-Style-Guide?node-id=287%3A36885',
//   },
// };

// Primary.argTypes = {
//   shouldShowColumnHeaders: {
//     default: 'false',
//     description: 'Whether to render column headers',
//   },
//   testId: {
//     default: 'item_list',
//     description: 'Test id',
//   },
//   dividerProps: {
//     description: 'Props to override sx properties provided to divider',
//   },
//   items: {
//     default: [],
//     description: 'An array of item data used to render the list rows',
//   },
//   renderItem: {
//     description: 'JSX Element used to render row',
//   },
//   sxProps: {
//     description: 'Props to override sx properties provided to list view',
//   },
//   title: {
//     description: 'Title presented above the list view',
//   },
//   titleRow: {
//     description:
//       'Title elements above the list view, below title. Typically used to render title elements instead of a string',
//   },
//   onRowSelect: {
//     description: 'Function that gets called when row selected',
//   },
// };
