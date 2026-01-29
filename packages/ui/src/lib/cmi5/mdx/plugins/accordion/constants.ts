import { AccordionContentDirectiveNode } from './types';

export const DEFAULT_ACCORDION: AccordionContentDirectiveNode = {
  type: 'containerDirective',
  name: 'accordionContent',
  attributes: { title: 'New Accordion' },
  children: [
    {
      type: 'paragraph',
      children: [
        {
          type: 'text',
          value: 'New Accordion Content',
        },
      ],
    },
  ],
};
