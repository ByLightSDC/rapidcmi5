import { ComponentStory, ComponentMeta } from '@storybook/react';
import { ButtonInfoField, ButtonInfoFormHeaderLayout } from './buttons';
import { PaperWrapper } from '../../storybook/PaperWrapper';
import { Grid, Typography } from '@mui/material';
export default {
  component: ButtonInfoField,
  title: 'Inputs/Buttons/ButtonInfo',
} as ComponentMeta<typeof ButtonInfoField>;

const Template: ComponentStory<typeof ButtonInfoField> = (args) => (
  <PaperWrapper>
    <Grid container>
      <Grid item xs={3}>
        <ButtonInfoField {...args} />
      </Grid>
    </Grid>
  </PaperWrapper>
);

export const Primary = Template.bind({});
Primary.args = {
  message: 'Display This Information',
  props: { sx: ButtonInfoFormHeaderLayout },
};

Primary.argTypes = {
  message: {
    description: 'Message to alert',
  },
  popperPlacement: {
    description:
      'MUI Popper placement. <br/>Options: top-start, top, top-end, right-start, right, right-end, bottom-end, bottom, bottom-start, left-end, left, left-start',
  },
  props: {
    description: 'MUI props for IconButton',
  },
};
