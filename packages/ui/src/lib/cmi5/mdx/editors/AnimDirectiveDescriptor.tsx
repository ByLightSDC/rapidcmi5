/*
 *   Copyright (c) 2025 By Light Professional IT Services LLC
 *   All rights reserved.
 */

import {
  DirectiveDescriptor,
  NestedLexicalEditor,
  useCellValue,
  readOnly$,
} from '@mdxeditor/editor';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $createParagraphNode, $createTextNode, $getNodeByKey } from 'lexical';

import type { ContainerDirective } from 'mdast-util-directive';
import type { RootContent } from 'mdast';
import { animDirectiveClickHandler$ } from '../plugins/animation-directive';
import { debugLog } from '../../../utility/logger';

/**
 * Animation Directive Descriptor
 *
 * Phase 2: Allows users to wrap content with animation directives
 *
 * Example markdown:
 * ```markdown
 * ---
 * animations:
 *   - id: anim_fadeIn_1
 *     order: 1
 *     directiveId: anim_fadeIn_1
 *     entranceEffect: fadeIn
 *     trigger: onSlideOpen
 *     duration: 0.5
 *     delay: 0
 *     enabled: true
 * ---
 *
 * :::anim{id="anim_fadeIn_1"}
 * # This heading will fade in
 * :::
 *
 * :::anim{id="anim_slideIn_2"}
 * ![Image description](./image.png)
 * :::
 * ```
 *
 * This descriptor:
 * - Uses containerDirective (three colons) for block-level wrapping
 * - Accepts an `id` attribute that links to frontmatter animation config
 * - Renders content with a visual indicator showing animation order
 * - Allows nested MDX content (paragraphs, images, videos, even :fx directives)
 * - Clickable indicator opens animation panel
 */
