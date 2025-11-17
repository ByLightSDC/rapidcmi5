import { Meta } from '@storybook/react';

// MUI
import DeleteIcon from '@mui/icons-material/Delete';

/* Icon */
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import HubIcon from '@mui/icons-material/Hub';
import { PaperWrapper } from '../../storybook/PaperWrapper';
import ActionRow from '../../forms/selection/ActionRow';
import ListView from '../../data-display/ListView';
import { ButtonMainUi } from '../../inputs/buttons/buttons';
import { Box, Stack } from '@mui/material';

import { One } from '../constants';

export default {
  title: 'Colors/Components/Dashboard',
} as Meta;

const Template = (args) => (
  <PaperWrapper>
    <One sx={{ position: 'absolute', left: 240, top: 10 }} />
    <Stack direction="row" sx={{ display: 'flex', width: '100%' }}>
      <ButtonMainUi
        sxProps={{ marginLeft: '4px', marginBottom: '6px' }}
        startIcon={<AddIcon />}
      >
        Create Item
      </ButtonMainUi>
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          alignContent: 'center',
          alignItems: 'center',
          justifyContent: 'flex-end',
        }}
      >
        <FilterListIcon color="primary" />
      </Box>
    </Stack>
    <ListView
      testId="item_list"
      title=""
      sxProps={{}}
      items={[
        {
          name: 'Item One',
          author: 'author.name.one@domain.com',
          dateCreated: '01/01/2023 12:00 AM',
        },
        {
          name: 'Item Two',
          author: 'author.name.one@domain.com',
          dateCreated: '01/01/2023 12:00 AM',
        },
        {
          name: 'Item Three',
          author: 'author.name.one@domain.com',
          dateCreated: '01/01/2023 12:00 AM',
        },
      ]}
      renderItem={renderItem}
      shouldShowColumnHeaders={true}
    />
  </PaperWrapper>
);

const rowActions = [
  {
    tooltip: 'Delete',
    icon: <DeleteIcon fontSize="medium" />,
  },
];

// This simulates an Action Row which does not exist in the Branded Component Library
const renderItem = (item: any, index?: number) => (
  <ActionRow
    data={item}
    isTitleDisplay={index === -1}
    rowIcon={<HubIcon color="primary" />}
    rowTitle={item.name}
    rowDate={item.dateCreated}
    rowActions={rowActions}
  />
);

export const Primary = Template.bind({});
Primary.args = {
  backgroundColor: 'background.paper',
  primaryButtonColor: 'linear-gradient(180deg, #405CA7 0%, #2C4B93 100%)',
  iconButtonColor: 'primary.main',
  passiveIconColor: 'primary.main',
  primaryButtonTextColor: 'common.white',
  listItemTextColor: 'text.interactable',
  listRowHeaderTextColor: 'text.hint',
};

Primary.argTypes = {
  backgroundColor: {
    description:
      '[1] List Background <b><i>background.paper<i></b>See Color Variables story for swatches',
  },
  primaryButtonColor: {
    description: 'Primary Button (Create Item)',
  },
  iconButtonColor: {
    description: 'Interactive Icon <b><i>primary.main<i></b>',
  },
  passiveIconColor: {
    description: 'Non Interactive Icon <b><i>primary.main<i></b>',
  },
  primaryButtonTextColor: {
    description: 'Primary Button <b><i>common.white<i></b>',
  },
  listItemTextColor: {
    description: 'List Item Text <b><i>text.interactable<i></b>',
  },
  listRowHeaderTextColor: {
    description: 'List Row Header Text <b><i>text.hint<i></b>',
  },
};
