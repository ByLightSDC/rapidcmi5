import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  PASTE_COMMAND,
  COMMAND_PRIORITY_HIGH,
  $getSelection,
  $isRangeSelection,
} from 'lexical';
import { $insertDataTransferForRichText } from '@lexical/clipboard';

type SerializedNode = {
  type: string;
  mdastNode?: {
    name?: string;
    type?: string;
    children?: unknown[];
  };
  children?: SerializedNode[];
  [key: string]: unknown;
};

/**
 * Recursively unwrap :::anim directive nodes, replacing each with its children.
 * All other node types pass through unchanged.
 */
function stripAnimDirectives(nodes: SerializedNode[]): SerializedNode[] {
  const result: SerializedNode[] = [];
  for (const node of nodes) {
    if (node.type === 'directive' && node.mdastNode?.name === 'anim') {
      // Hoist the children of this directive into the parent level.
      // The directive's children are stored both in the Lexical children array
      // and mirrored in mdastNode.children — we only need the Lexical children.
      const inner = node.children ? stripAnimDirectives(node.children) : [];
      result.push(...inner);
    } else if (node.children && node.children.length > 0) {
      result.push({ ...node, children: stripAnimDirectives(node.children) });
    } else {
      result.push(node);
    }
  }
  return result;
}

/**
 * Returns a mutated DataTransfer-like object with anim directives stripped from
 * the application/x-lexical-editor payload, or null if nothing needed stripping.
 */
function buildCleanedDataTransfer(
  original: DataTransfer,
): DataTransfer | null {
  const lexicalJson = original.getData('application/x-lexical-editor');
  if (!lexicalJson) return null;

  let payload: { namespace: string; nodes: SerializedNode[] };
  try {
    payload = JSON.parse(lexicalJson);
  } catch {
    return null;
  }

  if (!Array.isArray(payload.nodes)) return null;

  const cleaned = stripAnimDirectives(payload.nodes);

  // If nothing changed (no anim directives were present), skip the override.
  if (cleaned.length === payload.nodes.length) {
    const originalStr = JSON.stringify(payload.nodes);
    const cleanedStr = JSON.stringify(cleaned);
    if (originalStr === cleanedStr) return null;
  }

  const cleanedJson = JSON.stringify({ ...payload, nodes: cleaned });

  // Wrap the original DataTransfer so we only override the one MIME type we changed.
  const proxy = {
    getData(type: string): string {
      if (type === 'application/x-lexical-editor') return cleanedJson;
      return original.getData(type);
    },
    files: original.files,
    items: original.items,
    types: original.types,
  } as unknown as DataTransfer;

  return proxy;
}

export function AnimationPastePlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      PASTE_COMMAND,
      (event) => {
        // PASTE_COMMAND payload is a ClipboardEvent | InputEvent | KeyboardEvent.
        // We only act when it's a real ClipboardEvent with a DataTransfer.
        if (!(event instanceof ClipboardEvent) || !event.clipboardData) {
          return false;
        }

        const cleaned = buildCleanedDataTransfer(event.clipboardData);
        if (!cleaned) {
          // No anim directives in the clipboard — let Lexical handle it normally.
          return false;
        }

        // We have a cleaned DataTransfer. Prevent the default paste and
        // re-run the Lexical rich-text insertion using our stripped payload.
        event.preventDefault();

        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            $insertDataTransferForRichText(cleaned, selection, editor);
          }
        });

        return true;
      },
      COMMAND_PRIORITY_HIGH,
    );
  }, [editor]);

  return null;
}
