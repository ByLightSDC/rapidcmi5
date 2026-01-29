/*
 *   Copyright (c) 2025 By Light Professional IT Services LLC
 *   All rights reserved.
 */

import {
  DirectiveDescriptor,
  NestedLexicalEditor,
  useCellValue,
  readOnly$,
  useLexicalNodeRemove,
  usePublisher,
  insertMarkdown$,
  $isFrontmatterNode,
} from '@mdxeditor/editor';
import { useEffect, useRef, useState, useCallback } from 'react';
import {
  $createParagraphNode,
  $createTextNode,
  $getNodeByKey,
  $getRoot,
} from 'lexical';
import YAML from 'yaml';
import type * as Mdast from 'mdast';
import { convertMdastToMarkdown } from '../util/conversion';

import type { ContainerDirective, TextDirective } from 'mdast-util-directive';
import type { MdxJsxTextElement } from 'mdast-util-mdx';
import {
  animDirectiveClickHandler$,
  slideAnimationsForDirectives$,
  animationToUnwrap$,
} from '../plugins/animation-directive';

// MUI components for Accordion-style icons
import { Box, IconButton, Stack, Tooltip } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { debugLog } from '@rapid-cmi5/ui';

/**
 * Animation Directive Descriptor
 *
 * Allows users to wrap content with animation directives
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
      return node.name === 'anim' && node.type === 'containerDirective';
    },
    attributes: ['id'],
    hasChildren: true,
    Editor: ({ mdastNode, lexicalNode, parentEditor }) => {
      const animId = mdastNode.attributes?.['id'] || 'unknown';
      const containerRef = useRef<HTMLDivElement>(null);
      const [isHovered, setIsHovered] = useState(false);
      const [isSelected, setIsSelected] = useState(false);
      const isReadOnly = useCellValue(readOnly$);

      // LayoutBox pattern hooks
      const removeNode = useLexicalNodeRemove();
      const insertMarkdown = usePublisher(insertMarkdown$);

      // NEW ARCHITECTURE: Read order directly from slideAnimations$ cell
      const allAnimations = useCellValue(slideAnimationsForDirectives$);
      const myAnimation = allAnimations.find((a) => a.directiveId === animId);
      const timelineOrder = myAnimation?.order ?? null;

      // Check if this is the last animation for this directive
      const remainingForDirective = allAnimations.filter(
        (a) => a.directiveId === animId,
      );
      const isLastAnimation = remainingForDirective.length === 1;

      // Get click handler from plugin parameters
      const clickHandler = useCellValue(animDirectiveClickHandler$);

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

      /**
       * UNWRAP DIRECTIVE FIRST, THEN UPDATE FRONTMATTER
       *
       * Order of operations:
       * 1. Unwrap the directive (preserving child content)
       * 2. THEN remove animation config from frontmatter
       *
       * This order is preferred because:
       * - Orphaned animconfig (directive gone, config remains) is safer than
       * - Orphaned directive (config gone, directive remains with broken reference)
       *
       * The animconfig removal happens after the unwrap completes, ensuring
       * the directive is fully removed before we clean up the metadata.
       */
      const handleRemoveAnimation = useCallback(async () => {
        const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

        // Extract ALL children as MDAST (not just first child)
        // Use convertMdastToMarkdown to handle MDX JSX elements (audio, video, etc.)
        const childMarkdown =
          mdastNode.children.length > 0
            ? mdastNode.children
                .map((child) =>
                  convertMdastToMarkdown(child as Mdast.RootContent),
                )
                .join('\n\n')
            : '';

        // Padding ensures the unwrapped block starts on its own line.
        const paddedChildMarkdown = childMarkdown
          ? `\n\n${childMarkdown.trim()}\n\n`
          : '';

        // === STEP 1: UNWRAP DIRECTIVE FIRST ===
        // Prepare for unwrap by inserting placeholder
        parentEditor.update(() => {
          const node = $getNodeByKey(lexicalNode.getKey());
          if (!node) {
            console.error(
              '❌ [AnimDirectiveDescriptor] Could not find directive node',
            );
            return;
          }
          const placeholder = $createParagraphNode();
          placeholder.append($createTextNode(''));
          node.insertBefore(placeholder);
          placeholder.select();
        });

        // Wait for cursor to settle
        await delay(500);

        // Insert the child markdown (with padding to avoid line merging)
        insertMarkdown(paddedChildMarkdown);

        // Remove the directive node
        removeNode();

        // === STEP 2: NOW UPDATE FRONTMATTER (after directive is gone) ===
        // Small delay to let the editor settle after unwrap
        await delay(100);

        parentEditor.update(() => {
          const root = $getRoot();
          const firstChild = root.getFirstChild();

          if (firstChild && $isFrontmatterNode(firstChild)) {
            const yamlString = firstChild.getYaml();

            try {
              const frontmatter = YAML.parse(yamlString) || {};
              const animations = frontmatter.animations || [];

              // Remove all animations that reference this directive
              const filteredAnimations = animations.filter(
                (anim: { directiveId?: string }) => anim.directiveId !== animId,
              );

              // Re-number the order property to close gaps (1, 2, 4, 5 -> 1, 2, 3, 4)
              const renumberedAnimations = filteredAnimations.map(
                (anim: { order?: number }, index: number) => ({
                  ...anim,
                  order: index + 1,
                }),
              );

              // Update frontmatter with filtered and renumbered animations
              if (renumberedAnimations.length > 0) {
                frontmatter.animations = renumberedAnimations;
              } else {
                // Remove animations key entirely if empty
                delete frontmatter.animations;
              }

              const newYaml = YAML.stringify(frontmatter);
              firstChild.setYaml(newYaml);
            } catch (e) {
              console.error(
                '❌ [AnimDirectiveDescriptor] Failed to parse/update frontmatter:',
                e,
              );
            }
          } else {
            console.warn(
              '⚠️ [AnimDirectiveDescriptor] No frontmatter node found',
            );
          }
        });
      }, [
        animId,
        isLastAnimation,
        mdastNode,
        parentEditor,
        lexicalNode,
        insertMarkdown,
        removeNode,
        myAnimation,
      ]);

      const handleIndicatorClick = useCallback(() => {
        if (clickHandler) {
          clickHandler(animId);
        }
      }, [animId, clickHandler]);

      // Watch for unwrap requests via cell
      const unwrapRequestedFor = useCellValue(animationToUnwrap$);

      useEffect(() => {
        // Skip if no unwrap is requested
        if (!unwrapRequestedFor) return;

        // Only trigger unwrap if this is OUR animation
        if (myAnimation && myAnimation.id === unwrapRequestedFor) {
          handleRemoveAnimation();
        }
      }, [unwrapRequestedFor, myAnimation, animId, handleRemoveAnimation]);

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
          data-anim-directive-id={animId}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Content with icons on the right - Accordion style */}
          <Stack direction="row" spacing={1}>
            {/* Order badge - PowerPoint-style numbered badge */}
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
                title={`Animation: ${animId}${timelineOrder ? ` (Order: ${timelineOrder})` : ''}\nClick to select`}
              >
                {timelineOrder ?? '?'}
              </div>
            )}

            {/* Nested content */}
            <Box sx={{ flex: 1 }}>
              <NestedLexicalEditor<ContainerDirective>
                block={true}
                getContent={(node) => node.children}
                getUpdatedMdastNode={(mdastNode, children: any) => ({
                  ...mdastNode,
                  children,
                })}
              />
            </Box>

            {/* Settings and Delete icons - matching Layout/Image style, 10px from badge */}
            {!isReadOnly && (isHovered || isSelected) && (
              <Box
                sx={{
                  backgroundColor: '#EEEEEEe6',
                  position: 'absolute',
                  left: '24px', // Badge at left:-10px + 24px width + 10px gap = 24px
                  top: '-10px', // Align with badge top
                  display: 'flex',
                  borderRadius: '4px',
                }}
              >
                <Tooltip title="Edit Animation Settings">
                  <IconButton
                    size="small"
                    onClick={() => {
                      // Open animation drawer/settings
                      if (clickHandler && myAnimation) {
                        clickHandler(animId);
                      }
                    }}
                  >
                    <SettingsIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip
                  title={
                    isLastAnimation
                      ? 'Clear Animation (unwrap content)'
                      : 'Remove Animation'
                  }
                >
                  <IconButton
                    size="small"
                    disabled={!isLastAnimation}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (isLastAnimation) {
                        handleRemoveAnimation();
                      }
                    }}
                    sx={{
                      opacity: isLastAnimation ? 1 : 0.3,
                    }}
                  >
                    <DeleteForeverIcon fontSize="small" color="primary" />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
          </Stack>
        </div>
      );
    },
  };

