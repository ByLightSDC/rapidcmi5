import { MdxJsxAttributeValueExpression } from 'mdast-util-mdx-jsx';

export const BROKEN_IMG_URI =
  'data:image/svg+xml;charset=utf-8,' +
  encodeURIComponent(/* xml */ `
    <svg id="imgLoadError" xmlns="http://www.w3.org/2000/svg" width="100" height="100">
      <rect x="0" y="0" width="100" height="100" fill="none" stroke="red" stroke-width="4" stroke-dasharray="4" />
      <text x="50" y="55" text-anchor="middle" font-size="20" fill="red">⚠️</text>
    </svg>
`);

// https://css-tricks.com/pre-caching-image-with-react-suspense/
export const imgCache = {
  __cache: {} as Record<string, string | Promise<void>>,
  read(src: string) {
    if (!this.__cache[src]) {
      this.__cache[src] = new Promise<void>((resolve) => {
        const img = new Image();

        img.onerror = () => {
          this.__cache[src] = BROKEN_IMG_URI;
          resolve();
        };

        img.onload = () => {
          this.__cache[src] = src;
          resolve();
        };

        img.src = src;
      });
    }

    if (this.__cache[src] instanceof Promise) {
      // eslint-disable-next-line @typescript-eslint/no-throw-literal, @typescript-eslint/only-throw-error
      throw this.__cache[src];
    }
    return this.__cache[src] as string;
  },
};

/**
 * Take a CSS string and return a React CSS properties object.
 * @param cssString
 */
export function parseCssString(
  cssString: string | MdxJsxAttributeValueExpression | null | undefined,
): React.CSSProperties {
  const style: React.CSSProperties = {};

  if (!cssString || typeof cssString !== 'string') {
    return style;
  }

  cssString.split(';').forEach((declaration) => {
    const parts = declaration.split(':').map((p) => p.trim());
    if (parts.length === 2) {
      const propName = parts[0];
      const propValue = parts[1];

      // convert kebab-case to camelCase for React's style prop
      const camelCasePropName = propName.replace(/-([a-z])/g, (g) =>
        g[1].toUpperCase(),
      );

      // TODO: this is very simple parsing. Is something more robust needed?
      (style as any)[camelCasePropName] = propValue;
    }
  });

  return style;
}
