import { filterTreeHelper, filterCourseTreeHelper, filterTreePath } from './treeHelpers';
import { INode } from 'react-accessible-treeview';
import { IFlatMetadata } from 'react-accessible-treeview/dist/TreeView/utils';

const mockTree: INode<IFlatMetadata>[] = [
  {
    id: '/',
    name: '/',
    isBranch: true,
    parent: '',
    children: ['test', '.git', 'course2'],
  },
  {
    id: 'test',
    name: 'test',
    isBranch: true,
    parent: '/',
    children: ['test/RC5.yaml', 'test/another', 'test/introduction'],
  },
  {
    id: 'test/RC5.yaml',
    name: 'RC5.yaml',
    isBranch: false,
    parent: 'test',
    children: [],
  },
  {
    id: 'test/introduction',
    name: 'introduction',
    isBranch: false,
    parent: 'test',
    children: [],
  },
  {
    id: 'test/another',
    name: 'another',
    isBranch: true,
    parent: 'test',
    children: ['test/another/config.json'],
  },
  {
    id: 'test/another/config.json',
    name: 'config.json',
    isBranch: false,
    parent: 'test/another',
    children: [],
  },
  {
    id: 'course2',
    name: 'config.json',
    isBranch: true,
    parent: '/',
    children: [],
  },
  {
    id: 'course2/intro.md',
    name: 'intro.md',
    isBranch: false,
    parent: 'course2',
    children: [],
  },
  {
    id: '.git',
    name: '.git',
    isBranch: true,
    parent: '/',
    children: [],
  },
];

describe('filterTreeHelper', () => {
  it('filters out non-branches and non-.json files, and removes .git', () => {
    const result = filterTreeHelper(mockTree);

    const resultIds = result.map((n) => n.id);
    expect(resultIds).toContain('test');
    expect(resultIds).toContain('test/another');
    expect(resultIds).toContain('test/another/config.json');
    expect(resultIds).not.toContain('test/introduction'); // not .json and not a folder
    expect(resultIds).not.toContain('test/RC5.yaml'); // not .json and not a folder
    expect(resultIds).not.toContain('test/.git'); // excluded by name
  });

  it('preserves correct children relationships', () => {
    const result = filterTreeHelper(mockTree);
    const testNode = result.find((n) => n.id === 'test');
    expect(testNode).toBeDefined();
    expect(testNode!.children).toEqual(['test/another']); // only valid child kept
  });
});

describe('filterCourseTreeHelper', () => {
  it('returns only nodes that begin with the course path + parant', () => {
    const result = filterTreePath('test', mockTree);
    expect(result).toHaveLength(6);
  });
});
