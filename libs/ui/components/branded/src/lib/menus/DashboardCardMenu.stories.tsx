import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { accordionReducer, paginationReducer } from '@rangeos-nx/ui/branded';

import { ComponentStory, ComponentMeta } from '@storybook/react';
import { DashboardCardMenu, DashboardCardMenuProps } from './DashboardCardMenu';

const mockCategories = [
  {
    id: 'scenario',
    name: 'Scenario Support',
    data: [
      {
        name: 'Volumes',
        url: '',
      },
      { name: 'Containers', url: '' },
      { name: 'Charts', url: '' },
      { name: 'Container Specs & Packages', url: '' },
      { name: 'DNS Records', url: '' },
    ],
  },
  {
    id: 'infrastructure',
    name: 'Infrastructure',
    data: [
      {
        name: 'Environment Specs',
        url: '/environment_specs',
      },
      { name: 'Range Specs', url: '' },
    ],
  },
];
const handleCardSelect = (categoryId: string, cardIndex: number) => {};

export default {
  component: DashboardCardMenu,
  title: 'menus/DashboardCardMenu',
  argTypes: {
    onCardSelect: { action: 'onCardSelect executed!' },
  },
} as ComponentMeta<typeof DashboardCardMenu>;
const store = configureStore({
  reducer: {
    accordion: accordionReducer,
  },
});

const Template: ComponentStory<typeof DashboardCardMenu> = (
  args: DashboardCardMenuProps,
) => (
  <Provider store={store}>
    <DashboardCardMenu {...args} />
  </Provider>
);

export const Primary = Template.bind({});
Primary.args = {
  data: mockCategories,
  onCardSelect: handleCardSelect,
};

Primary.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/b3uDt9fku55RZwMBU1vaHW/Imerzi-Style-Guide?node-id=287%3A24721',
  },
  docs: {
    description: {
      component: 'Dashboard Card Menu',
    },
  },
  notes:
    '<h4><b>Theme Styling</b></h4>Accordion Summary styles are inherited from the Accordion component.<br><br><br><h4><b>Card Styling</b></h4></b><b>background color:    </b>card.default<br><b>border color:    </b>card.borderColor<br><b>hover background color:    </b>card.defaultHover<br><b>hover border color:    </b>primary.light<br> ',
};
