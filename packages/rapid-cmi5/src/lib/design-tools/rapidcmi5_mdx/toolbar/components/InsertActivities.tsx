import { usePublisher } from '@mdxeditor/gurx';
import { ContainerDirective } from 'mdast-util-directive';
import { insertActivityDirective$ } from '../../plugins/Activity';
import { useSelector } from 'react-redux';
import { useMemo } from 'react';
import { Stack, useTheme } from '@mui/material';
import {
  RC5ActivityTypeEnum,
  getActivityTypeFromDisplayName,
  activityLabels,
} from '@rapid-cmi5/cmi5-build-common';
import {
  getDefaultData,
  debugLogError,
  ButtonMinorUi,
  getDefaultContentWidth,
} from '@rapid-cmi5/ui';
import { scenario, teamScenario } from '../../../../redux/courseBuilderReducer';

/**
 * Icons
 */
import AddIcon from '@mui/icons-material/Add';
/**
 *
 * A toolbar dropdown button that allows the user to insert activities.
 * For this to work, you need to have the `directives` plugin enabled with the {@link ActivityDirectiveDescriptor} configured.
 *
 * @group Toolbar Components
 */
export const InsertActivities = () => {
  const insertActivity = usePublisher(insertActivityDirective$);
  const scenarioSel = useSelector(scenario);
  const teamScenarioSel = useSelector(teamScenario);
  const theme = useTheme();

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
      attributes: { contentWidth: getDefaultContentWidth(activityLabel) },
      name: getActivityTypeFromDisplayName(activityLabel),
      children: [data],
    } as ContainerDirective);
  };

  /**
   * Disable Scenario activity option if there is already a scenario in the lesson.
   * Individual / Class (Basic Auth) and Team Exercise (SSO) cannot be mixed,
   * so either kind blocks inserting another.
   */
  const disabledActivities = useMemo(() => {
    const disabled: RC5ActivityTypeEnum[] = [];
    if (scenarioSel || teamScenarioSel) {
      disabled.push(RC5ActivityTypeEnum.scenario);
    }
    return disabled;
  }, [scenarioSel, teamScenarioSel]);

  return (
    <Stack direction="column">
      <>
        {activityLabels.map((option: any, index) => {
          //skip download file
          if (option.indexOf('Download') >= 0) {
            return null;
          }
          //team exercise is a deployment type inside the scenario form
          if (option === RC5ActivityTypeEnum.consoles) {
            return null;
          }

          const isDisabled = disabledActivities.includes(option);

          return (
            <ButtonMinorUi
              key={`activity_${index}`}
              id={`insert-activity-${getActivityTypeFromDisplayName(option)}`}
              disabled={isDisabled}
              tooltip={
                isDisabled && option === RC5ActivityTypeEnum.scenario
                  ? 'This lesson already has a scenario'
                  : undefined
              }
              sx={{
                display: 'flex',
                justifyContent: 'flex-start',
                alignItems: 'center',
                margin: 0.5,
                padding: 1,
              }}
              startIcon={
                <AddIcon
                  sx={{
                    color: theme.palette.primary.main,
                    fill: theme.palette.primary.main,
                  }}
                />
              }
              onClick={() => {
                handleSelect(option);
              }}
            >
              {option}
            </ButtonMinorUi>
          );
        })}
      </>
    </Stack>
  );
};
