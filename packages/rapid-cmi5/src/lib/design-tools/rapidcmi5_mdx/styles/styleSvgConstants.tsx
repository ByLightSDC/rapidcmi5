import { SvgIcon } from '@mui/material';
import { CSSProperties } from 'react';
export const svgWrapper = (
  icon: JSX.Element,
  size?: string,
  fontSize?: 'small' | 'inherit' | 'medium' | 'large' | undefined,
  sxProps?: any,
  id?: string,
) => {
  return (
    <SvgIcon
      data-testid={id || 'icon-button'}
      sx={{
        color: 'inherit',
        iconWidth: '24px', //this doesnt work quite right
        iconHeight: '24px',
        ...sxProps,
      }}
      fontSize={fontSize || 'medium'}
    >
      {icon}
    </SvgIcon>
  );
};

// google fonts
export const H1Svg = (color?: string) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="24px"
    viewBox="0 -960 960 960"
    width="24px"
    fill={color}
  >
    <path d="M200-280v-400h80v160h160v-160h80v400h-80v-160H280v160h-80Zm480 0v-320h-80v-80h160v400h-80Z" />
  </svg>
);

// icon duck MIT license
export const gitForkSvg = (color?: string) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke={color}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M17 7C18.1046 7 19 6.10457 19 5C19 3.89543 18.1046 3 17 3C15.8954 3 15 3.89543 15 5C15 6.10457 15.8954 7 17 7Z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M7 7C8.10457 7 9 6.10457 9 5C9 3.89543 8.10457 3 7 3C5.89543 3 5 3.89543 5 5C5 6.10457 5.89543 7 7 7Z"
      //stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M7 21C8.10457 21 9 20.1046 9 19C9 17.8954 8.10457 17 7 17C5.89543 17 5 17.8954 5 19C5 20.1046 5.89543 21 7 21Z"
      //stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M7 7V17"
      //stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M17 7V8C17 10.5 15 11 15 11L9 13C9 13 7 13.5 7 16V17"
      //stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// icon wrappers
export const StyleIconTypeEnum = {
  H1: 'H1',
  GIT: 'gitForkSvg',
};

export const getSvgStyleIcon = (
  iconType: string | undefined,
  sxProps?: CSSProperties,
): JSX.Element | undefined => {
  if (!sxProps) {
    sxProps = { color: 'black', fontSize: '24px' };
  }
  const iconColor = sxProps?.color || 'black';

  if (iconType) {
    switch (iconType) {
      case StyleIconTypeEnum.H1:
        return svgWrapper(H1Svg(iconColor));
      case StyleIconTypeEnum.GIT:
        return svgWrapper(gitForkSvg(iconColor));
    }
  }
  return getSvgStyleIcon(iconType, sxProps);
};
