import React from 'react';

/**
 * A placeholder component shown while a video is loading.
 * @group Video
 */
export function VideoPlaceholder() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '200px',
        backgroundColor: '#f0f0f0',
        border: '2px dashed #ccc',
        borderRadius: '4px',
      }}
    >
      <div style={{ textAlign: 'center', color: '#666' }}>
        <div style={{ fontSize: '48px', marginBottom: '8px' }}>🎬</div>
        <div>Loading video...</div>
      </div>
    </div>
  );
}
