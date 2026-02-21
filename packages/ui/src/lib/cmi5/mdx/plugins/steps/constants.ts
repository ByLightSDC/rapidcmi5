import { StepContentDirectiveNode, StepDirectiveNode } from './types';

export const DEFAULT_STEP: StepContentDirectiveNode = {
  type: 'containerDirective',
  name: 'stepContent',
  attributes: { title: 'New Step' },
  children: [
    {
      type: 'paragraph',
      children: [
        {
          type: 'text',
          value: 'New Step Content',
        },
      ],
    },
  ],
};

/** The first line return is REQUIRED!!!! */
export const DEFAULT_STEPS = `
:::stepContent{title="Step 1 Title"}

Step 1 Content Goes Here
:::

:::stepContent{title="Step 2 Title"}

Step 2 Content Goes Here
:::

:::stepContent{title="Step 3 Title"}

Step 3 Content Goes Here
:::`;
