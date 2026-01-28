const tabHeight = '38px';

/**
 * CMI5 player has screwed up MUI themes
 * so we need to force the dark theme on the tab in readonly mode
 */
export const darkTab = {
  height: tabHeight,
  minHeight: tabHeight,
  minWidth: 144,
  borderRadius: 4,
  border: '1px solid #6F96FF',
  color: 'common.white',
  backgroundColor: '#3C59A2',
  fontSize: '14px',
  '&.Mui-selected': {
    border: '2px solid #293658',
    backgroundColor: '#293658',
    color: '#FFFFFFCC',
    '&:hover': {
      border: '2px solid #293658',
      backgroundColor: '#293658',
      color: '#FFFFFFCC',
      cursor: 'default',
    },
  },
  '&:hover': {
    border: '1px solid',
    borderColor: '#6F96FF',
    backgroundColor: '#8AA6D0',
    color: '#FFFFFF',
    cursor: 'pointer',
  },
};
