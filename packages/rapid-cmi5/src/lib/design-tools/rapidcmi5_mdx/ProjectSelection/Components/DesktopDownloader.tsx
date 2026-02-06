import { Box, Button, Menu, MenuItem, Typography } from '@mui/material';
import {
  Download as DownloadIcon,
  Apple,
  Microsoft,
  Computer,
} from '@mui/icons-material';
import { useState } from 'react';

export type DesktopDownloadProps = {
  baseUrl: string;
  version: string;
  windowsName?: string;
  macName?: string;
  macArmName?: string;
  linuxName?: string;
  windowsExt?: string;
  macExt?: string;
  linuxExt?: string;
};

export default function DesktopDownload({
  baseUrl,
  version,
  windowsName = 'Rapid-CMI5-Setup',
  macName = 'Rapid-CMI5-x64',
  macArmName = 'Rapid-CMI5-arm64',
  linuxName = 'Rapid-CMI5',
  linuxExt = 'AppImage',
  windowsExt = 'exe',
  macExt = 'dmg',
}: DesktopDownloadProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const detectOS = () => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (userAgent.includes('mac')) return 'mac';
    if (userAgent.includes('linux')) return 'linux';
    return 'windows';
  };

  const detectMacArchitecture = () => {
    // Check if Apple Silicon (M1/M2/etc)
    return navigator.userAgent.includes('Mac') && navigator.platform === 'MacIntel' 
      ? 'arm64' // Default to ARM for newer Macs
      : 'x64';
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleDownload = (platform: 'windows' | 'mac' | 'linux') => {
    let downloadUrl = '';
    
    switch (platform) {
      case 'windows':
        downloadUrl = `${baseUrl}/${version}/${windowsName}.${windowsExt}`;
        break;
      case 'mac':
        const arch = detectMacArchitecture();
        const macFileName = arch === 'arm64' ? macArmName : macName;
        downloadUrl = `${baseUrl}/${version}/${macFileName}.${macExt}`;
        break;
      case 'linux':
        downloadUrl = `${baseUrl}/${version}/${linuxName}.${linuxExt}`;
        break;
    }
    
    window.location.href = downloadUrl;
    handleClose();
  };

  const detectedOS = detectOS();

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 1000,
      }}
    >
      <Button
        variant="outlined"
        size="small"
        startIcon={<DownloadIcon />}
        onClick={handleClick}
        sx={{
          textTransform: 'none',
          fontSize: '0.75rem',
        }}
      >
        Desktop App
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      >
        <MenuItem
          onClick={() => handleDownload('windows')}
          selected={detectedOS === 'windows'}
        >
          <Microsoft sx={{ mr: 1 }} fontSize="small" />
          Windows
        </MenuItem>
        <MenuItem
          onClick={() => handleDownload('mac')}
          selected={detectedOS === 'mac'}
        >
          <Apple sx={{ mr: 1 }} fontSize="small" />
          macOS
        </MenuItem>
        <MenuItem
          onClick={() => handleDownload('linux')}
          selected={detectedOS === 'linux'}
        >
          <Computer sx={{ mr: 1 }} fontSize="small" />
          Linux
        </MenuItem>
      </Menu>
    </Box>
  );
}