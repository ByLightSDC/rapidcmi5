/* eslint-disable react/jsx-no-useless-fragment */

/* CCMI5 Flavor */

import { useContext } from 'react';

/* Branded */
import { iListItemType, ListView } from '@rangeos-nx/ui/branded';

import { queryKeyRangeResourceVMs, Topic } from '@rangeos-nx/ui/api/hooks';

/* MUI */
import Box from '@mui/material/Box';

import RangeResourceVMActionRow from './RangeResourceVMActionRow';
import RangeResourceContainerActionRow from './RangeResourceContainerActionRow';
import { ScenarioUpdatesContext } from '../ScenarioUpdatesContext';

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
      ) : null}
    </>
  );
}
