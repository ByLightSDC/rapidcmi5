import { ComponentStory, ComponentMeta } from '@storybook/react';
import { TablePaginationUi } from './TablePagination';
import { PaperWrapper } from '../../storybook/PaperWrapper';

export default {
  component: TablePaginationUi,
  title: 'Navigation/TablePagination',
} as ComponentMeta<typeof TablePaginationUi>;

const Template: ComponentStory<typeof TablePaginationUi> = (args) => (
  <PaperWrapper>
    <TablePaginationUi {...args} />
  </PaperWrapper>
);

export const Primary = Template.bind({});
Primary.args = {
  label: 'Items',
  page: 0,
  rowsPerPage: 10,
  totalCount: 25,
};

Primary.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/b3uDt9fku55RZwMBU1vaHW/Imerzi-Style-Guide?node-id=363%3A19424',
  },
  docs: {
    description: {
      component: 'Styled Material UI Pagination component.',
      story: 'An example story description',
    },
  },
};
