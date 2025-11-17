import {
  $createDirectiveNode,
  insertDecoratorNode$,
  Signal,
  map,
} from '@mdxeditor/editor';

import { Directives } from 'mdast-util-directive';

/**
 * Inserts Activity Directive with children
 */
export const insertActivityDirective$ = Signal<{
  type: Directives['type'];
  name: string;
  attributes?: Directives['attributes'];
  children?: any[];
}>((r) => {
  r.link(
    r.pipe(
      insertActivityDirective$,
      map((payload) => {
        return () => {
          return $createDirectiveNode({
            children: [],
            ...payload,
          });
        };
      }),
    ),
    insertDecoratorNode$,
  );
});
