import { SlideType, SlideTypeEnum } from '@rapid-cmi5/types/cmi5';

/**
 * @typedef {Object} ScenarioContentType
 * @property {string} introTitle
 * @property {string} introContent
 * @property {string} confirmStopButtonText Button Text that apears on confirmation button in dialog prompt
 * @property {string} [stopScenarioButtonTooltip] Tooltip text for stop icon
 * @property {string} [stopScenarioMessage] Prompt message for stop scenario confirmation
 * @property {string} [stopScenarioTitle] Prompt title message for stop scenario confirmation
 */
export type ScenarioContentType = {
  introTitle: string;
  introContent: string;
  confirmStopButtonText?: string;
  stopScenarioButtonTooltip?: string;
  stopScenarioMessage?: string;
  stopScenarioTitle?: string;
};

export interface ScenarioSlide extends SlideType {
  type: SlideTypeEnum;
  slideTitle: string;
  content: ScenarioContentType;
}
