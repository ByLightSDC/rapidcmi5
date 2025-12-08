//<span style="color:blue">Make this text blue.</span>

export type TextSelectionContext = {
  word?: string;
  cursorPos: number;
  text: string;
  start?: number;
  end?: number;
  before?: string;
  after?: string;
};

export enum FormatEnum {
  ColorSpan = 'Color Span',
}

export enum FormatEnumValues {
  Code = '```{0}\n{1}\n```',
  ColorSpan = '<span style="color:{1}">{0}</span>',
  Link = '[{0}]({1})',
  TextEffect = ':fx[{1}]{{0}}',
  Animation = ':animate[{1}]{{0}}',
  Button = ":button[{0}]{tag='{1}'}",
}

export enum HeaderEnum {
  H1 = '# ',
  H2 = '## ',
  H3 = '### ',
  H4 = '#### ',
  H5 = '##### ',
  H6 = '###### ',
}
export const headerOptions = Object.keys(HeaderEnum);

export enum ComplexObjects {
  OrderedList = 'Ordered List',
  BulletList = 'Bullet List',
}

/**
 * media things that get panels
 */
export enum MediaInsertEnum {
  Media = 'Media',
  Link = 'Link',
  Video = 'Video',
  Animation = 'Animation',
  TextEffects = 'TextEffects',
  Button = 'Button',
}

/**
 * html properties for markdown tags
 */
export enum MediaProperties {
  ImageAltText = 'ImageAltText',
  ImageUrl = 'ImageUrl',
  Href = 'Href',
  LinkText = 'LinkText',
  ButtonText = 'ButtonText',
  Tag = 'Tag',
}

export enum TextEffectProperties {
  TextEffectsType = 'TextEffectsType',
  TextEffectsColor = 'TextEffectsColor',
  TextEffectsStrokeWidth = 'TextEffectsStrokeWidth',
  TextEffectsDuration = 'TextEffectsDuration',
  TextEffectsIsAnimated = 'TextEffectsIsAnimated',
  TextEffectsIsAutoReveal = 'TextEffectsIsAutoReveal',
  TextEffectsDelay = 'TextEffectsDelay',
  TextEffectsTriggerTag = 'TextEffectsTriggerTag',
  TextEffectsTrigger = 'TextEffectsTrigger',
}

export enum AnimationProperties {
  AnimationType = 'AnimationType',
  AnimationTranslateX = 'AnimationTranslateX',
  AnimationTranslateY = 'AnimationTranslateY',
  AnimationDuration = 'AnimationDuration',
  AnimationRotate = 'AnimationRotate',
  AnimationScale = 'AnimationScale',
  AnimationSkew = 'AnimationSkew',
  AnimationOpacity = 'AnimationOpacity',
  AnimationDelay = 'AnimationDelay',
  AnimationTag = 'AnimationTag',
  AnimationTriggerTag = 'AnimationTriggerTag',
  AnimationTrigger = 'AnimationTrigger',
  AnimationEasing = 'AnimationEasing',
}

export enum TextInsertEnum {
  Code = 'Code Block',
  Media = 'Media',
  Link = 'Link',
  Video = 'Video',
  Paragraph = 'HTML  Paragraph',
  Break = 'HTML Break',
  Tab = 'Tab',
  Animation = 'Animation',
  TextEffects = 'Text FX',
  Button = 'Button',
}

export enum TextInsertValueEnum {
  Code = '```',
  Image = '![Alt Text](Image Url)',
  Paragraph = '\n\n',
  Break = '  \n',
  Tab = '    ',
  Video = 'Video',
  TextEffect = ":fx[Text FX]{type='circle' color='yellow'}",
  Animation = ":animate[Animation]{translateX='100' duration='3000'}",
}

export enum TextStyleEnum {
  Headers = 'Headers',
  Bold = 'Bold',
  Italic = 'Italic',
  StrikeThrough = 'Strike Through',
}

export enum TextStyleValueEnum {
  Bold = '**',
  Italic = '*',
  StrikeThrough = '~~',
}
export const textStyleOptions = Object.values(TextStyleValueEnum);

//REF https://react-syntax-highlighter.github.io/react-syntax-highlighter/AVAILABLE_LANGUAGES_HLJS.html
export enum CodeLanguagesEnum {
  c = 'c',
  csharp = 'csharp',
  html = 'html',
  django = 'django',
  go = 'go',
  java = 'java',
  javascript = 'javascript',
  json = 'json',
  markdown = 'markdown',
  mysql = 'mysql',
  powershell = 'powershell',
  python = 'python',
  xml = 'xml',
  yaml = 'yaml',
}

export const commonCodeOptions = Object.values(CodeLanguagesEnum);

export enum TextEffectsEnum {
  underline = 'underline',
  box = 'box',
  circle = 'circle',
  highlight = 'highlight',
  strikeThrough = 'strike-through',
  crossedOff = 'crossed-off',
  brackets = 'bracket',
}

export const textEffectOptions = Object.values(TextEffectsEnum);

export enum AnimationsEnum {
  move = 'move',
  fade = 'fade',
  scale = 'scale',
  rotate = 'rotate',
  skew = 'skew',
}

export const animationOptions = Object.values(AnimationsEnum);
