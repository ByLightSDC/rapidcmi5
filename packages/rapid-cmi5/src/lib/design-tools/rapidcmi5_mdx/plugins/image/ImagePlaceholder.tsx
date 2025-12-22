import React from 'react';
import ImageIcon from '@mui/icons-material/Image';
import styles from './styles/image-plugin.module.css'

/**
 * A custom placeholder for images.
 * This will be shown until the image is ready to be displayed.
 * @constructor
 */
export const ImagePlaceholder: React.FC = () => {
  return (
    <div className={styles['imagePlaceholder']}>
      <ImageIcon />
    </div>
  );
};
