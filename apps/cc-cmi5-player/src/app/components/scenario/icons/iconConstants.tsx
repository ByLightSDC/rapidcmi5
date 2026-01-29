//MUI
import { SvgIcon } from '@mui/material';

//Icons
import CloudQueue from '@mui/icons-material/CloudQueue';
import DesktopWindows from '@mui/icons-material/DesktopWindows';
import LaptopMacIcon from '@mui/icons-material/LaptopMac';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import PrintIcon from '@mui/icons-material/Print';
import StraightenIcon from '@mui/icons-material/Straighten';
import RouterIcon from '@mui/icons-material/Router';
import ImageIcon from '@mui/icons-material/Image';

import {
  FileServerIconSvg,
  FirewallIconSvg,
  MailServerIconSvg,
  ProgramLogicControlIconSvg,
  ProxyIconSvg,
  RouterIconSvg,
  ServerIconSvg,
  WebServiceIconSvg,
} from './svgIconConstants';

import { MetaIconTypeEnum } from '@rangeos-nx/frontend/clients/devops-api';

/* eslint-disable @typescript-eslint/no-explicit-any */
const svgWrapper = (icon: JSX.Element, sxProps?: any) => {
  if (!sxProps) {
    sxProps = { color: 'red', fontSize: '16px' };
  }
  return (
    <SvgIcon
      data-testid="icon-button"
      sx={{ ...sxProps }}
      fontSize={sxProps.fontSize}
    >
      {icon}
    </SvgIcon>
  );
};

//https://cybercents.atlassian.net/wiki/spaces/CLNTWEB/pages/2214527056/Network+Entity+Icons
export const getVmImageIcon = (
  iconType: string | undefined,
  sxProps?: any,
): JSX.Element | undefined => {
  if (!sxProps) {
    sxProps = { color: 'black', fontSize: '24px' };
  }
  const iconColor = sxProps?.color || 'black';
  //MetaIconTypeEnum
  if (iconType) {
    switch (iconType) {
      case MetaIconTypeEnum.FileServer:
        return svgWrapper(FileServerIconSvg(iconColor));
      case MetaIconTypeEnum.Firewall:
        return svgWrapper(FirewallIconSvg(iconColor));
      case MetaIconTypeEnum.Internet:
        return <CloudQueue sx={sxProps} />;
      case MetaIconTypeEnum.Laptop:
        return <LaptopMacIcon sx={sxProps} />;
      case MetaIconTypeEnum.MailServer:
        return svgWrapper(MailServerIconSvg(iconColor));
      case MetaIconTypeEnum.Mobile:
        return <PhoneAndroidIcon sx={sxProps} />;
      case MetaIconTypeEnum.Plc:
        return svgWrapper(ProgramLogicControlIconSvg(iconColor));
      case MetaIconTypeEnum.Printer:
        return <PrintIcon sx={sxProps} />;
      case MetaIconTypeEnum.Router:
        return svgWrapper(RouterIconSvg(iconColor));
      case MetaIconTypeEnum.Server:
        return svgWrapper(ServerIconSvg(iconColor));
      case MetaIconTypeEnum.Switch:
        return <StraightenIcon sx={sxProps} />;
      case MetaIconTypeEnum.WebProxy:
        return svgWrapper(ProxyIconSvg(iconColor));
      case MetaIconTypeEnum.WebServer:
        return svgWrapper(WebServiceIconSvg(iconColor));
      case MetaIconTypeEnum.WirelessAccessPoint:
        return <RouterIcon sx={sxProps} />;
      case MetaIconTypeEnum.Workstation:
        return <DesktopWindows sx={sxProps} />;
    }
  }

  return <ImageIcon />;
};
