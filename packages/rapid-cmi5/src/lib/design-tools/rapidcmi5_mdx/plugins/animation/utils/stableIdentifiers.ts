import { $getNodeByKey, $getRoot, LexicalEditor, LexicalNode } from 'lexical';

import { findDirectiveNodeKeyById } from './directiveResolver';
import { debugLog, AnimationConfig } from '@rapid-cmi5/ui';

/**
 * Simple string hash function for generating content-based IDs
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16);
}

/**
 * Get a unique identifier for media nodes (images, videos, audio)
 * For images: use the persistent id (GUID)
 * For videos: use the persistent videoId (GUID)
 * For audio: use the persistent id (GUID)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getMediaIdentifier(node: any, nodeType: string): string {
  try {
    // For images, use the persistent GUID-based id
    if (
      nodeType.toLowerCase() === 'image' &&
      typeof node.getId === 'function'
    ) {
      const id = node.getId();
      debugLog(`🖼️ Using persistent id for stable ID: ${id}`);
      return id.substring(0, 8); // Use first 8 chars of GUID for stable ID
    }

    // For videos, use the persistent GUID-based videoId
    if (
      nodeType.toLowerCase() === 'video' &&
      typeof node.getVideoId === 'function'
    ) {
      const videoId = node.getVideoId();
      debugLog(`🎥 Using persistent videoId for stable ID: ${videoId}`);
      return videoId.substring(0, 8); // Use first 8 chars of GUID for stable ID
    }

    // For audio, use the persistent GUID-based id
    if (
      nodeType.toLowerCase() === 'audio' &&
      typeof node.getId === 'function'
    ) {
      const id = node.getId();
      debugLog(`🎵 Using persistent id for stable ID: ${id}`);
      return id.substring(0, 8); // Use first 8 chars of GUID for stable ID
    }

    // Fallback for media without GUID
    if (typeof node.getSrc === 'function') {
      const src = node.getSrc();
      const filename = src.split('/').pop() || src;
      return simpleHash(filename).substring(0, 4);
    }
  } catch (error) {
    console.warn('Could not get media identifier:', error);
  }
  return '0000'; // Default hash for media without identifier
}

/**
 * Generate a stable identifier for a Lexical node
 * Format: "nodeType:index:textHash"
 * Example: "heading:0:a3f2" or "paragraph:2:b7e1"
 */