/**
 * Inline Animation Directive Descriptor
 *
 * Allows users to animate inline text spans within paragraphs.
 *
 * Example markdown:
 * ```markdown
 * This is a paragraph with :anim[animated text]{id="anim_1"} inline.
 * ```
 *
 * This descriptor:
 * - Uses textDirective (single colon) for inline wrapping
 * - Accepts an `id` attribute that links to frontmatter animation config
 * - Renders as inline-block span with visual indicator
 * - Shares same animation system as block animations
 */
export const InlineAnimDirectiveDescriptor: DirectiveDescriptor<TextDirective> =
  {
    name: 'anim',
    type: 'textDirective',
    testNode(node) {
      return node.name === 'anim' && node.type === 'textDirective';
    },
    attributes: ['id'],
    hasChildren: true,
    Editor: ({ mdastNode, lexicalNode, parentEditor }) => {
      const animId = mdastNode.attributes?.['id'] || 'unknown';
      const containerRef = useRef<HTMLSpanElement>(null);
      const [isHovered, setIsHovered] = useState(false);
      const [isSelected, setIsSelected] = useState(false);
      const isReadOnly = useCellValue(readOnly$);
      const clickHandler = useCellValue(animDirectiveClickHandler$);

      // LayoutBox pattern hooks
      const removeNode = useLexicalNodeRemove();
      const insertMarkdown = usePublisher(insertMarkdown$);

      // NEW ARCHITECTURE: Read order directly from slideAnimations$ cell (matching block descriptor)
      const allAnimations = useCellValue(slideAnimationsForDirectives$);
      const myAnimation = allAnimations.find((a) => a.directiveId === animId);
      const timelineOrder = myAnimation?.order ?? null;

      // Check if this is the last animation for this directive
      const remainingForDirective = allAnimations.filter(
        (a) => a.directiveId === animId,
      );
      const isLastAnimation = remainingForDirective.length === 1;

      // Add data attributes for animation targeting
      useEffect(() => {
        if (containerRef.current) {
          const nodeKey = lexicalNode.getKey();
          containerRef.current.setAttribute('data-anim-directive-id', animId);
          containerRef.current.setAttribute('data-animation-id', nodeKey);
          containerRef.current.setAttribute('data-lexical-key', nodeKey);
        }
      }, [animId, lexicalNode]);

      // Watch for selection changes
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
        const selected =
          element.getAttribute('data-animation-selected') === 'true';
        setIsSelected(selected);

        return () => observer.disconnect();
      }, [animId]);

      /**
       * UNWRAP DIRECTIVE FIRST, THEN UPDATE FRONTMATTER (Inline version)
       *
       * Order of operations:
       * 1. Unwrap the inline directive (preserving child content)
       * 2. THEN remove animation config from frontmatter
       *
       * This order is preferred because orphaned animconfig is safer than
       * orphaned directive with broken reference.
       */
      const handleRemoveAnimation = useCallback(async () => {
        const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

        debugLog(
          '🗑️ [InlineAnimDirectiveDescriptor] STARTING UNWRAP (directive first, then animconfig)',
          { animId, isLastAnimation },
          undefined,
          'wrap',
        );

        // For inline directives: convert children to markdown
        // Use convertMdastToMarkdown to handle MDX JSX elements (styled text, etc.)
        const childMarkdown = mdastNode.children
          .map((child) =>
            convertMdastToMarkdown(child as Mdast.PhrasingContent),
          )
          .join('');

        // Normalize whitespace/newlines coming from mdast -> markdown conversion.
        // Inline content should not introduce line breaks; collapse them to a
        // single space and trim.
        const normalizedInlineMarkdown = childMarkdown
          .replace(/\s*\n\s*/g, ' ')
          .replace(/\s{2,}/g, ' ')
          .trim();

        debugLog(
          '📝 [InlineAnimDirectiveDescriptor] Extracted inline markdown',
          { normalizedInlineMarkdown },
          undefined,
          'wrap',
        );

        // === STEP 1: UNWRAP DIRECTIVE FIRST ===
        // Prepare for unwrap by inserting placeholder
        parentEditor.update(() => {
          const node = $getNodeByKey(lexicalNode.getKey());
          if (!node) {
            console.error(
              '❌ [InlineAnimDirectiveDescriptor] Could not find directive node',
            );
            return;
          }
          const placeholder = $createTextNode('');
          node.insertBefore(placeholder);
          placeholder.select();
        });

        // Wait for cursor to settle
        await delay(500);

        // Insert the child markdown inline (no padding)
        insertMarkdown(normalizedInlineMarkdown);

        // Remove the directive node
        removeNode();

        debugLog(
          '✅ [InlineAnimDirectiveDescriptor] Directive unwrapped, now removing animconfig...',
          { animId },
          undefined,
          'wrap',
        );

        // === STEP 2: NOW UPDATE FRONTMATTER (after directive is gone) ===
        // Small delay to let the editor settle after unwrap
        await delay(100);

        parentEditor.update(() => {
          const root = $getRoot();
          const firstChild = root.getFirstChild();

          if (firstChild && $isFrontmatterNode(firstChild)) {
            const yamlString = firstChild.getYaml();
            debugLog(
              '📄 [InlineAnimDirectiveDescriptor] Current frontmatter YAML',
              { yamlLength: yamlString.length },
              undefined,
              'wrap',
            );

            try {
              const frontmatter = YAML.parse(yamlString) || {};
              const animations = frontmatter.animations || [];

              // Remove all animations that reference this directive
              const filteredAnimations = animations.filter(
                (anim: { directiveId?: string }) => anim.directiveId !== animId,
              );

              // Re-number the order property to close gaps (1, 2, 4, 5 -> 1, 2, 3, 4)
              const renumberedAnimations = filteredAnimations.map(
                (anim: { order?: number }, index: number) => ({
                  ...anim,
                  order: index + 1,
                }),
              );

              debugLog(
                '🔄 [InlineAnimDirectiveDescriptor] Filtering and renumbering animations',
                {
                  before: animations.length,
                  after: renumberedAnimations.length,
                  removedDirectiveId: animId,
                },
                undefined,
                'wrap',
              );

              // Update frontmatter with filtered and renumbered animations
              if (renumberedAnimations.length > 0) {
                frontmatter.animations = renumberedAnimations;
              } else {
                // Remove animations key entirely if empty
                delete frontmatter.animations;
              }

              const newYaml = YAML.stringify(frontmatter);
              firstChild.setYaml(newYaml);
              debugLog(
                '✅ [InlineAnimDirectiveDescriptor] Frontmatter animconfig removed',
                {},
                undefined,
                'wrap',
              );
            } catch (e) {
              console.error(
                '❌ [InlineAnimDirectiveDescriptor] Failed to parse/update frontmatter:',
                e,
              );
            }
          } else {
            console.warn(
              '⚠️ [InlineAnimDirectiveDescriptor] No frontmatter node found',
            );
          }
        });

        debugLog(
          '✅ [InlineAnimDirectiveDescriptor] UNWRAP + ANIMCONFIG REMOVAL COMPLETE',
          { animId },
          undefined,
          'wrap',
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [
        animId,
        isLastAnimation,
        mdastNode,
        parentEditor,
        lexicalNode,
        insertMarkdown,
        removeNode,
        myAnimation,
      ]);

      const handleIndicatorClick = useCallback(() => {
        debugLog(
          '🎯 [InlineAnimDirectiveDescriptor] Inline badge clicked - opening drawer/selecting',
          { animId },
          undefined,
          'wrap',
        );

        // Just open drawer or select - never delete from badge click
        if (clickHandler) {
          clickHandler(animId);
        }
      }, [animId, clickHandler]);

      // Watch for unwrap requests via cell (same as block descriptor)
      const unwrapRequestedFor = useCellValue(animationToUnwrap$);

      useEffect(() => {
        // Skip if no unwrap is requested
        if (!unwrapRequestedFor) return;

        debugLog(
          '🔔 [InlineAnimDirectiveDescriptor] Unwrap requested for animation',
          { unwrapRequestedFor, myAnimationId: myAnimation?.id, animId },
          undefined,
          'wrap',
        );

        // Only trigger unwrap if this is OUR animation
        if (myAnimation && myAnimation.id === unwrapRequestedFor) {
          debugLog(
            '✅ [InlineAnimDirectiveDescriptor] Unwrap matches our animation - triggering unwrap',
            { unwrapRequestedFor },
            undefined,
            'wrap',
          );
          handleRemoveAnimation();
        }
      }, [unwrapRequestedFor, myAnimation, animId, handleRemoveAnimation]);

      return (
        <span
          ref={containerRef}
          className="anim-directive-inline"
          style={{
            display: 'inline-block',
            position: 'relative',
            padding: '0',
            margin: '0',
            transition: 'all 0.2s ease',
          }}
          data-anim-id={animId}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Inline badge - smaller, positioned above text */}
          {!isReadOnly && (
            <div
              onClick={handleIndicatorClick}
              style={{
                position: 'absolute',
                top: '-12px',
                left: '-6px',
                minWidth: '18px',
                height: '18px',
                padding: '0 3px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '9px',
                fontWeight: 'bold',
                fontFamily:
                  '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                backgroundColor: isSelected ? '#f4b183' : '#d0d0d0',
                color: isSelected ? '#000' : '#666',
                border: '2px solid #fff',
                borderRadius: '2px',
                cursor: 'pointer',
                zIndex: isSelected ? 20 : 10,
                userSelect: 'none',
                boxShadow: isSelected
                  ? '0 2px 4px rgba(0, 0, 0, 0.3)'
                  : '0 1px 2px rgba(0, 0, 0, 0.2)',
                opacity: isHovered || isSelected ? 1 : 0.85,
                transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                transition: 'all 0.2s ease',
              }}
              title={`Animation: ${animId}${timelineOrder ? ` (Order: ${timelineOrder})` : ''}\nClick to open animation panel`}
            >
              {timelineOrder ?? '?'}
            </div>
          )}

          {/* Settings and Delete icons - compact for inline, 10px from badge */}
          {!isReadOnly && (isHovered || isSelected) && (
            <Box
              sx={{
                position: 'absolute',
                left: '20px', // Badge at left:-6px + 18px width + 8px gap ≈ 20px
                top: '-12px', // Align with badge top
                display: 'flex',
                backgroundColor: '#EEEEEEe6',
                borderRadius: '3px',
                zIndex: 100,
              }}
            >
              <Tooltip title="Edit Animation Settings">
                <IconButton
                  size="small"
                  onClick={() => {
                    if (clickHandler) {
                      clickHandler(animId);
                    }
                  }}
                  sx={{ padding: '2px' }}
                >
                  <SettingsIcon sx={{ fontSize: '14px' }} />
                </IconButton>
              </Tooltip>
              <Tooltip
                title={
                  isLastAnimation
                    ? 'Remove Animation (unwrap content)'
                    : 'Remove Animation'
                }
              >
                <IconButton
                  size="small"
                  disabled={!isLastAnimation}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (isLastAnimation) {
                      handleRemoveAnimation();
                    }
                  }}
                  sx={{
                    padding: '2px',
                    opacity: isLastAnimation ? 1 : 0.3,
                  }}
                >
                  <DeleteForeverIcon
                    sx={{ fontSize: '14px' }}
                    color="primary"
                  />
                </IconButton>
              </Tooltip>
            </Box>
          )}

          {/* Generic inline content rendering - handles ALL PhrasingContent types */}
          {/* Uses MdxJsxTextElement (like FxDirective) to prevent consuming entire line width */}
          <NestedLexicalEditor<MdxJsxTextElement | MdxJsxTextElement>
            getContent={(node) => node.children}
            getUpdatedMdastNode={(mdastNode, children: any) => ({
              ...mdastNode,
              children,
            })}
            block={false}
          />
        </span>
      );
    },
  };
