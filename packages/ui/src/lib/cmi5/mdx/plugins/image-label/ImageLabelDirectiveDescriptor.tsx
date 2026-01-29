import { DirectiveDescriptor } from '@mdxeditor/editor';



import { ImageLabelEditor } from './ImageLabelEditor';
import { ImageLabelDirectiveNode } from './types';

/**
 * Image Label directive 
 * Example markdown
 *  


<img width="591" height="330" alt="Bits, bytes, and binary code" id="20260113095917-49ccd098-778e-4db3-912e-13ea00e15c6f" src="./Assets/Images/Bits, bytes, and binary code.jpg" />

:::imageLabel{title="Step 2 &#xA;" imageId="20260113095917-49ccd098-778e-4db3-912e-13ea00e15c6f" x="431.796875" y="87.125"}
Pour more coffee
:::

:::imageLabel{title="Step 1&#xA;" imageId="20260113095917-49ccd098-778e-4db3-912e-13ea00e15c6f" x="252.796875" y="145.125"}
Pour coffee
:::

 * Uses the Directives plugin to import/export mdast
 * containerDirective because labels have content 
 * NestedLexicalEditor ContainerDirective because tabs can contain multiple blocks 
 */
export const ImageLabelDirectiveDescriptor: DirectiveDescriptor<ImageLabelDirectiveNode> = {
  name: 'imageLabel',
  type: 'containerDirective',
  testNode(node) {
    return node.name === 'imageLabel';
  },
  attributes: ['imageId', 'x', 'y', 'title'],
  hasChildren: true,
  Editor: ImageLabelEditor
};
