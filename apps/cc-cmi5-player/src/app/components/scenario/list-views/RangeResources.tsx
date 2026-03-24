/* eslint-disable react/jsx-no-useless-fragment */

/* CCMI5 Flavor */

import { useContext } from 'react';

/* Branded */

/* MUI */
import Box from '@mui/material/Box';

import RangeResourceVMActionRow from './RangeResourceVMActionRow';
import RangeResourceContainerActionRow from './RangeResourceContainerActionRow';
import { ScenarioUpdatesContext } from '../ScenarioUpdatesContext';
import {
  queryKeyRangeResourceVMs,
  Topic,
} from '@rangeos-nx/frontend/clients/hooks';
import { ListView, LoadingUi, iListItemType } from '@rapid-cmi5/ui';
import { Alert } from '@mui/material';

/**
 * Displays Deployed Scenario VMs & Containers from Scenario Context
 * @param {string} [queryKey="range-resource-vms"] Query Key
 * @param {string} [title='VMs'] Title
 * @param {Topic.ResourceVM | Topic.ResourceContainer} [topic="ResourceVM"] Topic to display
 * @returns
 */
export default function RangeResources({
  queryKey = queryKeyRangeResourceVMs,
  title = 'VMs',
  topic = Topic.ResourceVM,
}: {
  queryKey?: string;
  title?: string;
  topic?: Topic.ResourceVM | Topic.ResourceContainer;
}) {
  const { getUpdates } = useContext(ScenarioUpdatesContext);
  const rows = Object.values(getUpdates(topic));
  const isContextInitialized = true;
  return (
    <>
      {rows.length > 0 ? (
        <>
          <div id="app-content" style={{ height: 'auto' }}>
            <Box
              className={'contentBox'}
              sx={{ paddingBottom: '0px' }}
              id={title}
            >
              {topic === Topic.ResourceVM && (
                <ListView
                  testId={queryKey}
                  items={rows}
                  renderItem={(itemUpdate: iListItemType, index?: number) => {
                    return (
                      <>
                        {itemUpdate && (
                          <RangeResourceVMActionRow
                            data={itemUpdate}
                            isTitleDisplay={index === -1}
                            primaryRowTitle={title}
                          />
                        )}
                      </>
                    );
                  }}
                  shouldShowColumnHeaders={true}
                />
              )}
              {topic === Topic.ResourceContainer && (
                <ListView
                  testId={queryKey}
                  items={rows}
                  renderItem={(itemUpdate: iListItemType, index?: number) => {
                    return (
                      <>
                        {itemUpdate && (
                          <RangeResourceContainerActionRow
                            data={itemUpdate}
                            isTitleDisplay={index === -1}
                            primaryRowTitle={title}
                          />
                        )}
                      </>
                    );
                  }}
                  shouldShowColumnHeaders={true}
                />
              )}
            </Box>
          </div>
        </>
      ) : (
        <Box sx={{ margin: '12px' }}>
          {isContextInitialized ? (
            <Alert
              severity="info"
              sx={{
                padding: '12px',
                maxWidth: '480px',
                backgroundColor: 'transparent',
                borderColor: 'transparent',
              }}
            >
              {topic === Topic.ResourceVM && 'No VMs Found'}
              {topic === Topic.ResourceContainer && 'No Containers Found'}
            </Alert>
          ) : (
            <LoadingUi
              message={`Loading ${topic === Topic.ResourceVM ? 'VMs...' : topic === Topic.ResourceContainer ? 'Containers...' : 'AutoGraders'}`}
            />
          )}
        </Box>
      )}
    </>
  );
}
