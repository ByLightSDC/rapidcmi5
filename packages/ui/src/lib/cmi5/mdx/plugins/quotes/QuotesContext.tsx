import { useCellValues } from '@mdxeditor/editor';
//import { imagePreviewHandler$ } from 'packages/rapid-cmi5/src/lib/design-tools/rapidcmi5_mdx/plugins/image';
import React, { createContext, useCallback, useEffect, useState } from 'react';
import { imagePreviewHandler$ } from '../image/methods';
import { debugLog } from 'packages/ui/src/lib/utility/logger';

/**
 * Shape of the quotes context value shared across nested quote components.
 */
export interface IQuotesContext {
  /** Raw avatar path or URL from the mdast node attributes. */
  avatar?: string;
  /** Index of the currently active quote in the carousel. */
  carouselIndex: number;
  /** Active layout preset identifier. */
  preset: string;
  /** Resolved image URL for the avatar, ready for display. */
  imageSource?: string;
}

/**
 * Props for the QuotesContextProvider component.
 */
interface QuotesProviderProps {
  /** React elements that will consume the context. */
  children: React.ReactNode;
  /** Layout preset identifier. */
  preset: string;
  /** Raw avatar path or URL from the mdast node attributes. */
  avatar?: string;
  /** Index of the currently active quote (default: 0). */
  carouselIndex?: number;
}

/**
 * React Context for sharing quotes layout state across nested components.
 *
 * Provides shared access to:
 * - `avatar`: The resolved image source for the quote author avatar.
 * - `carouselIndex`: The currently active quote index.
 * - `preset`: The active layout preset identifier.
 * - `imageSource`: The resolved (preview-handled) image URL for the avatar.
 *
 * Initialized with a type assertion to satisfy the expected shape.
 * Must always be used within a corresponding `QuotesContextProvider`.
 */
export const QuotesContext = createContext<IQuotesContext>(
  {} as IQuotesContext,
);

/**
 * Provides quotes-related context to nested components within a quotes container.
 *
 * Resolves the avatar image source via `imagePreviewHandler` (if available) so
 * child components always receive a displayable URL regardless of the storage format.
 *
 * @param children - React elements that will consume the context
 * @param avatar - Raw avatar path or URL from the mdast node attributes
 * @param carouselIndex - Index of the currently active quote (default: 0)
 * @param preset - Layout preset identifier passed down from the container
 */
export function QuotesContextProvider({
  children,
  avatar,
  carouselIndex = 0,
  preset,
}: QuotesProviderProps) {
  const [imagePreviewHandler] = useCellValues(imagePreviewHandler$);
  const [initialImagePath, setInitialImagePath] = React.useState<
    string | null | undefined
  >(null);

  const [unresolvedSource, setUnresolvedSource] = useState<string | undefined>(
    avatar,
  );

  const [imageSource, setImageSource] = useState<string | undefined>(undefined);

  const resolveAvatarPath = useCallback(
    (avatar: string) => {
      setUnresolvedSource(avatar);
      if (imagePreviewHandler) {
        console.log('found resolution handler');
        const callPreviewHandler = async () => {
          if (!initialImagePath) {
            setInitialImagePath(avatar);
          }
          if (avatar) {
            const updatedSrc = await imagePreviewHandler(avatar);
            console.log('updatedSrc', updatedSrc);
            setImageSource(updatedSrc);
          } else {
            console.log('undefined updatedSrc');
            setImageSource(undefined);
          }
        };
        callPreviewHandler().catch((e: unknown) => {
          console.error(e);
        });
      } else {
         console.log('missing imagePreviewHandler');
        setImageSource(avatar);
      }
    },
    [
      setUnresolvedSource,
      setImageSource,
      imagePreviewHandler,
      initialImagePath,
    ],
  );

  /**
   * Resolves url => blob when avatar changes
   */
  useEffect(() => {
    console.log('Context updated avatar', avatar);
    if (avatar) {
      resolveAvatarPath(avatar);
    }
  }, [avatar]);

  return (
    <QuotesContext.Provider
      value={{
        carouselIndex,
        imageSource,
        avatar: unresolvedSource,
        preset,
      }}
    >
      {children}
    </QuotesContext.Provider>
  );
}
