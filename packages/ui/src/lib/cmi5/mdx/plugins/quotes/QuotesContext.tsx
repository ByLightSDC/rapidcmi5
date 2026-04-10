import { useCellValues } from '@mdxeditor/editor';
import React, { createContext, useCallback, useEffect, useState } from 'react';
import { imagePreviewHandler$ } from '../image/methods';


/**
 * Quotes context for sharing carousel state & resolved image path
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
    (newAvatar: string) => {
      setUnresolvedSource(newAvatar);

      if (imagePreviewHandler) {
        const callPreviewHandler = async () => {
          if (!initialImagePath) {
            setInitialImagePath(newAvatar);
          }
          if (newAvatar) {
            const updatedSrc = await imagePreviewHandler(newAvatar);
            setImageSource(updatedSrc);
          } else {
            setImageSource(undefined);
          }
        };
        callPreviewHandler().catch((e: unknown) => {
          console.error(e);
        });
      } else {
        setImageSource(newAvatar);
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
