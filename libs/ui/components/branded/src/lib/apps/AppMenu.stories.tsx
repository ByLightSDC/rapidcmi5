import { Provider } from 'react-redux';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { AppMenu } from './AppMenu';
import { commonAppReducer, commonAppTransReducer } from '@rangeos-nx/ui/redux';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import { BrowserRouter } from 'react-router';

/** Icons */
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SchoolIcon from '@mui/icons-material/School';

export default {
  component: AppMenu,
  title: 'Apps/AppMenu',
} as ComponentMeta<typeof AppMenu>;

const mock = createSlice({
  name: 'commonAppTrans',
  initialState: {
    appHeaderVisible: true,
    breadCrumbLeft: 8,
    breadCrumbVisible: true,
    plugins: [
      {
        isVisible: true,
        id: 'link2',
        icon: <MenuBookIcon color="primary" />,
        title: 'User Guides',
        url: 'localhost:4200',
      },
      {
        isVisible: true,
        id: 'link2',
        icon: <SchoolIcon color="primary" />,
        title: 'LMS',
        url: 'localhost:4200',
      },
    ],
  },

  reducers: {
    setAppHeaderVisible: (state, action) => {
      //
    },
    setBreadCrumbLeft: (state, action) => {
      //
    },
    setBreadCrumbVisible: (state, action) => {
      //
    },
    setPlugins: (state, action) => {
      //
    },
  },
});

const store = configureStore({
  reducer: {
    commonApp: commonAppReducer,
    commonAppTrans: mock.reducer,
  },
});

const Template: ComponentStory<typeof AppMenu> = (args) => (
  <Provider store={store}>
    <BrowserRouter>
      <AppMenu {...args} />
    </BrowserRouter>
  </Provider>
);

export const Primary = Template.bind({});
Primary.args = {
  urlOverrides: [],
};

Primary.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/b3uDt9fku55RZwMBU1vaHW/Imerzi-Style-Guide?node-id=287%3A36885',
  },
};

Primary.argTypes = {
  urlOverrides: {
    default: [],
    description: 'Urls to override persisted plugin links ',
  },
  onAppIconClick: {
    default: undefined,
    description: 'Method to call when menu opened',
  },
};
