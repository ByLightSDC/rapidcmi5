import { ComponentStory, ComponentMeta } from '@storybook/react';

import { FileUpload } from './FileUpload';

export default {
  component: FileUpload,
  title: 'Inputs/File Upload/FileUpload',
} as ComponentMeta<typeof FileUpload>;

const onFileSelected = (file: any, selected: boolean) => {
  console.log('*+*+*+*+*+*+* file selected ' + selected);
};

const Template: ComponentStory<typeof FileUpload> = (args) => {
  const passArgs = { ...args, onFileSelected };
  return (
    // this surrounding div is to mimic that the File Upload will be within a page (maybe a grid item)
    // with a reasonable width -- we want to be able to see the progress bar clearly in this story
    <div style={{ width: '100%' }}>
      <FileUpload {...passArgs} />;
    </div>
  );
};

export const Primary = Template.bind({});
Primary.args = {
  fileTypes: '.zip',
  enabled: true,
  isUploading: false,
  percentLoaded: 0,
};
Primary.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/b3uDt9fku55RZwMBU1vaHW/Imerzi-Style-Guide?node-id=354%3A19007',
  },
  docs: {
    description: {
      component: 'File Upload',
      story: '',
    },
  },
};

Primary.argTypes = {
  buttonTitle: {
    description: 'Button Text',
  },
  enabled: {
    description:
      'Indicate whether the component (e.g. button) should be enabled (default=true).',
  },
  fileTypes: {
    description:
      'Comma delineated string of file type(s) to allow (e.g., ".tar,.tgz,.zip")',
  },
  isUploading: {
    description:
      'Indication that file is being uploaded (form is being saved) (default=false)',
  },
  percentLoaded: {
    description:
      'Percent complete for file upload (from axios call) (default=0)',
  },
  noFileSelectedMessage: {
    description: 'Message when no file is selected.',
  },
  onFileSelected: {
    description:
      'Function to call to set whether or not a file has been selected',
  },
};
