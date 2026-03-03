import Store from 'electron-store';

export interface RecentProjectEntry {
  id: string;
  lastAccessed: string;
}

interface StoreSchema {
  recentProjects: RecentProjectEntry[];
}

export const recentProjectsStore = new Store<StoreSchema>({
  defaults: {
    recentProjects: [],
  },
});

export function addRecentProject(id: string): void {
  const projects = recentProjectsStore.get('recentProjects');
  const entry: RecentProjectEntry = {
    id,
    lastAccessed: new Date().toISOString(),
  };
  const existingIndex = projects.findIndex((p) => p.id === id);
  const updated =
    existingIndex >= 0
      ? projects.map((p, i) => (i === existingIndex ? entry : p))
      : [...projects, entry];

  // Keep only the 10 most recently accessed projects
  const trimmed = updated
    .sort(
      (a, b) =>
        new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime(),
    )
    .slice(0, 10);

  recentProjectsStore.set('recentProjects', trimmed);
}

export function removeRecentProject(id: string): void {
  const updated = recentProjectsStore
    .get('recentProjects')
    .filter((p) => p.id !== id);
  recentProjectsStore.set('recentProjects', updated);
}
