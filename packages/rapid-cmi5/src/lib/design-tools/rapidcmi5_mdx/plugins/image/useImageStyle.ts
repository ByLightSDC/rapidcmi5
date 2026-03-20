import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getNodeByKey } from 'lexical';
import { useEffect, useRef, useState } from 'react';
import { ImageNode } from './ImageNode';

/**
 *  This will allow Style Dialog to be called from the palette button. Effectively separated from ImageDialog.
 * In the future we could move this to a 'hooks' file.
 * @param nodeKey - The image node to be edited.
 * @returns An object containing the current style string and a setter function.
 */
export function useImageStyle(nodeKey: string) {
  const [editor] = useLexicalComposerContext();
  const isUserUpdate = useRef(false);

  const [imageStyle, setImageStyle] = useState<string>(() => {
    let initialStyle = '';
    editor.getEditorState().read(() => {
      const node = $getNodeByKey(nodeKey) as ImageNode | null;
      if (!node) return;
      const rest = node.getRest() ?? [];
      const styleAttr = rest.find((attr): attr is Extract<typeof attr, { name: string }> => 'name' in attr && attr.name === 'style');
      if (styleAttr) initialStyle = (styleAttr.value as string) ?? '';
    });
    return initialStyle;
  });

  // Wrap setImageStyle so we can distinguish user-triggered updates from initial state.
  const setImageStyleFromDialog = (style: string | ((prev: string) => string)) => {
    isUserUpdate.current = true;
    setImageStyle(style);
  };

  useEffect(() => {
    if (!imageStyle) return;
    if (!isUserUpdate.current) return;
    isUserUpdate.current = false;

    // Otherwise, update.
    editor.update(() => {
      const node = $getNodeByKey(nodeKey) as ImageNode | null;
      if (!node) return;

      // Attributes such as style and width exist in 'rest'.
      const rest = node.getRest() ?? [];

      // Update them with changes.
      const nextRest = [
        ...rest.filter((attr): attr is Extract<typeof attr, { name: string }> => !('name' in attr) || attr.name !== 'style'),
        {
          type: 'mdxJsxAttribute' as const,
          name: 'style',
          value: imageStyle,
        },
      ];
      // Set and render update.
      node.setRest(nextRest);
    });
  }, [imageStyle, editor, nodeKey]);

  return { imageStyle, setImageStyle: setImageStyleFromDialog };
}
