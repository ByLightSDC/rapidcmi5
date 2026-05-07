import { useState } from 'react';

export const useBackgroundColors = (overrideBackgroundColor?: string) => {
  const [backgroundColor, setBackgroundColor] = useState<string>(
    overrideBackgroundColor ?? '',
  );
  const [pendingColor, setPendingColor] = useState<string>(
    overrideBackgroundColor ?? '',
  );
  const [colorPickerAnchor, setColorPickerAnchor] =
    useState<HTMLButtonElement | null>(null);

  return {
    backgroundColor,
    colorPickerAnchor,
    pendingColor,
    setBackgroundColor,
    setColorPickerAnchor,
    setPendingColor,
  };
};
