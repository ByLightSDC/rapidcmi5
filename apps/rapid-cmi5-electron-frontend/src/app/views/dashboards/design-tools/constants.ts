import {
  featureFlagVisualizationSandbox,
  featureFlagMdXEditor,
} from '../../../utils/featureFlags';

export const featureName = 'Scenario';
export const noneFound = 'No design tools found.';

export const designToolCategories = [
  {
    id: 'design_scenario',
    name: 'Scenario',
    data: [
      {
        name: 'Scenario Designer',
        url: '/scenario_designer',
        tagline: 'Design Network & Traffic',
      },
    ],
  },
  {
    id: 'content',
    name: 'Content Generation',
    data: [
      {
        name: 'RapidCMI5',
        url: '/rapid_cmi5_mdx',
        hidden: !featureFlagMdXEditor,
        tagline: 'Publish CMI5 Courses',
      },
      {
        name: 'PCTE Standard Netspecs',
        url: '/PCTE_netspecs',
      },
      {
        name: 'Web Scrapes',
        url: '/web_scrapes',
        tagline: 'Generate Static Website Content',
      },
      {
        name: 'Scenario Netmap',
        url: '/scenario_netmap/test/test',
        hidden: !featureFlagVisualizationSandbox,
      },
    ],
  },
];
