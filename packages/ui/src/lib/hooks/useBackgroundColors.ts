import { useCallback, useRef, useState } from 'react';

export const useBackgroundColors = (overrideBackgroundColor?: string) => {
  const [backgroundColor, setBackgroundColor] = useState<string>(
    overrideBackgroundColor ?? '',
  );
  const [pendingColor, setPendingColor] = useState<string>(
    overrideBackgroundColor ?? '',
  );
  const [colorPickerAnchor, setColorPickerAnchor] =
    useState<HTMLButtonElement | null>(null);

  const pendingColorRef = useRef(pendingColor);

  const openPicker = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setPendingColorAndRef(backgroundColor);
    setColorPickerAnchor(e.currentTarget);
  };

  const setPendingColorAndRef = useCallback((newColor: string) => {
    pendingColorRef.current = newColor;
    setPendingColor(newColor);
  }, []);

  const setOverrideColor = useCallback((newColor: string) => {
    setBackgroundColor(newColor);
    pendingColorRef.current = newColor;
    setPendingColor(newColor);
  }, []);

  return {
    backgroundColor,
    colorPickerAnchor,
    openPicker,
    pendingColor,
    pendingColorRef,
    setColorPickerAnchor,
    setBackgroundColor,
    setOverrideColor,
    setPendingColorAndRef,
  };
};
