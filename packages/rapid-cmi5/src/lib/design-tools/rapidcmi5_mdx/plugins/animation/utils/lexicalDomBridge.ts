import { LexicalEditor, $getRoot } from 'lexical';
import { debugBridge as debug } from './debug';

// Track which editors have been initialized to prevent duplicate setup
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const initializedEditors = new WeakSet<LexicalEditor>();

/**
 * Bridge between Lexical node keys and DOM elements
 * Since Lexical doesn't add data-lexical-key to rendered elements,
 * we need to manually map between them
 *
 * DEBUG: Enable logging via localStorage.setItem('DEBUG_ANIMATIONS', 'bridge')
 */

/**
 * Add unique animation IDs to DOM elements based on their Lexical node keys
 * This runs through the editor state and tags DOM elements
 */
export function addAnimationIdsToElements(editor: LexicalEditor): void {
  editor.getEditorState().read(() => {
    const root = $getRoot();
    const children = root.getChildren();

    debug.log('🔗 Bridging Lexical nodes to DOM elements...');
    let taggedCount = 0;

    // Get the editor's DOM root
    const editorElement = editor.getRootElement();
    if (!editorElement) {
      debug.warn('⚠️ No editor root element found');
      return;
    }

    // Get all direct child elements (paragraphs, headings, etc.)
    const domElements = Array.from(editorElement.children).filter(
      (el) => el instanceof HTMLElement,
    ) as HTMLElement[];

    debug.log(
      '📊 Found',
      children.length,
      'Lexical nodes and',
      domElements.length,
      'DOM elements',
    );

    // First, collect ALL node keys (including nested ones) for diagnostics
    const allNodeKeys = new Set<string>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function collectKeys(node: any): void {
      allNodeKeys.add(node.getKey());
      if (typeof node.getChildren === 'function') {
        node.getChildren().forEach(collectKeys);
      }
    }
    children.forEach(collectKeys);
    debug.log(
      `🗂️ Total node keys in editor (including nested): ${Array.from(allNodeKeys).join(', ')}`,
    );

    // Match Lexical nodes to DOM elements by position
    children.forEach((node, index) => {
      const domElement = domElements[index];
      if (!domElement) {
        debug.warn(
          `⚠️ No DOM element at index ${index} for node key ${node.getKey()}`,
        );
        return;
      }

      const nodeKey = node.getKey();
      const nodeType = node.getType();

      // Add our custom animation ID attribute
      domElement.setAttribute('data-animation-id', nodeKey);

      // For decorator nodes (images, videos, audio), also tag the actual media element
      if (['image', 'audio', 'video'].includes(nodeType.toLowerCase())) {
        // Find the actual img/video/audio element inside
        const mediaElement = domElement.querySelector('img, video, audio');
        if (mediaElement) {
          mediaElement.setAttribute('data-animation-id', nodeKey);
          debug.log(
            `🖼️ Tagged ${nodeType} media element:`,
            mediaElement.tagName,
          );
        }
      }

      // Also add it to any nested elements that might be the actual target
      const textContent = node.getTextContent();
      if (textContent && domElement.textContent?.includes(textContent)) {
        // Find the actual element with the text (might be nested)
        const walker = document.createTreeWalker(
          domElement,
          NodeFilter.SHOW_ELEMENT,
          null,
        );

        let currentNode: Node | null = walker.currentNode;
        while (currentNode) {
          if (currentNode instanceof HTMLElement) {
            currentNode.setAttribute('data-animation-id', nodeKey);
          }
          currentNode = walker.nextNode();
        }
      }

      taggedCount++;
      debug.log(
        `✅ Tagged element #${index}: ${nodeType} (key: ${nodeKey}) ->`,
        domElement.tagName,
      );
    });

    // SECOND PASS: Find any Lexical nodes that weren't matched by position
    // This handles decorator nodes (images, videos) that might not align with DOM structure
    debug.log(
      '🔍 Second pass: searching for untagged nodes (including nested)...',
    );
    const taggedKeys = new Set(
      Array.from(editorElement.querySelectorAll('[data-animation-id]'))
        .map((el) => el.getAttribute('data-animation-id'))
        .filter(Boolean),
    );

    // Collect ALL nodes (including nested) for second pass
    const allNodes: any[] = [];
    function collectAllNodes(node: any): void {
      allNodes.push(node);
      if (typeof node.getChildren === 'function') {
        node.getChildren().forEach(collectAllNodes);
      }
    }
    children.forEach(collectAllNodes);

    debug.log(`🔎 Checking ${allNodes.length} total nodes for missing tags...`);

    allNodes.forEach((node) => {
      const nodeKey = node.getKey();
      if (taggedKeys.has(nodeKey)) {
        return; // Already tagged
      }

      const nodeType = node.getType();

      // For image nodes, use the persistent id for direct matching (no fallback needed!)
      if (nodeType.toLowerCase() === 'image') {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const imageNode = node as any;
          if (typeof imageNode.getId === 'function') {
            const id = imageNode.getId();

            // Direct match by id - works with blob URLs!
            const imgElement = editorElement.querySelector(
              `img[data-image-id="${id}"]`,
            ) as HTMLElement | null;

            if (imgElement) {
              imgElement.setAttribute('data-animation-id', nodeKey);
              const parent = imgElement.parentElement;
              if (parent) {
                parent.setAttribute('data-animation-id', nodeKey);
              }
              debug.log(`✅ Tagged image ${id} -> ${nodeKey}`);
              taggedCount++;
              taggedKeys.add(nodeKey);
            }
          }
        } catch (error) {
          debug.error('Error tagging image:', error);
        }
      }

      // For video nodes, use the persistent videoId for direct matching (no fallback needed!)
      if (nodeType.toLowerCase() === 'video') {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const videoNode = node as any;
          if (typeof videoNode.getVideoId === 'function') {
            const videoId = videoNode.getVideoId();

            // Direct match by videoId - works with blob URLs!
            const videoElement = editorElement.querySelector(
              `video[data-video-id="${videoId}"]`,
            ) as HTMLElement | null;

            if (videoElement) {
              videoElement.setAttribute('data-animation-id', nodeKey);
              const parent = videoElement.parentElement;
              if (parent) {
                parent.setAttribute('data-animation-id', nodeKey);
              }
              debug.log(`✅ Tagged video ${videoId} -> ${nodeKey}`);
              taggedCount++;
              taggedKeys.add(nodeKey);
            }
          }
        } catch (error) {
          debug.error('Error tagging video:', error);
        }
      }

      // For audio nodes, use the persistent id for direct matching (no fallback needed!)
      if (nodeType.toLowerCase() === 'audio') {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const audioNode = node as any;
          if (typeof audioNode.getId === 'function') {
            const id = audioNode.getId();

            // Direct match by id - works with blob URLs!
            const audioElement = editorElement.querySelector(
              `audio[data-audio-id="${id}"]`,
            ) as HTMLElement | null;

            if (audioElement) {
              audioElement.setAttribute('data-animation-id', nodeKey);
              const parent = audioElement.parentElement;
              if (parent) {
                parent.setAttribute('data-animation-id', nodeKey);
              }
              debug.log(`✅ Tagged audio ${id} -> ${nodeKey}`);
              taggedCount++;
              taggedKeys.add(nodeKey);
            }
          }
        } catch (error) {
          debug.error('Error tagging audio:', error);
        }
      }
    });

    debug.log(
      `🎯 Tagged ${taggedCount} elements with animation IDs (after both passes)`,
    );
    debug.log(`📋 Tagged keys: ${Array.from(taggedKeys).join(', ')}`);
  });
}

