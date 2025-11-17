import { getSvgStyleIcon, StyleIconTypeEnum } from './styleSvgConstants';

const iconStyle = { color: '#6F96FF' };
const disabledIconStyle = { color: 'grey' };

export const useMDStyleIcons = () => {
  const h1Icon = getSvgStyleIcon(StyleIconTypeEnum.H1, {
    ...iconStyle,
    fontSize: 'inherit',
  });

  const gitIcon = getSvgStyleIcon(StyleIconTypeEnum.GIT, {
    ...iconStyle,
    fontSize: 'inherit',
  });

  const gitIconDisabled = getSvgStyleIcon(StyleIconTypeEnum.GIT, {
    ...disabledIconStyle,
    fontSize: 'inherit',
  });

  return { h1Icon, gitIcon, gitIconDisabled };
};
