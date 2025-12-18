import fs from 'fs';
import { FolderStruct } from '@rapid-cmi5/cmi5-build/common';

export const getFolderStructureBackend = async (
  dir: string,
): Promise<FolderStruct[]> => {
  const childItems: FolderStruct[] = [];
  try {
    const items = await fs.promises.readdir(dir);

    for (const item of items) {
      const itemPath = `${dir}/${item}`;
      const stat = await fs.promises.stat(itemPath);
      const id = itemPath.split('/').slice(2).join('/');
      const node: FolderStruct = { id: id, name: item, isBranch: true };

      if (stat.isFile()) {
        node.isBranch = false;

        const content = await fs.promises.readFile(itemPath);
        node.content = content;
      } else if (stat.isDirectory()) {
        node.isBranch = true;

        node.children = await getFolderStructureBackend(itemPath);
      }

      childItems.push(node);
    }
  } catch (error) {
    console.error(`Error reading directory: ${dir}`, error);
  }

  return childItems;
};