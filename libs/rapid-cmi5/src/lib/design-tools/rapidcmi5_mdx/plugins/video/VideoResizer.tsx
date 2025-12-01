import React from 'react';
import type { LexicalEditor } from 'lexical';
import styles from './styles/video-plugin.module.css';

interface VideoResizerProps {
  editor: LexicalEditor;
  videoRef: React.RefObject<HTMLVideoElement>;
  onResizeStart: () => void;
  onResizeEnd: (width: number | 'inherit', height: number | 'inherit') => void;
}

export default function VideoResizer({
  editor,
  videoRef,
  onResizeStart,
  onResizeEnd,
}: VideoResizerProps): JSX.Element {
  const [isResizing, setIsResizing] = React.useState(false);
  const [startPos, setStartPos] = React.useState({ x: 0, y: 0 });
  const [startSize, setStartSize] = React.useState({ width: 0, height: 0 });
  const [corner, setCorner] = React.useState<string>('');

  const handleMouseDown = (
    e: React.MouseEvent<HTMLDivElement>,
    cornerType: string,
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (!videoRef.current) return;

    const rect = videoRef.current.getBoundingClientRect();
    setStartPos({ x: e.clientX, y: e.clientY });
    setStartSize({ width: rect.width, height: rect.height });
    setCorner(cornerType);
    setIsResizing(true);
    onResizeStart();
  };

  React.useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!videoRef.current) return;

      const deltaX = e.clientX - startPos.x;
      const deltaY = e.clientY - startPos.y;

      let newWidth = startSize.width;
      let newHeight = startSize.height;

      // Calculate new dimensions based on corner being dragged
      switch (corner) {
        case 'bottomRight':
          newWidth = startSize.width + deltaX;
          newHeight = startSize.height + deltaY;
          break;
        case 'bottomLeft':
          newWidth = startSize.width - deltaX;
          newHeight = startSize.height + deltaY;
          break;
        case 'topRight':
          newWidth = startSize.width + deltaX;
          newHeight = startSize.height - deltaY;
          break;
        case 'topLeft':
          newWidth = startSize.width - deltaX;
          newHeight = startSize.height - deltaY;
          break;
      }

      // Maintain aspect ratio
      const aspectRatio = startSize.width / startSize.height;
      newHeight = newWidth / aspectRatio;

      // Apply minimum size constraints
      newWidth = Math.max(100, newWidth);
      newHeight = Math.max(75, newHeight);

      // Temporarily apply the size for visual feedback
      videoRef.current.style.width = `${newWidth}px`;
      videoRef.current.style.height = `${newHeight}px`;
    };

    const handleMouseUp = () => {
      if (!videoRef.current) return;

      const finalWidth = parseInt(videoRef.current.style.width, 10);
      const finalHeight = parseInt(videoRef.current.style.height, 10);

      setIsResizing(false);
      onResizeEnd(finalWidth, finalHeight);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, startPos, startSize, corner, videoRef, onResizeEnd]);

  return (
    <>
      <div
        className={`${styles.videoResizer} ${styles.topLeft}`}
        onMouseDown={(e) => handleMouseDown(e, 'topLeft')}
      />
      <div
        className={`${styles.videoResizer} ${styles.topRight}`}
        onMouseDown={(e) => handleMouseDown(e, 'topRight')}
      />
      <div
        className={`${styles.videoResizer} ${styles.bottomLeft}`}
        onMouseDown={(e) => handleMouseDown(e, 'bottomLeft')}
      />
      <div
        className={`${styles.videoResizer} ${styles.bottomRight}`}
        onMouseDown={(e) => handleMouseDown(e, 'bottomRight')}
      />
    </>
  );
}
