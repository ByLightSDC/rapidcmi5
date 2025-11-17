import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import {
  accordionReducer,
  DashboardCardMenu,
  PaperWrapper,
} from '@rangeos-nx/ui/branded';

import { Meta } from '@storybook/react';

import { One, Two } from '../constants';

const mockCategories = [
  {
    id: 'organization',
    name: 'Organization',
    data: [
      {
        name: 'Packages',
        url: '/packages',
        tagline: 'Organize Components into Packages',
      },
      {
        name: 'Scenarios',
        url: '/scenarios',
        tagline: 'Assemble Packages for Deployment',
      },
    ],
  },
  {
    id: 'common',
    name: 'Common',
    data: [
      { name: 'Containers', url: '/container_specs' },
      { name: 'VMs', url: '/vm_specifications' },
      { name: 'Consoles', url: '/consoles' },
    ],
  },
  {
    id: 'assets',
    name: 'Assets',
    data: [
      { name: 'Charts', url: '/charts' },
      { name: 'Container Images', url: '/container_images' },
      { name: 'CPEs', url: '/cpes' },
      { name: 'VM Images', url: '/vm_images' },
    ],
  },
];
const handleCardSelect = (categoryId: string, cardIndex: number) => {};

export default {
  title: 'Colors/Components/Card Menu',
} as Meta;

const store = configureStore({
  reducer: {
    accordion: accordionReducer,
  },
});

const Template = ({ args }) => (
  <Provider store={store}>
    <PaperWrapper>
      <DashboardCardMenu
        data={mockCategories}
        onCardSelect={handleCardSelect}
        colorLabel1={<One sx={{ position: 'absolute', left: 240, top: 10 }} />}
        colorLabel2={
          <Two
            sx={{
              color: 'lightGrey',
              position: 'absolute',
              left: 200,
              top: 80,
            }}
          />
        }
      />
    </PaperWrapper>
  </Provider>
);

export const Primary = Template.bind({});
Primary.args = {
  color1: 'accordion.backgroundColor',
  color2: 'card.default',
  textColor1: 'text.primary',
  textColor2: 'card.titleColor',
};

Primary.argTypes = {
  color1: {
    description:
      '[1] Menu Background <b><i>accordion.backgroundColor<i></b>See Color Variables story for swatches',
  },
  color2: {
    description: '[2] Interactive Card <b><i>card.default<i></b>',
  },
  textColor1: {
    description: 'Menu Header Text <b><i>text.primary<i></b>',
  },
  textColor2: {
    description: 'Interactive Card Text <b><i>card.titleColor<i></b>',
  },
};
