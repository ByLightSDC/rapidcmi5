// KSAT (Knowledge, Skills, Abilities, and Tasks) Competency Framework Types

export interface KSATResponse {
  error: boolean;
  data: KSATCompetency[];
}

export interface KSATCompetency {
  shortname: string;
  idnumber: string;
  description: string;
  descriptionformat: number;
  sortorder: number;
  parentid: number;
  path: string;
  ruleoutcome: number;
  ruletype: string | null;
  ruleconfig: string | null;
  scaleid: number | null;
  scaleconfiguration: string | null;
  competencyframeworkid: number;
  id: number;
  timecreated: number;
  timemodified: number;
  usermodified: number;
}

export interface KSATSkill {
  id: number;
  shortname: string;
  idnumber: string;
  description: string;
  parentid: number;
  path: string;
  level: number; // Calculated from path depth
  competencyframeworkid: number;
  scaleid?: number;
  scaleconfiguration?: string;
  children?: KSATSkill[];
}

export interface KSATScale {
  id: number;
  name: string;
  description: string;
  levels: KSATScaleLevel[];
}

export interface KSATScaleLevel {
  id: number;
  name: string;
  description: string;
  proficient: boolean;
  default: boolean;
}

export interface KSATSkillTag {
  skillId: number;
  skillName: string;
  skillNumber: string;
  requiredLevel?: number;
  weight?: number; // For weighted skill requirements
}

export interface KSATActivitySkills {
  activityId: string;
  activityType: string;
  skills: KSATSkillTag[];
  completionCriteria: {
    minSkillsRequired?: number;
    allSkillsRequired?: boolean;
    weightedPassingScore?: number;
  };
}

// Helper types for UI components
export interface KSATSkillTreeNode {
  id: number;
  name: string;
  number: string;
  description: string;
  level: number;
  parentId: number;
  children: KSATSkillTreeNode[];
  isSelected: boolean;
  isExpanded: boolean;
}

export interface KSATSkillSelection {
  skillId: number;
  skillName: string;
  skillNumber: string;
  requiredLevel?: number;
  weight?: number;
}

// Utility functions
export const calculateSkillLevel = (path: string): number => {
  return path.split('/').filter((segment) => segment !== '').length - 1;
};

export const isTopLevelSkill = (competency: KSATCompetency): boolean => {
  return competency.parentid === 0;
};

export const isLeafSkill = (
  competency: KSATCompetency,
  allCompetencies: KSATCompetency[],
): boolean => {
  return !allCompetencies.some((c) => c.parentid === competency.id);
};

export const buildSkillTree = (
  competencies: KSATCompetency[],
): KSATSkillTreeNode[] => {
  const skillMap = new Map<number, KSATSkillTreeNode>();

  // Create all skill nodes
  competencies.forEach((comp) => {
    skillMap.set(comp.id, {
      id: comp.id,
      name: comp.shortname,
      number: comp.idnumber,
      description: comp.description,
      level: calculateSkillLevel(comp.path),
      parentId: comp.parentid,
      children: [],
      isSelected: false,
      isExpanded: false,
    });
  });

  // Build tree structure
  const rootNodes: KSATSkillTreeNode[] = [];

  skillMap.forEach((skill) => {
    if (skill.parentId === 0) {
      rootNodes.push(skill);
    } else {
      const parent = skillMap.get(skill.parentId);
      if (parent) {
        parent.children.push(skill);
      }
    }
  });

  return rootNodes;
};

export const flattenSkillTree = (
  tree: KSATSkillTreeNode[],
): KSATSkillTreeNode[] => {
  const result: KSATSkillTreeNode[] = [];

  const traverse = (nodes: KSATSkillTreeNode[]) => {
    nodes.forEach((node) => {
      result.push(node);
      if (node.children.length > 0) {
        traverse(node.children);
      }
    });
  };

  traverse(tree);
  return result;
};

export const searchSkills = (
  tree: KSATSkillTreeNode[],
  query: string,
): KSATSkillTreeNode[] => {
  const allSkills = flattenSkillTree(tree);
  const lowerQuery = query.toLowerCase();

  return allSkills.filter(
    (skill) =>
      skill.name.toLowerCase().includes(lowerQuery) ||
      skill.number.toLowerCase().includes(lowerQuery) ||
      skill.description.toLowerCase().includes(lowerQuery),
  );
};
