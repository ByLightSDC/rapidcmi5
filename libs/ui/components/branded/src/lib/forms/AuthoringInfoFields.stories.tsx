import { Grid } from '@mui/material';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { useForm } from 'react-hook-form';
import { AuthoringInfoFields, PaperWrapper } from '@rangeos-nx/ui/branded';
import { FormCrudType } from './constants';

export default {
  component: AuthoringInfoFields,
  title: 'forms/AuthoringInfoFields',
} as ComponentMeta<typeof AuthoringInfoFields>;

const mockValues = {
  uuid: 'b14bfac0-e981-47c7-92d4-aefc49820f1c',
  dateCreated: '2025-05-01T00:19:22.998Z',
  dateEdited: '2025-05-01T00:19:22.998Z',
  description: '',
  name: 'item',
  author: 'michelle.gabele@bylight.com',
};

const Template: ComponentStory<typeof AuthoringInfoFields> = (args) => {
  // mock form control
  const { control } = useForm({
    defaultValues: mockValues,
  });
  const passArgs = { ...args, control };
  return (
    <PaperWrapper>
      <Grid container spacing={2}>
        <AuthoringInfoFields {...passArgs} />
      </Grid>
    </PaperWrapper>
  );
};

export const Primary = Template.bind({});
Primary.args = {
  crudType: FormCrudType.edit,
  includeVersioning: false,
};
Primary.parameters = {
  docs: {
    description: {
      component: 'Common Authoring Information Form fields',
      story: 'Authoring Info in Edit Mode',
    },
  },
};

Primary.argTypes = {
  crudType: {
    description: 'Form usage: 0=create, 1=delete, 2=edit, 3=design, 4=view',
  },
  includeVersioning: {
    description:
      'Indication of whether or not to display Branch/Tag/Shared versioning fields',
  },
  control: {
    description: 'Form control (from call to useForm hook)',
  },
  errors: {
    description: 'Form errors (from call to useForm hook)',
  },
};
