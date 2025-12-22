import { CourseAU, CourseData } from '@rapid-cmi5/cmi5-build-common';
import { INode } from 'react-accessible-treeview';
import { IFlatMetadata } from 'react-accessible-treeview/dist/TreeView/utils';

/**
 * Use this to return only nodes within a particular dir path
 */
export const filterTreePath = (
  filterPath: string,
  tree: INode<IFlatMetadata>[],
): INode<IFlatMetadata>[] => {
  const filteredTree = tree.filter((node) =>
    (node.id as string).startsWith(filterPath),
  );

  filteredTree.unshift({
    id: '/',
    name: 'root',
    children: [filterPath],
    parent: null,
  });
  return filteredTree;
};


// Currently unused, saved for later filtering enhancements

// Only return folders
export const filterTreeHelper = (
  tree: INode<IFlatMetadata>[],
): INode<IFlatMetadata>[] => {
  return tree
    .filter(
      (node) =>
        (node.isBranch || node.name.endsWith('.json')) && node.name !== '.git',
    )
    .map((node) => {
      const children = tree.filter((childNode) =>
        node.children.includes(childNode.id),
      );
      const childIds = filterTreeHelper(children || []).map(
        (childNode) => childNode.id,
      );

      return node.isBranch ? { ...node, children: childIds } : node;
    });
};


// sorts the au and returns only nodes within the au
export const auFilterCourseTreeHelper = (
  coursePath: string,
  tree: INode<IFlatMetadata>[],
  sorter: CourseAU,
): INode<IFlatMetadata>[] => {
  const nodeMap = Object.fromEntries(tree.map((node) => [node.id, node]));

  const newList: INode<IFlatMetadata>[] = [];

  const slideNodes: INode<IFlatMetadata>[] = sorter.slides
    .map((slide) => nodeMap[slide.filepath])
    .filter(Boolean)
    .map((node, i) => ({ ...node, name: sorter.slides[i].slideTitle }));

  const auNode: INode<IFlatMetadata> = {
    id: coursePath,
    name: sorter.auName,
    children: sorter.slides.map((slide) => slide.filepath),
    parent: '/',
  };

  const rootNode: INode<IFlatMetadata> = {
    id: '/',
    name: 'root',
    children: [coursePath],
    parent: null,
  };

  return [rootNode, auNode, ...slideNodes];
};

// sorts the course and returns only nodes within the course
export const courseFilterCourseTreeHelper = (
  coursePath: string,
  tree: INode<IFlatMetadata>[],
  sorter: CourseData,
): INode<IFlatMetadata>[] => {
  // we want to order the nodes based on what the course data says, lets first strip nodes which are not needded
  const nodeMap = Object.fromEntries(tree.map((node) => [node.id, node]));

  const auNodes: INode<IFlatMetadata>[] = [];
  const slideNodes: INode<IFlatMetadata>[] = [];

  for (const au of sorter.blocks[0].aus) {
    const currentSlides = au.slides
      .map((slide) => nodeMap[slide.filepath])
      .filter(Boolean)
      .map((node, i) => ({ ...node, name: au.slides[i].slideTitle }));

    slideNodes.push(...currentSlides);

    auNodes.push({
      id: au.dirPath,
      name: au.auName,
      children: au.slides.map((slide) => slide.filepath),
      parent: coursePath,
    });
  }

  const courseNode: INode<IFlatMetadata> = {
    id: coursePath,
    name: sorter.courseTitle,
    children: sorter.blocks[0].aus.map((au) => au.dirPath),
    parent: '/',
  };

  const rootNode: INode<IFlatMetadata> = {
    id: '/',
    name: 'root',
    children: [coursePath],
    parent: null,
  };

  return [rootNode, courseNode, ...auNodes, ...slideNodes];
};
