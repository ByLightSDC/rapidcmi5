/**
 * design Mode when editing forms in Scenario Designer
 * preview Mode in Rapid CMI5 Editor
 * @enum FormCrudType
 */
export enum FormCrudType {
  create,
  delete,
  edit,
  design,
  view,
  preview,
}

/**
 * @typedef {Object} AppMenuConfigItem
 * @property {string} id Application id
 * @property {boolean} isVisible Whether app should be visible in ap menus
 * @property {string} description App description
 * @property { JSX.Element} icon App icon
 * @property {string} title App title
 * @property {string} url App Url
 */
export type AppMenuConfigItem = {
  id: string;
  isVisible: boolean;
  description: string;
  icon?: JSX.Element;
  iconUrl?: string;
  shouldIFrame?: boolean;
  title: string;
  url: string;
};
