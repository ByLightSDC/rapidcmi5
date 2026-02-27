import React from 'react';

/**
 * ErrorBoundary prevents script error
 * renders a message instead
 */
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  override componentDidCatch(error: any, info: any) {
    console.error('Editor crashed:', error, info);
  }

  override render() {
    if (this.state.hasError) {
      return <div>Editor failed to load</div>;
    }

    return this.props.children;
  }
}