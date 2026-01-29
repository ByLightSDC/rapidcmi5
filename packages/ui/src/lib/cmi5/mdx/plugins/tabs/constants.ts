import { TabContentDirectiveNode, TabDirectiveNode } from './types';

export const DEFAULT_TAB: TabContentDirectiveNode = {
  type: 'containerDirective',
  name: 'tabContent',
  attributes: { title: 'New Tab' },
  children: [
    {
      type: 'paragraph',
      children: [
        {
          type: 'text',
          value: 'New Tab Content',
        },
      ],
    },
  ],
};

/** The first line return is REQUIRED!!!! */
export const DEFAULT_TABS = `
:::tabContent{title="Tab 1 Title"}

Tab 1 Content Goes Here
:::

:::tabContent{title="Tab 2 Title"}

Tab 2 Content Goes Here
:::

:::tabContent{title="Tab 3 Title"}

Tab 3 Content Goes Here
:::`;
