import { ComponentStory, ComponentMeta } from '@storybook/react';
import { SelectorMainUi } from './selectors';
import { PaperWrapper } from '../../storybook/PaperWrapper';
import { Grid } from '@mui/material';

export default {
  component: SelectorMainUi,
  title: 'Inputs/Selectors/SelectorMainUi',
} as ComponentMeta<typeof SelectorMainUi>;

const Template: ComponentStory<typeof SelectorMainUi> = (args) => (
  <PaperWrapper>
    <Grid container>
      <Grid item xs={4}>
        <SelectorMainUi {...args} />
      </Grid>
    </Grid>
  </PaperWrapper>
);

/**
 * Controls
 */
export const Primary = Template.bind({});
Primary.args = {
  options: ['apple', 'orange', 'mango'],
};

/**
 * Docs Name, Description, Default
 */
Primary.argTypes = {
  defaultValue: {
    description: 'Default selected value',
    table: {
      type: { summary: 'string' },
      defaultValue: { summary: '' },
    },
  },
  id: {
    description: 'Id',
    table: {
      type: { summary: 'string' },
      defaultValue: { summary: 'selector' },
    },
  },
  isFullWidth: {
    description: 'Whether component should stretch to fit parent width',
    table: {
      type: { summary: 'boolean' },
      defaultValue: { summary: true },
    },
  },
  label: {
    description: 'Label to display',
  },
  options: {
    description: 'Menu Options',
    table: {
      type: { summary: 'string[]' },
      defaultValue: { summary: [] },
    },
  },
  sxProps: {
    description: 'Sx props passed to MUI Selector',
  },
  onSelect: {
    description: 'Callback for option selected',
  },
};
