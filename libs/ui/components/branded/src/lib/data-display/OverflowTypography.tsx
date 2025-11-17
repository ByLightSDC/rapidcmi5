/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useEffect, useState } from 'react';

/* MUI */
import Tooltip from '@mui/material/Tooltip';
import Typography, { TypographyProps } from '@mui/material/Typography';

/* Branded */
import { ButtonCopyText } from '@rangeos-nx/ui/branded';

/**
 * @interface OverflowTypographyProps  Extended TypographyProps
 * @property {string} [label] Label to use for aria-label
 * @property {string} title Text to display
 * @property {boolean} [shouldPreventWrap = true] Prevent tooltip text wrap
 * @property {*} {sxProps} Override properties for default typography style
 * @property {string} {uuid} Optional UUID to display in tooltip and provide for copying
 * NOTE: if this OverflowTypography is in a div with other "components" then
 * surround with a separate div to provide style such as
 *   <div style={{width: 'auto', maxWidth: '90% }}>  <OverflowTypography.../> </div?
 *   auto => other piece(s) will be next to overflow item
 *   maxWidth => % so it won't run into other piece(s)
 */
interface OverflowTypographyProps extends TypographyProps {
  copyInstructions?: string;
  label?: string;
  shouldPreventWrap?: boolean;
  title: string;
  sxProps?: any;
  uuid?: string;
}

export function OverflowTypography(props: OverflowTypographyProps) {
  const {
    copyInstructions = 'Copy',
    label,
    title,
    uuid,
    shouldPreventWrap = true,
    sxProps = {},
    ...typographyProps
  } = props;

  const textElementRef = useRef<HTMLElement>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isCursorOnTooltip, setIsCursorOnTooltip] = useState(false);

  const compareWidth = () => {
    if (textElementRef?.current) {
      const scrollWidth = textElementRef?.current?.scrollWidth;
      const clientWidth = textElementRef?.current?.clientWidth;
      const compare = scrollWidth > clientWidth;
      setShowTooltip(compare);
    }
  };

  useEffect(() => {
    // compare when first loading page and then on resize of page
    compareWidth();
    window.addEventListener('resize', compareWidth);

    return () => {
      window.removeEventListener('resize', compareWidth);
    };
  }, []);

  const variant = typographyProps?.variant || 'body2';
  const color = typographyProps?.color || 'text.interactable';

  const theWrapStyle = shouldPreventWrap
    ? {
        display: 'flex',
        whiteSpace: 'nowrap',
      }
    : undefined;

  const getNarrowTooltipTitle = () => {
    if (showTooltip) {
      return (
        <div
          //REF below breaks wrapping and tooltip does not expand to fit tip
          // style={{
          //   display: 'flex',
          //   whiteSpace: 'pre-line',
          //   overflowWrap: 'anywhere', // allows LONG words to wrap (example: chart digest)
          //   width: 'auto',
          // }}
          onMouseEnter={(e) => {
            // entering the actual tooltip
            setIsCursorOnTooltip(true);
          }}
        >
          {title}
          <div style={theWrapStyle}>
            {uuid && (
              <ButtonCopyText
                name="copy-uuid"
                text={uuid}
                tooltip={copyInstructions}
              />
            )}

            {uuid}
          </div>
        </div>
      );
    }
    if (uuid) {
      return (
        <div
          style={theWrapStyle}
          //REF below breaks wrapping and tooltip does not expand to fit tip
          // style={{
          //   display: 'flex',
          //   whiteSpace: 'pre', // so UUID won't wrap
          //   width: 'auto',
          // }}
          onMouseEnter={(e) => {
            // entering the actual tooltip
            setIsCursorOnTooltip(true);
          }}
        >
          <ButtonCopyText
            name="copy-uuid"
            text={uuid}
            tooltip={copyInstructions}
          />
          {uuid}
        </div>
      );
    }
    return; // nothing to display for a tooltip
  };

  return (
    <Tooltip
      role="tooltip"
      arrow
      enterDelay={500}
      enterNextDelay={500}
      sx={{ maxWidth: 'none' }}
      placement="bottom-start"
      title={getNarrowTooltipTitle()}
      onClick={(evt: any) => {
        // prevent a click on the tooltip from protagating if cursor is on the actual tooltip popup
        if (isCursorOnTooltip) {
          evt.stopPropagation();
        }
      }}
      onMouseLeave={(e) => {
        // when we leave this component, we are no longer on tooltip
        setIsCursorOnTooltip(false);
      }}
    >
      <Typography
        noWrap
        aria-label={label}
        ref={textElementRef}
        variant={variant}
        color={color}
        className="clipped-text"
        sx={{
          paddingRight: '4px', // to prevent running into next column
          ...sxProps,
        }}
        {...typographyProps}
      >
        {title}
      </Typography>
    </Tooltip>
  );
}