/**
 * Find DOM element by Lexical node key using our custom animation ID
 */
export function findElementByNodeKey(
  nodeKey: string,
  editorElement: HTMLElement | null,
): HTMLElement | null {
  if (!editorElement) {
    debug.warn('⚠️ No editor element provided');
    return null;
  }

  // Find by our animation ID attribute
  const element = editorElement.querySelector<HTMLElement>(
    `[data-animation-id="${nodeKey}"]`,
  );

  if (element) {
    debug.log('✅ Found element by animation ID:', nodeKey, element);
  } else {
    debug.warn('❌ Could not find element with animation ID:', nodeKey);

    // Debug: show what IDs are available
    const allAnimated = editorElement.querySelectorAll('[data-animation-id]');
    debug.log(
      '📋 Available animation IDs:',
      Array.from(allAnimated).map((el) => el.getAttribute('data-animation-id')),
    );
  }

  return element;
}

/**
 * Initial setup for animation IDs
 * Only runs once per editor instance - subsequent calls are no-ops
 * Subsequent updates should call addAnimationIdsToElements manually
 * when animation directives are added/removed
 */
export function setupAnimationIdRefresh(editor: LexicalEditor): () => void {
  // Prevent duplicate initialization for the same editor instance
  if (initializedEditors.has(editor)) {
    debug.log('⏭️  Animation ID setup already initialized for this editor, skipping');
    return () => {}; // Return no-op cleanup
  }

  initializedEditors.add(editor);

  // Initial tagging
  setTimeout(() => addAnimationIdsToElements(editor), 100);

  debug.log('🔄 Set up initial animation ID tagging');

  // Return cleanup that removes from set
  return () => {
    debug.log('🧹 Cleanup animation ID setup');
    initializedEditors.delete(editor);
  };
}

/**
 * Get cleanup handler for removing orphaned animations
 * Call this function to get the current list of valid animation targets
 */
export function getOrphanedAnimationKeys(editor: LexicalEditor): Set<string> {
  const validKeys = new Set<string>();

  editor.getEditorState().read(() => {
    const editorElement = editor.getRootElement();
    if (!editorElement) return;

    // Get all elements with animation IDs
    const animatedElements = editorElement.querySelectorAll(
      '[data-animation-id]',
    );
    animatedElements.forEach((el) => {
      const key = el.getAttribute('data-animation-id');
      if (key) validKeys.add(key);
    });
  });

  return validKeys;
}
