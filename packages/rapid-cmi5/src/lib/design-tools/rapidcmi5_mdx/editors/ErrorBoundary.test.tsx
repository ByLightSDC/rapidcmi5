/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import TreeView, { INode } from 'react-accessible-treeview';
import { ErrorBoundary } from './ErrorBoundary';

// Mirrors LessonTree on a multi-block course: lesson ids are only unique
// within a block, so two lessons share id 0 and TreeView throws on render.
const duplicateIdTree: INode[] = [
  { id: 'course', name: 'Course', parent: null, children: [0, 1] },
  { id: 0, name: 'Block 1 lesson', parent: 'course', children: [] },
  { id: 0, name: 'Block 2 lesson', parent: 'course', children: [] },
];

const validTree: INode[] = [
  { id: 'course', name: 'Course', parent: null, children: [0] },
  { id: 0, name: 'Only lesson', parent: 'course', children: [] },
];

const renderTree = (data: INode[], resetKey: string) => (
  <ErrorBoundary resetKey={resetKey} fallback={<span>tree unavailable</span>}>
    <TreeView
      data={data}
      nodeRenderer={({ element, getNodeProps }) => (
        <div {...getNodeProps()}>{element.name}</div>
      )}
    />
  </ErrorBoundary>
);

describe('ErrorBoundary', () => {
  let consoleError: jest.SpyInstance;

  beforeEach(() => {
    consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleError.mockRestore();
  });

  it('renders the fallback instead of crashing on duplicate TreeView ids', () => {
    render(renderTree(duplicateIdTree, 'multi-block-course'));

    expect(screen.getByText('tree unavailable')).toBeTruthy();
    expect(screen.queryByText('Block 1 lesson')).toBeNull();
  });

  it('recovers when the resetKey changes, e.g. another course is picked', () => {
    const { rerender } = render(renderTree(duplicateIdTree, 'multi-block-course'));
    expect(screen.getByText('tree unavailable')).toBeTruthy();

    rerender(renderTree(validTree, 'single-block-course'));

    expect(screen.queryByText('tree unavailable')).toBeNull();
    expect(screen.getByText('Only lesson')).toBeTruthy();
  });

  it('keeps the default message when no fallback is given', () => {
    const Thrower = () => {
      throw new Error('boom');
    };
    render(
      <ErrorBoundary>
        <Thrower />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Editor failed to load')).toBeTruthy();
  });
});
