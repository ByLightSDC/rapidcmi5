import { createMermaidCodeBlockDescriptor } from '@rapid-cmi5/ui';
import { MermaidEditDialog } from './MermaidEditDialog';

/**
 * Mermaid descriptor for the authoring editor only: adds the Edit button and
 * dialog. The player keeps using the display-only MermaidCodeBlockDescriptor.
 */
export const EditableMermaidCodeBlockDescriptor =
  createMermaidCodeBlockDescriptor({ EditDialog: MermaidEditDialog });
