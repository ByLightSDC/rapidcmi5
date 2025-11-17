import { ComponentStory, ComponentMeta } from '@storybook/react';
import Box from '@mui/material/Box';

import SampleDynamicPropertiesForm from './SampleDynamicPropertiesForm';
import { PaperWrapper } from '../../storybook/PaperWrapper';
import { FormCrudType } from '../constants';
import { DynamicPropertyProvider } from './DynamicPropertyContext';
import { Provider } from 'react-redux';
import {
  commonAppReducer,
  commonAppTransReducer,
  dynamicSchemaReducer,
} from '@rangeos-nx/ui/redux';
import { configureStore } from '@reduxjs/toolkit';
import { FormControlUIProvider } from '../FormControlUIContext';

export default {
  component: SampleDynamicPropertiesForm,
  title: 'Forms/SampleDynamicPropertiesForm',
} as ComponentMeta<typeof SampleDynamicPropertiesForm>;

const store = configureStore({
  reducer: {
    commonApp: commonAppReducer,
    commonAppTrans: commonAppTransReducer,
    schemaData: dynamicSchemaReducer,
  },
});

const Template: ComponentStory<typeof SampleDynamicPropertiesForm> = (
  args: any,
) => {
  return (
    <PaperWrapper>
      <Provider store={store}>
        <div id="app-content">
          <Box className={'contentBox'} id="content">
            <DynamicPropertyProvider crudType={FormCrudType.edit}>
              <FormControlUIProvider>
                <SampleDynamicPropertiesForm {...args} />
              </FormControlUIProvider>
            </DynamicPropertyProvider>
            <Box id="footer_nav" sx={{ margin: '0px' }} />
          </Box>
        </div>
      </Provider>
    </PaperWrapper>
  );
};

export const Primary = Template.bind({});
Primary.args = {
  schema: {
    $schema: 'http://json-schema.org/schema#',
    type: 'object',
    properties: {
      values: {
        type: 'object',
        properties: {
          myBoolean: {
            type: 'boolean',
            description: 'A boolean property',
          },
          numberFields: {
            type: 'object',
            properties: {
              myInteger: {
                type: 'integer',
              },
              myRangeInteger: {
                type: 'integer',
                minimum: 5,
                maximum: 10,
                description: 'this integer has a range of valid values',
              },
            },
            required: ['myInteger'],
          },
          stringFields: {
            type: 'object',
            properties: {
              myString: {
                type: 'string',
              },
              myEmailString: {
                type: 'string',
                format: 'email',
              },
              myIpv4String: {
                type: 'string',
                format: 'ipv4',
              },
              mySizedString: {
                type: 'string',
                minLength: 3,
                maxLength: 10,
              },
            },
            required: ['myEmailString'],
          },
          myEnum: {
            type: 'string',
            enum: ['apple', 'banana', 'orange'],
            description: 'Very fruitful',
          },
          mySimpleArray: {
            type: 'array',
            items: { type: 'string', minLength: 3 },
            // minItems: 2,
            maxItems: 4,
            uniqueItems: true,
            description: 'simple unique string array with max entries',
          },
        },
      },
    },
  },
  initialValues: {
    values: {
      myBoolean: true,
      numberFields: {
        myInteger: 5,
      },
      stringFields: {
        myEmailString: 'me@home.net',
      },
    },
  },
};

Primary.argTypes = {
  schema: {
    description: 'the dynamic property schema',
  },
  initialValues: {
    description: 'initial values to populate any of the dynamic fields',
  },
};
