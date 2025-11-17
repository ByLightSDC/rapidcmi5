import axios from 'axios';
import { useEffect, useState } from 'react';
import { styled } from '@mui/system';

export function IconAsset({
  iconUrl,
  isCurrentApp,
  currentTheme,
}: {
  iconUrl?: string;
  isCurrentApp: boolean;
  currentTheme: any;
}) {
  const [svgData, setSvgData] = useState<any>(null);

  const StyledSvg = styled('svg')({
    '& path': {
      fill: `${
        isCurrentApp ? currentTheme.palette.grey[500] : currentTheme.nav.icon
      }`,
    },
    '&:hover': {
      '& path': {
        fill: `${
          isCurrentApp
            ? currentTheme.palette.primary.contrastText
            : currentTheme.palette.primary.contrastText
        }`,
      },
    },
    width: '24px',
    height: '24px',
  });

  /**
   * Load list of plugins to include in apps menu
   * Persist in redux so blank/home page can access as well
   */
  const loadIcon = async (assetUrl: string) => {
    try {
      const response = await axios.get<any>(assetUrl);
      setSvgData(response.data);
    } catch (e) {
      console.log('Unable to load icon', e);
    }
  };

  useEffect(() => {
    if (iconUrl) {
      loadIcon(iconUrl);
    }
  }, []);

  return <StyledSvg dangerouslySetInnerHTML={{ __html: svgData }} />;
}