export function generateStableId(
  editor: LexicalEditor,
  nodeKey: string,
): string | null {
  let stableId: string | null = null;

  editor.getEditorState().read(() => {
    try {
      const node = $getNodeByKey(nodeKey);
      if (!node) {
        console.warn('Cannot generate stable ID: node not found:', nodeKey);
        return;
      }

      const nodeType = node.getType();

      // SIMPLIFIED APPROACH FOR IMAGES: Use GUID directly, no tree searching needed!
      if (nodeType.toLowerCase() === 'image') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const imageNode = node as any;
        if (typeof imageNode.getId === 'function') {
          const id = imageNode.getId();
          const guidHash = id.substring(0, 8); // Use first 8 chars of GUID
          // Use index 0 for simplicity - the GUID makes it unique anyway
          stableId = `image:0:${guidHash}`;
          debugLog(`🖼️ Generated stable ID for image using GUID: ${stableId}`);
          return;
        } else {
          console.warn('Image node does not have getId method');
          return;
        }
      }

      // SIMPLIFIED APPROACH FOR VIDEOS: Use GUID directly, no tree searching needed!
      if (nodeType.toLowerCase() === 'video') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const videoNode = node as any;
        if (typeof videoNode.getVideoId === 'function') {
          const videoId = videoNode.getVideoId();
          const guidHash = videoId.substring(0, 8); // Use first 8 chars of GUID
          // Use index 0 for simplicity - the GUID makes it unique anyway
          stableId = `video:0:${guidHash}`;
          debugLog(`🎥 Generated stable ID for video using GUID: ${stableId}`);
          return;
        } else {
          console.warn('Video node does not have getVideoId method');
          return;
        }
      }

      // SIMPLIFIED APPROACH FOR AUDIO: Use GUID directly, no tree searching needed!
      if (nodeType.toLowerCase() === 'audio') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const audioNode = node as any;
        if (typeof audioNode.getId === 'function') {
          const id = audioNode.getId();
          const guidHash = id.substring(0, 8); // Use first 8 chars of GUID
          // Use index 0 for simplicity - the GUID makes it unique anyway
          stableId = `audio:0:${guidHash}`;
          debugLog(`🎵 Generated stable ID for audio using GUID: ${stableId}`);
          return;
        } else {
          console.warn('Audio node does not have getId method');
          return;
        }
      }

      // FOR OTHER NODES: Use the hierarchical approach (search root children)
      const root = $getRoot();
      const allChildren = root.getChildren();

      // Find the index of this node among its siblings of the same type
      let index = 0;
      let found = false;

      for (const child of allChildren) {
        if (child.getType() === nodeType) {
          if (child.getKey() === nodeKey) {
            found = true;
            break;
          }
          index++;
        }
      }

      if (!found) {
        console.warn(
          `Node not found in root children: ${nodeKey} (${nodeType})`,
        );
        return;
      }

      // Get a short hash based on content
      let contentHash: string;

      // For video/audio, use src hash (fallback for legacy media types)
      if (['video', 'audio'].includes(nodeType.toLowerCase())) {
        contentHash = getMediaIdentifier(node, nodeType);
        debugLog(`🎥 Using media identifier for ${nodeType}:`, contentHash);
      } else {
        // For text nodes, use text content
        const textContent = node.getTextContent();
        contentHash = simpleHash(textContent).substring(0, 4);
      }

      stableId = `${nodeType}:${index}:${contentHash}`;
      debugLog(
        `📌 Generated stable ID: ${stableId} for node ${nodeKey} (${nodeType})`,
      );
    } catch (error) {
      console.error('Error generating stable ID:', error);
    }
  });

  return stableId;
}

/**
 * Find a node by its stable ID
 * Returns the current runtime nodeKey for that element
 */
