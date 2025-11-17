import { ComponentStory, ComponentMeta } from '@storybook/react';
import { OLMapView } from './OLMapView';
import { ModalDialog } from '@rangeos-nx/ui/branded';
import { useState } from 'react';

export default {
  component: OLMapView,
  title: 'DataDisplay/OpenLayers MapView',
} as ComponentMeta<typeof OLMapView>;

const Template: ComponentStory<typeof OLMapView> = (args) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [location, setLocation] = useState<Record<string, string>>({
    latitude: '',
    longitude: '',
  });
  const passArgs = {
    ...args,
    setLocation,
  };
  return (
    <ModalDialog
      buttons={['Apply']}
      dialogProps={{ fullWidth: true, open: true }}
      testId="map-view-dialog"
      title="OpenLayers Map View"
      // handleAction={}
    >
      <OLMapView {...passArgs} />
    </ModalDialog>
  );
};

export const Primary = Template.bind({});

Primary.args = {
  location: { longitude: '', latitude: '' },
};

Primary.argTypes = {};
