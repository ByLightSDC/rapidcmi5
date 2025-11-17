import { ComponentStory, ComponentMeta } from '@storybook/react';
import { StepperUi } from './Stepper';

export default {
  component: StepperUi,
  title: 'Navigation/Stepper',
  argTypes: {
    onStepChange: { action: 'onStepChange executed!' },
  },
} as ComponentMeta<typeof StepperUi>;

const Template: ComponentStory<typeof StepperUi> = (args) => (
  <StepperUi {...args} />
);

export const Primary = Template.bind({});
Primary.args = {
  activeStep: 0,
  completed: [false, false, false, false],
  disabled: [false, false, true, true],
  hasErrors: [false, true, false, true],
  labels: ['one', 'two', 'three', 'four'],
  steps: ['First Step', 'Second Step', 'Third Step', 'Fourth Step'],
  width: '760px',
};

Primary.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/b3uDt9fku55RZwMBU1vaHW/Imerzi-Style-Guide?node-id=363%3A19416',
  },
  docs: {
    description: {
      component: 'Styled Material UI Stepper.',
      story: 'An example story description',
    },
  },
};
