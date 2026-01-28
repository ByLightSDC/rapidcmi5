import { debugLog } from '@rangeos-nx/ui/branded';

/**
 * Add data attributes to elements for animation targeting
 * This runs periodically to ensure newly created elements get tagged
 */
export function addAnimationDataAttributes(): void {
  const editorRoot = document.querySelector('.mdxeditor-root-contenteditable');
  if (!editorRoot) {
    console.warn(
      '⚠️ Editor root not found for adding animation data attributes',
    );
    return;
  }

  // Find all elements that have Lexical keys
  const elementsWithKeys = editorRoot.querySelectorAll('[data-lexical-key]');
  debugLog(
    '🏷️ Found',
    `${elementsWithKeys.length} elements with data-lexical-key in editor`,
    undefined,
    'bridge'
  );

  let addedCount = 0;
  elementsWithKeys.forEach((element) => {
    const lexicalKey = element.getAttribute('data-lexical-key');
    if (lexicalKey) {
      if (!element.hasAttribute('data-animation-target')) {
        // Add our animation target attribute
        element.setAttribute('data-animation-target', lexicalKey);
        addedCount++;
      }
    }
  });

  if (addedCount > 0) {
    debugLog(
      '✅ Added data-animation-target to',
      `${addedCount} elements`,
      undefined,
      'bridge',
    );
  }

  // Also log a sample for debugging
  if (elementsWithKeys.length > 0) {
    const sample = elementsWithKeys[0];
    debugLog(
      '📝 Sample element:',
      {
        tagName: sample.tagName,
        lexicalKey: sample.getAttribute('data-lexical-key'),
        animationTarget: sample.getAttribute('data-animation-target'),
        textContent: sample.textContent?.substring(0, 50),
      },
      undefined,
      'bridge',
    );
  }
}

/**
 * Create a MutationObserver to watch for new elements
 * and add data attributes to them
 */
export function createAnimationDataAttributeObserver(): MutationObserver {
  const observer = new MutationObserver((mutations) => {
    let shouldUpdate = false;

    for (const mutation of mutations) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        shouldUpdate = true;
        break;
      }
      if (
        mutation.type === 'attributes' &&
        mutation.attributeName === 'data-lexical-key'
      ) {
        shouldUpdate = true;
        break;
      }
    }

    if (shouldUpdate) {
      addAnimationDataAttributes();
    }
  });

  return observer;
}

/**
 * Start observing the editor for changes and add data attributes
 */
export function startAnimationDataAttributeObserver(): () => void {
  // Wait for editor to be ready
  const tryStart = () => {
    const editorRoot = document.querySelector(
      '.mdxeditor-root-contenteditable',
    );
    if (!editorRoot) {
      console.warn('⚠️ Editor root not found yet, will retry...');
      return null;
    }

    console.log('✅ Found editor root, starting animation data attribute observer');
    debugLog(

      '✅ Found editor root, starting animation data attribute observer',
      undefined,
      undefined,
      'bridge'
    );

    // Initial pass
    addAnimationDataAttributes();

    // Run periodically to catch elements that might be missed
    const intervalId = setInterval(() => {
      addAnimationDataAttributes();
    }, 2000); // Every 2 seconds

    // Create and start observer
    const observer = createAnimationDataAttributeObserver();
    observer.observe(editorRoot, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-lexical-key'],
    });

    debugLog(
      '🎯 Started animation data attribute observer',
      undefined,
      undefined,
      'bridge',
    );

    // Return cleanup function
    return () => {
      clearInterval(intervalId);
      observer.disconnect();
      debugLog(
        '🛑 Stopped animation data attribute observer',
        undefined,
        undefined,
        'bridge',
      );
    };
  };

  // Try immediately
  const cleanup = tryStart();
  if (cleanup) {
    return cleanup;
  }

  // If not ready, try again after a delay
  let retryCleanup: (() => void) | null = null;
  const retryTimeout = setTimeout(() => {
    const delayed = tryStart();
    if (delayed) {
      retryCleanup = delayed;
    }
  }, 1000);

  // Return cleanup that handles both timeout and eventual observer
  return () => {
    clearTimeout(retryTimeout);
    if (retryCleanup) {
      retryCleanup();
    }
  };
}