export const AnimDirectiveDescriptor: DirectiveDescriptor<ContainerDirective> =
  {
    name: 'anim',
    type: 'containerDirective',
    testNode(node) {
      return node.name === 'anim';
    },
    attributes: ['id'],
    hasChildren: true,
    Editor: ({ mdastNode, lexicalNode }) => {
      const animId = mdastNode.attributes?.['id'] || 'unknown';
      const containerRef = useRef<HTMLDivElement>(null);
      const [isHovered, setIsHovered] = useState(false);
      const [isSelected, setIsSelected] = useState(false);
      // Prefer timeline order (data-animation-order) over document order
      const [timelineOrder, setTimelineOrder] = useState<number | null>(null);
      const [editor] = useLexicalComposerContext();
      const isReadOnly = useCellValue(readOnly$);

      // Log when animId changes
      useEffect(() => {
        debugLog(
          '📍 [AnimDirectiveDescriptor] animId updated:',
          {
            animId,
            mdastNodeAttributes: mdastNode.attributes,
            lexicalNodeKey: lexicalNode.getKey(),
          },
          undefined,
          'mdast',
        );
      }, [animId, mdastNode.attributes, lexicalNode]);

      // Registry no longer tracks doc-order. Timeline order comes from data-animation-order (app layer).

      // Get click handler from plugin parameters
      const clickHandler = useCellValue(animDirectiveClickHandler$);

      // Add data attributes for animation targeting
      useEffect(() => {
        if (containerRef.current) {
          const nodeKey = lexicalNode.getKey();
          containerRef.current.setAttribute('data-anim-directive-id', animId);
          containerRef.current.setAttribute('data-animation-id', nodeKey);
          containerRef.current.setAttribute('data-lexical-key', nodeKey);
        }
      }, [animId, lexicalNode]);

      // Watch for selection changes (data-animation-selected attribute)
      useEffect(() => {
        const element = containerRef.current;
        if (!element) return;

        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.attributeName === 'data-animation-selected') {
              const selected =
                element.getAttribute('data-animation-selected') === 'true';
              setIsSelected(selected);
            }
          });
        });

        observer.observe(element, { attributes: true });

        // Check initial state
        const selected =
          element.getAttribute('data-animation-selected') === 'true';
        setIsSelected(selected);

        return () => observer.disconnect();
      }, [animId]);

      // Watch for timeline order updates (data-animation-order is set by the app layer)
      useEffect(() => {
        const element = containerRef.current;
        if (!element) return;

        const readOrder = () => {
          const attr = element.getAttribute('data-animation-order');
          if (!attr) {
            setTimelineOrder(null);
            debugLog(
              '🔍 [AnimDirectiveDescriptor] data-animation-order not set',
              { animId },
              undefined,
              'mdast',
            );
            return;
          }
          const parsed = Number(attr);
          setTimelineOrder(Number.isFinite(parsed) ? parsed : null);
          debugLog(
            '🔢 [AnimDirectiveDescriptor] read data-animation-order',
            { animId, attr, parsed },
            undefined,
            'mdast',
          );
        };

        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.attributeName === 'data-animation-order') {
              readOrder();
            }
          });
        });

        observer.observe(element, { attributes: true });
        readOrder(); // initial read

        return () => observer.disconnect();
      }, [animId]);

      const handleIndicatorClick = useCallback(() => {
        debugLog('Animation indicator clicked:', animId, undefined, 'mdast');
        if (clickHandler) {
          clickHandler(animId);
        } else {
          debugLog(
            'No click handler registered for animation directive',
            undefined,
            undefined,
            'mdast',
          );
        }
      }, [animId, clickHandler]);

      const handleExitBlock = useCallback(() => {
        if (!editor) return;
        editor.update(() => {
          const node = $getNodeByKey(lexicalNode.getKey());
          if (!node) return;
          const parent = node.getParent();
          if (!parent) return;

          const newParagraph = $createParagraphNode();
          newParagraph.append($createTextNode(''));

          node.insertAfter(newParagraph);
          newParagraph.selectStart();
        });
      }, [editor, lexicalNode]);

      return (
        <div
          ref={containerRef}
          className="anim-directive-wrapper"
          style={{
            position: 'relative',
            padding: '0', // No padding - let content flow naturally
            margin: '0',
            border: 'none', // No border on container
            borderRadius: '0',
            backgroundColor: 'transparent', // No background
            transition: 'all 0.2s ease',
          }}
          data-anim-id={animId}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Order badge - PowerPoint-style numbered badge (matches CSS styles) */}
          {!isReadOnly && (
            <div
              onClick={handleIndicatorClick}
              style={{
                position: 'absolute',
                top: '-10px',
                left: '-10px',
                minWidth: '24px',
                height: '24px',
                padding: '0 4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: 'bold',
                fontFamily:
                  '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                // Selected state: PowerPoint orange badge
                backgroundColor: isSelected ? '#f4b183' : '#d0d0d0',
                color: isSelected ? '#000' : '#666',
                border: '2px solid #fff',
                borderRadius: '2px',
                cursor: 'pointer',
                zIndex: isSelected ? 20 : 10,
                userSelect: 'none',
                boxShadow: isSelected
                  ? '0 2px 6px rgba(0, 0, 0, 0.3)'
                  : '0 1px 3px rgba(0, 0, 0, 0.2)',
                opacity: isHovered || isSelected ? 1 : 0.85,
                transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                transition: 'all 0.2s ease',
              }}
              title={`Animation: ${animId}${timelineOrder ? ` (Order: ${timelineOrder})` : ''}\nClick to open animation panel`}
            >
              {timelineOrder ?? '?'}
            </div>
          )}

          {/* Inline chip to exit directive editing scope */}
          {!isReadOnly && isSelected && (
            <div
              onClick={handleExitBlock}
              style={{
                position: 'absolute',
                top: '-10px',
                right: '-10px',
                backgroundColor: '#eef2ff',
                color: '#333',
                border: '1px solid #cbd5e1',
                borderRadius: '12px',
                padding: '2px 8px',
                fontSize: '11px',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                userSelect: 'none',
              }}
              title="Exit animation block"
            >
              Exit anim
            </div>
          )}

          {/* Nested content */}
          <div>
            <NestedLexicalEditor<ContainerDirective>
              getContent={(node) => node.children}
              getUpdatedMdastNode={(mdastNode, children: RootContent[]) => ({
                ...mdastNode,
                children: children as ContainerDirective['children'],
              })}
            />
          </div>
        </div>
      );
    },
  };
