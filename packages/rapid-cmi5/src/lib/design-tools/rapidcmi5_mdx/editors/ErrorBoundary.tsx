import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  /** Rendered instead of the default message when a child throws */
  fallback?: React.ReactNode;
  /** Changing this value clears the error and re-renders the children */
  resetKey?: unknown;
}

/**
 * ErrorBoundary prevents script error
 * renders a message instead
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  { hasError: boolean }
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  override componentDidCatch(error: any, info: any) {
    console.error('Editor crashed:', error, info);
  }

  override componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false });
    }
  }

  override render() {
    if (this.state.hasError) {
      return this.props.fallback ?? <div>Editor failed to load</div>;
    }

    return this.props.children;
  }
}