export function findNodeKeyByStableId(
  editor: LexicalEditor,
  stableId: string,
): string | null {
  let foundKey: string | null = null;

  editor.getEditorState().read(() => {
    try {
      const parts = stableId.split(':');
      if (parts.length !== 3) {
        console.warn('Invalid stable ID format:', stableId);
        return;
      }

      const [targetType, indexStr, expectedHash] = parts;
      const targetIndex = parseInt(indexStr, 10);

      // SIMPLIFIED APPROACH FOR IMAGES: Search by GUID, not by tree position!
      if (targetType.toLowerCase() === 'image') {
        // Recursively search ALL nodes to find image with matching GUID
        const root = $getRoot();
        const allNodes: any[] = [];

        function collectAllNodes(node: any): void {
          allNodes.push(node);
          if (typeof node.getChildren === 'function') {
            node.getChildren().forEach(collectAllNodes);
          }
        }

        root.getChildren().forEach(collectAllNodes);

        // Find image with matching GUID hash
        for (const node of allNodes) {
          if (node.getType() === 'image' && typeof node.getId === 'function') {
            const id = node.getId();
            const guidHash = id.substring(0, 8);

            if (guidHash === expectedHash) {
              foundKey = node.getKey();
              debugLog(
                `✅ Resolved image stable ID ${stableId} → node key ${foundKey} (GUID match)`,
              );
              return;
            }
          }
        }

        console.warn(
          `❌ Could not resolve image stable ID: ${stableId} (no matching GUID)`,
        );
        return;
      }

      // SIMPLIFIED APPROACH FOR VIDEOS: Search by GUID, not by tree position!
      if (targetType.toLowerCase() === 'video') {
        // Recursively search ALL nodes to find video with matching GUID
        const root = $getRoot();
        const allNodes: any[] = [];

        function collectAllNodes(node: any): void {
          allNodes.push(node);
          if (typeof node.getChildren === 'function') {
            node.getChildren().forEach(collectAllNodes);
          }
        }

        root.getChildren().forEach(collectAllNodes);

        // Find video with matching GUID hash
        for (const node of allNodes) {
          if (
            node.getType() === 'video' &&
            typeof node.getVideoId === 'function'
          ) {
            const videoId = node.getVideoId();
            const guidHash = videoId.substring(0, 8);

            if (guidHash === expectedHash) {
              foundKey = node.getKey();
              debugLog(
                `✅ Resolved video stable ID ${stableId} → node key ${foundKey} (GUID match)`,
              );
              return;
            }
          }
        }

        console.warn(
          `❌ Could not resolve video stable ID: ${stableId} (no matching GUID)`,
        );
        return;
      }

      // SIMPLIFIED APPROACH FOR AUDIO: Search by GUID, not by tree position!
      if (targetType.toLowerCase() === 'audio') {
        // Recursively search ALL nodes to find audio with matching GUID
        const root = $getRoot();
        const allNodes: any[] = [];

        function collectAllNodes(node: any): void {
          allNodes.push(node);
          if (typeof node.getChildren === 'function') {
            node.getChildren().forEach(collectAllNodes);
          }
        }

        root.getChildren().forEach(collectAllNodes);

        // Find audio with matching GUID hash
        for (const node of allNodes) {
          if (node.getType() === 'audio' && typeof node.getId === 'function') {
            const id = node.getId();
            const guidHash = id.substring(0, 8);

            if (guidHash === expectedHash) {
              foundKey = node.getKey();
              debugLog(
                `✅ Resolved audio stable ID ${stableId} → node key ${foundKey} (GUID match)`,
              );
              return;
            }
          }
        }

        console.warn(
          `❌ Could not resolve audio stable ID: ${stableId} (no matching GUID)`,
        );
        return;
      }

      // FOR OTHER NODES: Use the hierarchical approach (search root children)
      const root = $getRoot();
      const allChildren = root.getChildren();

      let currentIndex = 0;
      for (const child of allChildren) {
        if (child.getType() === targetType) {
          if (currentIndex === targetIndex) {
            // Found the right position, verify hash
            let actualHash: string;

            // For video/audio, use src hash
            if (['video', 'audio'].includes(targetType.toLowerCase())) {
              actualHash = getMediaIdentifier(child, targetType);
            } else {
              // For text nodes, use text content
              const textContent = child.getTextContent();
              actualHash = simpleHash(textContent).substring(0, 4);
            }

            if (actualHash === expectedHash) {
              foundKey = child.getKey();
              debugLog(
                `✅ Resolved stable ID ${stableId} → node key ${foundKey}`,
              );
            } else {
              console.warn(
                `⚠️ Hash mismatch for ${stableId}: expected ${expectedHash}, got ${actualHash}`,
              );
              // Still return the key, as position + type match
              foundKey = child.getKey();
            }
            break;
          }
          currentIndex++;
        }
      }

      if (!foundKey) {
        console.warn(`❌ Could not resolve stable ID: ${stableId}`);
      }
    } catch (error) {
      console.error('Error finding node by stable ID:', error);
    }
  });

  return foundKey;
}

/**
 * Resolve animations after loading from storage
 * Updates targetNodeKey to match current editor state
 */
export function resolveAnimations(
  editor: LexicalEditor,
  animations: AnimationConfig[],
): AnimationConfig[] {
  debugLog('🔄 Resolving animation IDs to current node keys...');

  return animations.map((anim) => {
    // PRIORITY 1: Try directive ID first (most reliable for V2 animations)
    if (anim.directiveId) {
      const currentKey = findDirectiveNodeKeyById(editor, anim.directiveId);
      if (currentKey) {
        debugLog(
          `✅ Resolved directive ID ${anim.directiveId} → node key ${currentKey}`,
        );
        return {
          ...anim,
          targetNodeKey: currentKey, // Update to current key
        };
      } else {
        console.warn(
          `Could not resolve directive ID ${anim.directiveId} for animation ${anim.id}`,
        );
      }
    }

    // No resolution possible, keep original key
    console.warn(
      `Animation ${anim.id} has no directiveId, keeping old key ${anim.targetNodeKey}`,
    );
    return anim;
  });
}
