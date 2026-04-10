import { Cell, ImagePreviewHandler, ImageUploadHandler } from "@mdxeditor/editor";

/**
 * Holds the image preview handler callback.
 * @group Image
 */
export const imagePreviewHandler$ = Cell<ImagePreviewHandler>(null);

/**
 * Holds the image upload handler callback.
 * @group Image
 */
export const imageUploadHandler$ = Cell<ImageUploadHandler>(null);
