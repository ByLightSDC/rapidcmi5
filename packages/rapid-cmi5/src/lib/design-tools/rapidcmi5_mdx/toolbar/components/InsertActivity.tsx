import { usePublisher } from '@mdxeditor/gurx';
import { ContainerDirective } from 'mdast-util-directive';
import { rapidIconFor, RapidIconKey } from '../../editors/Icons';
import { insertActivityDirective$ } from '../../plugins/Activity';

import { useSelector } from 'react-redux';
import { useMemo } from 'react';
import { Typography } from '@mui/material';
import { RC5ActivityTypeEnum, getActivityTypeFromDisplayName, activityLabels } from '@rapid-cmi5/cmi5-build-common';
import { getDefaultData, debugLogError, SelectorMainUi } from '@rapid-cmi5/ui';
import { scenario, teamScenario } from 'packages/rapid-cmi5/src/lib/redux/courseBuilderReducer';

/**
 * A toolbar dropdown button that allows the user to insert admonitions.
 * For this to work, you need to have the `directives` plugin enabled with the {@link AdmonitionDirectiveDescriptor} configured.
 *
 * @group Toolbar Components
 */
export const InsertActivity = () => {
  const insertActivity = usePublisher(insertActivityDirective$);
  const scenarioSel = useSelector(scenario);
  const teamScenarioSel = useSelector(teamScenario);

  const handleSelect = (activityLabel: RC5ActivityTypeEnum) => {
    const jsonStr = getDefaultData(activityLabel);

    if (!jsonStr) {
      debugLogError('No JSON found for activity ' + activityLabel);
      return;
    }
    const data: any = {
      type: 'code',
      lang: 'json',
      value: jsonStr,
    };

    insertActivity({
      type: 'containerDirective',
      attributes: {},
      name: getActivityTypeFromDisplayName(activityLabel),
      children: [data],
    } as ContainerDirective);
  };

  /**
   * Disable Scenario activity option if there is already a scenario in the lesson
   */
  const disabledActivities = useMemo(() => {
    const disabled: RC5ActivityTypeEnum[] = [];
    if (scenarioSel) {
      disabled.push(RC5ActivityTypeEnum.scenario);
    }
    if (teamScenarioSel) {
      disabled.push(RC5ActivityTypeEnum.consoles);
    }
    return disabled;
  }, [scenarioSel, teamScenarioSel]);

  return (
    <SelectorMainUi
      divProps={{ marginLeft: -24 }}
      key="select-activity"
      header={
        <Typography sx={{ marginLeft: '12px' }} variant="caption">
          Activity
        </Typography>
      }
      icon={
        <div
          style={{
            pointerEvents: 'none',
            position: 'relative',
            zIndex: 99999,
            left: 32,
            marginTop: 8,
          }}
        >
          {rapidIconFor(RapidIconKey.activity)}
        </div>
      }
      id="select-activity"
      isTransient={true}
      options={activityLabels}
      disabledOptions={disabledActivities}
      sxProps={{ minWidth: '60px', height: '30px' }}
      isFormStyle={false}
      onSelect={handleSelect}
    />
  );
};
