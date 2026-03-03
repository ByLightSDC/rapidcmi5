export enum AdmonitionTypeEnum {
  abstract = 'abstract',
  bug = 'bug',
  danger = 'danger',
  example = 'example',
  failure = 'failure',
  info = 'info',
  note = 'note',
  question = 'question',
  quote = 'quote',
  success = 'success',
  tip = 'tip',
  warning = 'warning',
}

export const admonitionLabels: string[] = Object.values(
  AdmonitionTypeEnum,
).sort((a, b) => a.localeCompare(b));
export const AdmonitionTypes: string[] = Object.keys(AdmonitionTypeEnum);
