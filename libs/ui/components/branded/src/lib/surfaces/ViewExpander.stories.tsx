import { ComponentStory, ComponentMeta } from '@storybook/react';
import { ViewExpander } from './ViewExpander';

import Grid from '@mui/material/Grid';
import { PaperWrapper } from '../storybook/PaperWrapper';

export default {
  component: ViewExpander,
  title: 'Surfaces/ViewExpander',
} as ComponentMeta<typeof ViewExpander>;

const Template: ComponentStory<typeof ViewExpander> = (args) => (
  <PaperWrapper>
    <Grid container spacing={2}>
      <ViewExpander {...args} />
    </Grid>
  </PaperWrapper>
);

export const Primary = Template.bind({});
Primary.args = {
  children: (
    <Grid item xs={12}>
      View Expanded Children
    </Grid>
  ),
  defaultIsExpanded: true,
  expandTestId: 'view-expand',
  headerSxProps: {
    cursor: 'pointer',
  },
  iconSxProps: {},
  infoTextTitle: null,
  shouldEndWithDivider: false,
  shouldIndicateMore: true,
  shouldStartWithDivider: false,
  title: 'My Title',
};

Primary.parameters = {
  docs: {
    description: {
      component: 'Styled Material UI expanding view.',
      story: 'Expands and Collapses children',
    },
  },
  notes:
    '<h4><b>Theme Styling</b></h4><b>background color:</b> theme.header.dark<br><b>text color:</b> primary<br><b>text variant</b> body2 upper case<br><b>icon color:</b> primary<br>',
};

Primary.argTypes = {
  title: {
    description: 'Title to display',
  },
};

export const StylingProps = Template.bind({});
StylingProps.args = {
  title: 'Indented Title and Styled Icon',
  children: (
    <Grid item xs={12}>
      View Expanded Children
    </Grid>
  ),
  headerSxProps: { marginLeft: '48px' },
  iconSxProps: { fontSize: 'medium', color: 'red' },
};
