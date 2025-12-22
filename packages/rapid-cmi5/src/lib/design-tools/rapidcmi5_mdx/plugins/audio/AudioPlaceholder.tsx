import React from 'react';
import styles from './styles/audio-plugin.module.css';

export const AudioPlaceholder: React.FC = () => {
  return (
    <div className={styles.audioPlaceholder}>
      <p>Loading audio...</p>
    </div>
  );
};
