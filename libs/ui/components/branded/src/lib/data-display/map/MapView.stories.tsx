import { ComponentStory, ComponentMeta } from '@storybook/react';
import { MapView } from './MapView';
import { ModalDialog } from '../../modals/ModalDialog';

export default {
  component: MapView,
  title: 'DataDisplay/MapView',
} as ComponentMeta<typeof MapView>;

const Template: ComponentStory<typeof MapView> = (args) => (
  <ModalDialog
    buttons={['Apply']}
    dialogProps={{ fullWidth: true, open: true }}
    testId="map-view-dialog"
    title="Map View"
  >
    <MapView {...args} />
  </ModalDialog>
);

export const Primary = Template.bind({});

Primary.args = {
  //testId: 'item_list'
};

Primary.argTypes = {};
