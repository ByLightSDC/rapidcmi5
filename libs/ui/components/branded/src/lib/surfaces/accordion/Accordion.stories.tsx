import { ComponentStory, ComponentMeta } from '@storybook/react';
import { AccordionUi, AccordionUiProps } from './Accordion';

/* MUI */
import Typography from '@mui/material/Typography';

const mockSummaries = [
  {
    id: 'first',
    name: 'First Accordion Summary',
  },
  {
    id: 'second',
    name: 'Second Accordion Summary',
  },
];
let mockDetails = new Array();
mockDetails.push(<Typography>First Detail</Typography>);
mockDetails.push(<Typography>Second Detail</Typography>);

export default {
  component: AccordionUi,
  title: 'Surfaces/Accordion',
} as ComponentMeta<typeof AccordionUi>;

const Template: ComponentStory<typeof AccordionUi> = (
  args: AccordionUiProps,
) => <AccordionUi {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  summaries: mockSummaries,
  details: mockDetails,
  muiProps: { elevation: 0 },
};

Primary.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/b3uDt9fku55RZwMBU1vaHW/Imerzi-Style-Guide?node-id=287%3A24701',
  },
  docs: {
    description: {
      component: 'Styled Material UI accordion.',
      story: 'An example story description',
    },
  },
  notes:
    '<h4><b>Theme Styling</b></h4><b>background color:</b> theme.header.dark<br><b>text color:</b> primary<br><b>text variant</b> body2 upper case<br><b>icon color:</b> primary<br>',
};

Primary.argTypes = {
  summaries: {
    description: 'An array of data used to populate accordion summaries ',
  },
  details: {
    description:
      'An array of JSX.Elements to render under each accordion summary',
  },
  muiProps: {
    description:
      'Props inherited from Material UI<br> Additionally, some styling is are inherited from theme (see notes tab)',
  },
};
