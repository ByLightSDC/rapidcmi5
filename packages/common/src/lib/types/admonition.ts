export enum AdmonitionTypeEnum {
  note = 'note',
  abstract = 'abstract',
  info = 'info',
  tip = 'tip',
  success = 'success',
  warning = 'warning',
  question = 'question',
  failure = 'failure',
  danger = 'danger',
  bug = 'bug',
  example = 'example',
  quote = 'quote',
}

export const admonitionLabels: string[] = Object.values(AdmonitionTypeEnum);
export const AdmonitionTypes: string[] = Object.keys(AdmonitionTypeEnum);
