// import { CSSProperties } from 'react';
// import { MetaIconTypeEnum } from '../../../../../../libs/frontend/clients/devops-api/src';
// import { getVmImageIcon } from '../../views/dashboards/vm-images/iconConstants';
// import { svgWrapper } from '../../views/dashboards/design-tools/project-designer/ui/ProjectIcons';
// import {
//   CloudSvg,
//   DesktopSvg,
//   LaptopSvg,
//   PhoneAndroidSvg,
//   PrintSvg,
//   RouterSvg,
//   StraightenSvg,
// } from './svgConstants';

// /**
//  * Looks for SVG icon and returns that first, before
//  * returning Material UI icon
//  * @param iconType
//  * @param sxProps
//  * @returns
//  */
// export const getSvgVmImageIcon = (
//   iconType: string | undefined,
//   sxProps?: CSSProperties,
// ): JSX.Element | undefined => {
//   if (!sxProps) {
//     sxProps = { color: 'black', fontSize: '24px' };
//   }
//   const iconColor = sxProps?.color || 'black';

//   if (iconType) {
//     switch (iconType) {
//       case MetaIconTypeEnum.Internet:
//         return svgWrapper(CloudSvg(iconColor));
//       case MetaIconTypeEnum.Laptop:
//         return svgWrapper(LaptopSvg(iconColor));
//       case MetaIconTypeEnum.Mobile:
//         return svgWrapper(PhoneAndroidSvg(iconColor));
//       case MetaIconTypeEnum.Printer:
//         return svgWrapper(PrintSvg(iconColor));
//       case MetaIconTypeEnum.Switch:
//         return svgWrapper(StraightenSvg(iconColor));
//       case MetaIconTypeEnum.WirelessAccessPoint:
//         return svgWrapper(RouterSvg(iconColor));
//       case MetaIconTypeEnum.Workstation:
//         return svgWrapper(DesktopSvg(iconColor));
//       default:
//         break;
//     }
//   }
//   return getVmImageIcon(iconType, sxProps);
// };
