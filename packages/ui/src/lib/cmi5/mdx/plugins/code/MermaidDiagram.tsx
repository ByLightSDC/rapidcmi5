import { useEffect, useId, useRef, useState } from 'react';
import { Box, Typography, useTheme } from '@mui/material';

type MermaidApi = (typeof import('mermaid'))['default'];
type MermaidTheme = 'default' | 'dark';

let mermaidPromise: Promise<MermaidApi> | null = null;
let activeTheme: MermaidTheme | null = null;

/**
 * Lazily load mermaid so its (large) bundle is only fetched when a slide
 * actually contains a diagram.
 */
const loadMermaid = (): Promise<MermaidApi> => {
  if (!mermaidPromise) {
    mermaidPromise = import('mermaid').then(({ default: mermaid }) => mermaid);
  }
  return mermaidPromise;
};

/**
 * Mermaid config is global, so the theme can't be set per diagram from here.
 * Re-initialize only when the app's light/dark mode differs from the last
 * one applied; every visible diagram re-renders on a mode change anyway.
 * A diagram's own `%%{init: {theme: ...}}%%` directive still takes priority.
 */
const applyTheme = (mermaid: MermaidApi, theme: MermaidTheme) => {
  if (activeTheme === theme) return;
  mermaid.initialize({
    startOnLoad: false,
    // course content may be imported from outside sources; strict
    // sanitizes labels and disables click/callback directives
    securityLevel: 'strict',
    // we render our own error state instead of mermaid's "bomb" svg
    suppressErrorRendering: true,
    // default theme draws edges and message text in #333, which is
    // unreadable on the dark slide background
    theme,
  });
  activeTheme = theme;
};

/**
 * Check diagram source without rendering it.
 * Resolves to null when valid, otherwise mermaid's error message.
 * Shares the lazily loaded mermaid instance with MermaidDiagram.
 */
export const parseMermaid = async (code: string): Promise<string | null> => {
  const mermaid = await loadMermaid();
  try {
    await mermaid.parse(code.trim());
    return null;
  } catch (err: unknown) {
    return err instanceof Error ? err.message : String(err);
  }
};

type RenderState =
  | { status: 'loading' }
  | { status: 'rendered'; svg: string }
  | { status: 'error'; message: string };

/**
 * Renders mermaid diagram source as an SVG.
 *
 * Rendering waits until the element is visible: mermaid measures text while
 * laying out, so rendering inside a collapsed accordion / inactive tab
 * (display: none) produces clipped or overlapping labels.
 *
 * `data-mermaid-status` (loading | rendered | error) is exposed for e2e tests.
 */
export function MermaidDiagram({ code }: { code: string }) {
  // useId returns ':r0:' style ids — mermaid uses the id in css selectors
  const diagramId = `mermaid-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const containerRef = useRef<HTMLDivElement>(null);
  const theme: MermaidTheme =
    useTheme().palette.mode === 'dark' ? 'dark' : 'default';
  const [isVisible, setIsVisible] = useState(false);
  const [renderState, setRenderState] = useState<RenderState>({
    status: 'loading',
  });

  useEffect(() => {
    const el = containerRef.current;
    if (!el || isVisible) return;

    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setIsVisible(true);
        observer.disconnect();
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    let cancelled = false;
    loadMermaid()
      .then((mermaid) => {
        applyTheme(mermaid, theme);
        return mermaid.render(diagramId, code.trim());
      })
      .then(({ svg }) => {
        if (!cancelled) setRenderState({ status: 'rendered', svg });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setRenderState({
          status: 'error',
          message: err instanceof Error ? err.message : String(err),
        });
      });

    return () => {
      cancelled = true;
    };
  }, [code, diagramId, isVisible, theme]);

  if (renderState.status === 'error') {
    return (
      <Box
        ref={containerRef}
        data-testid="mermaid-diagram"
        data-mermaid-status="error"
        sx={{
          border: '1px solid',
          borderColor: 'error.main',
          borderRadius: 1,
          p: 2,
          my: 1,
        }}
      >
        <Typography variant="subtitle2" color="error">
          Unable to render diagram
        </Typography>
        <Typography
          variant="body2"
          component="pre"
          // monospace keeps mermaid's "^" error pointer aligned
          sx={{
            whiteSpace: 'pre-wrap',
            fontFamily: 'monospace',
            color: 'text.secondary',
            mt: 1,
          }}
        >
          {renderState.message}
        </Typography>
        <Box
          component="pre"
          sx={{
            whiteSpace: 'pre',
            overflowX: 'auto',
            fontFamily: 'monospace',
            fontSize: '0.85rem',
            bgcolor: 'action.hover',
            p: 1,
            mt: 1,
            mb: 0,
          }}
        >
          {code}
        </Box>
      </Box>
    );
  }

  return (
    <Box
      ref={containerRef}
      data-testid="mermaid-diagram"
      data-mermaid-status={renderState.status}
      sx={{
        display: 'flex',
        justifyContent: 'center',
        overflowX: 'auto',
        my: 1,
        minHeight: renderState.status === 'loading' ? '4rem' : undefined,
        '& svg': { maxWidth: '100%', height: 'auto' },
      }}
      {...(renderState.status === 'rendered'
        ? { dangerouslySetInnerHTML: { __html: renderState.svg } }
        : {})}
    />
  );
}
