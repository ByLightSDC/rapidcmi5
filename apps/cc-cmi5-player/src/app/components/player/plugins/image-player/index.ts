import { ImagePlaceholder } from './ImagePlaceholder';
import {
  realmPlugin,
  addExportVisitor$,
  addImportVisitor$,
  addLexicalNode$,
} from '@mdxeditor/editor';
import { Cell } from '@mdxeditor/gurx';
import { ImageNode } from './ImageNode';
import { LexicalImageVisitor } from './LexicalImageVisitor';
import {
  MdastHtmlImageVisitor,
  MdastImageVisitor,
  MdastJsxImageVisitor,
} from './MdastImageVisitor';

/**
 * Holds the image preview handler callback.
 * @group ImagePlayer
 */
export const imagePreviewHandler$ = Cell<
  ((imageSource: string) => Promise<string>) | null
>(null);

/**
 * Holds the image placeholder.
 * @group ImagePlayer
 */
export const imagePlaceholder$ = Cell<typeof ImagePlaceholder | null>(null);

/**
 * A plugin that adds support for displaying images in play mode (read-only).
 * @group ImagePlayer
 */
export const imagePlayerPlugin = realmPlugin<{
  imagePreviewHandler?: (imageSource: string) => Promise<string>;
  imagePlaceholder?: () => JSX.Element | null;
}>({
  init(realm, params) {
    realm.pubIn({
      [addImportVisitor$]: [
        MdastImageVisitor,
        // MdastHtmlImageVisitor,
        MdastJsxImageVisitor,
      ],
      [addLexicalNode$]: ImageNode,
      [addExportVisitor$]: LexicalImageVisitor,
      [imagePreviewHandler$]: params?.imagePreviewHandler ?? null,
      [imagePlaceholder$]: params?.imagePlaceholder ?? ImagePlaceholder,
    });
  },

  update(realm, params) {
    realm.pubIn({
      [imagePreviewHandler$]: params?.imagePreviewHandler ?? null,
      [imagePlaceholder$]: params?.imagePlaceholder ?? ImagePlaceholder,
    });
  },
});
