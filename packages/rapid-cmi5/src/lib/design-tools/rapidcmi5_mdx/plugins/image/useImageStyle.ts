import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getNodeByKey } from 'lexical';
import { useEffect, useState } from 'react';

/**
 *  This will allow Style Dialog to be called from the palette button. Effectively separated from ImageDialog.
 * In the future we could move this to a 'hooks' file.
 * @param nodeKey - The image node to be edited.
 * @returns An object containing the current style string and a setter function.
 */
export function useImageStyle(nodeKey: string) {
  const [editor] = useLexicalComposerContext();
  const [imageStyle, setImageStyle] = useState<string>('');

  useEffect(() => {
    if (!imageStyle) return;

    // Otherwise, update.
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if (!node) return;

      // Attributes such as style and width exist in'rest'.
      if (
        'getRest' in node &&
        'setRest' in node &&
        typeof node.getRest === 'function' &&
        typeof node.setRest === 'function'
      ) {
        //Get the current set attributes.
        const rest = node.getRest() ?? [];

        // Update them with changes.
        const nextRest = [
          ...rest.filter((attr: any) => attr.name !== 'style'),
          {
            type: 'mdxJsxAttribute',
            name: 'style',
            value: imageStyle,
          },
        ];
        // Set and render update.
        node.setRest(nextRest);
      }
    });
  }, [imageStyle, editor, nodeKey]);

  return { imageStyle, setImageStyle };
}
