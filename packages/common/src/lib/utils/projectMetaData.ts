import { DirMeta } from '../types';

export const sortProjectMetas = (projectMetas: DirMeta[]) => {
  return projectMetas.sort((a, b) => {
    const aTime = new Date(a.lastAccessed ?? a.createdAt).getTime();
    const bTime = new Date(b.lastAccessed ?? b.createdAt).getTime();
    return bTime - aTime;
  });
};
