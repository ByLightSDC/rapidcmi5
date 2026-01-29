import { useCellValue, usePublisher } from '@mdxeditor/gurx';

import { directiveDescriptors$, insertDirective$ } from '@mdxeditor/editor';
import { useEffect, useMemo } from 'react';
import { Typography } from '@mui/material';
import {
  AdmonitionTypeEnum,
  admonitionLabels,
} from '@rapid-cmi5/cmi5-build-common';
import {
  capitalizeFirstLetter,
  getAdmonitionIcon,
  SelectorMainUi,
} from '@rapid-cmi5/ui';

/**
 * A toolbar dropdown button that allows the user to insert admonitions.
 * For this to work, you need to have the `directives` plugin enabled with the {@link AdmonitionDirectiveDescriptor} configured.
 *
 * @group Toolbar Components
 */
export const InsertAdmonition = () => {
  const insertDirective = usePublisher(insertDirective$);
  const directiveDescriptors = useCellValue(directiveDescriptors$);
  const handleSelect = (admonitionLabel: string) => {
    insertDirective({
      type: 'containerDirective',
      name: admonitionLabel,
      attributes: {
        title: capitalizeFirstLetter(admonitionLabel),
        collapse: 'closed',
      },
    });
  };

  const noteIcon = useMemo(
    () => getAdmonitionIcon(AdmonitionTypeEnum.note),
    [],
  );

  useEffect(() => {
    //console.log('directiveDescriptors', directiveDescriptors);
  }, [directiveDescriptors]);
  return (
    <SelectorMainUi
      divProps={{ marginLeft: 0 }}
      key="select-admonition"
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
          {noteIcon}
        </div>
      }
      id="select-admonition"
      isTransient={true}
      listItemProps={{
        color: 'primary',
        fontSize: 'small',
        fontWeight: 'lighter',
        textTransform: 'capitalize',
      }}
      header={
        <Typography sx={{ marginLeft: '12px' }} variant="caption">
          Call Out
        </Typography>
      }
      options={admonitionLabels}
      sxProps={{ minWidth: '60px', height: '30px' }}
      isFormStyle={false}
      onSelect={handleSelect}
    />
  );
};
