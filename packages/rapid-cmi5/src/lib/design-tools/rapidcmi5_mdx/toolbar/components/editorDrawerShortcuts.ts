export type EditorDrawerShortcut = 'appearance' | 'animation' | 'blocks';

/**Numbers for shortcut - we can change to other or letters -MB */
const shortcutNumber: Record<EditorDrawerShortcut, string> = {
  appearance: '1',
  animation: '2',
  blocks: '3',
};

function isMacPlatform() {
  return (
    typeof navigator !== 'undefined' &&
    /Mac|iPhone|iPad/.test(navigator.platform)
  );
}
/**Returns human readable version for tooltips */
export function getEditorDrawerShortcutLabel(shortcut: EditorDrawerShortcut) {
  const modifier = isMacPlatform() ? '⌘+Option' : 'Ctrl+Alt';
  return `${modifier}+${shortcutNumber[shortcut]}`;
}

/**Returns the format used by aria-keyshortcuts attr. which helps assistive tech report the shortcut */
export function getEditorDrawerShortcutAria(shortcut: EditorDrawerShortcut) {
  const modifier = isMacPlatform() ? 'Meta+Alt' : 'Control+Alt';
  return `${modifier}+${shortcutNumber[shortcut]}`;
}
/**Checks keyevent and returns matching drawer name or null */
export function matchEditorDrawerShortcut(
  event: globalThis.KeyboardEvent,
): EditorDrawerShortcut | null {
  const macPlatform = isMacPlatform();
  const primaryModifier = macPlatform ? event.metaKey : event.ctrlKey;

  /* Ignore events when required modifiers aren’t pressed, when the event is a repeat, 
    part of text composition, already handled, or using AltGraph. 
    Ignores key presses from inputs, menus, dialogs, and similar controls.*/
  if (
    !primaryModifier ||
    !event.altKey ||
    event.shiftKey ||
    event.repeat ||
    event.isComposing ||
    event.getModifierState('AltGraph') ||
    event.defaultPrevented
  ) {
    return null;
  }

  const target = event.target;
  if (
    target instanceof HTMLElement &&
    target.closest(
      'input, textarea, select, [role="combobox"], [role="menu"], [role="listbox"], [role="dialog"]',
    )
  ) {
    return null;
  }

  switch (event.code) {
    case 'Digit1':
    case 'Numpad1':
      return 'appearance';
    case 'Digit2':
    case 'Numpad2':
      return 'animation';
    case 'Digit3':
    case 'Numpad3':
      return 'blocks';
    default:
      return null;
  }
}
