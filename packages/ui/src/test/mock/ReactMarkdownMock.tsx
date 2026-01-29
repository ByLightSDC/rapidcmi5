import { ReactNode } from 'react';

interface ChildrenProps {
  children: ReactNode;
}

/**
 * Mock for jest tests
 * Jest doesnt support react-markdown esm
 * So we created an empty mock
 * @param param0
 * @returns
 */
export function ReactMarkdownMock({ children }: ChildrenProps) {
  return <p>{children}</p>;
}

export default ReactMarkdownMock;
