import { ComponentStory, ComponentMeta } from '@storybook/react';
import SampleMultiSelectList, { simpleRowData } from './SampleMultiSelectList';
import { PaperWrapper } from '../../storybook/PaperWrapper';
// import { Provider } from 'react-redux';
//import { store } from '../../redux/store';

const itemList: simpleRowData[] = [
  {
    name: 'item 1',
    author: 'abc@def.com',
    dateEdited: '2023-03-07T18:08:06.000Z',
  },
  {
    name: 'item 2',
    author: 'abc@def.com',
    dateEdited: '2023-03-07T18:08:06.000Z',
  },
  {
    name: 'item 3',
    author: 'abc@def.com',
    dateEdited: '2023-03-07T18:08:06.000Z',
  },
  {
    name: 'item 4',
    author: 'abc@def.com',
    dateEdited: '2023-03-07T18:08:06.000Z',
  },
  {
    name: 'item 5',
    author: 'abc@def.com',
    dateEdited: '2023-03-07T18:08:06.000Z',
  },
  {
    name: 'item 6',
    author: 'abc@def.com',
    dateEdited: '2023-03-07T18:08:06.000Z',
  },
  {
    name: 'item 7',
    author: 'abc@def.com',
    dateEdited: '2023-03-07T18:08:06.000Z',
  },
  {
    name: 'item 8',
    author: 'abc@def.com',
    dateEdited: '2023-03-07T18:08:06.000Z',
  },
];
export default {
  component: SampleMultiSelectList,
  title: 'modals/MultiSelectList',
} as ComponentMeta<typeof SampleMultiSelectList>;

const Template: ComponentStory<typeof SampleMultiSelectList> = (args) => {
  return (
    <PaperWrapper>
      <div
        style={{
          width: '800px',
          height: '640px',
        }}
      >
        {/* <Provider store={store}> */}
        <SampleMultiSelectList listData={itemList} />
        {/* </Provider> */}
      </div>
    </PaperWrapper>
  );
};

export const Primary = Template.bind({});
Primary.args = {
  listData: itemList,
};

Primary.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/b3uDt9fku55RZwMBU1vaHW/Imerzi-Style-Guide-v1.0?node-id=101%3A8060',
  },
  docs: {
    description: {
      component: 'Multiple Selection',
      story: 'Multiple Selection',
    },
  },
};

Primary.argTypes = {
  apiHook: {
    description: 'apiHook',
  },
  crudType: {
    description: 'Form usage: 0=create, 1=delete, 2=edit, 3=view',
  },
  includeVersioning: {
    description:
      'Indication of whether or not to display Branch/Tag/Shared versioning fields',
  },
  control: {
    description: 'Form control (from call to useForm hook)',
  },
  errors: {
    description: 'Form errors (from call to useForm hook)',
  },
};
