declare module '@mui/material/styles' {
  export interface Theme {
    accordion: {
      backgroundColor: React.CSSProperties['color'];
      borderBottom: React.CSSProperties['color'];
      borderColor: React.CSSProperties['color'];
      titleBackgroundColor: React.CSSProperties['color'];
    };
    breadcrumbs: {
      default: React.CSSProperties['color'];
      underline: React.CSSProperties['color'];
      hoverColor: React.CSSProperties['color'];
      hoverBackground: React.CSSProperties['color'];
    };
    button: {
      disabledBackgroundColor: React.CSSProperties['color'];
      disabledColor: React.CSSProperties['color'];
      minorBackgroundColor: React.CSSProperties['color'];
      indicatorColor: React.CSSProperties['color'];
    };
    card: {
      default: React.CSSProperties['color'];
      defaultHover: React.CSSProperties['color'];
      borderColor: React.CSSProperties['color'];
      formInstructionsColor: React.CSSProperties['color'];
      instructionsColor: React.CSSProperties['color'];
      titleColor: React.CSSProperties['color'];
    };
    form: {
      backgroundColor: React.CSSProperties['color'];
    };
    header: {
      border: React.CSSProperties['color'];
      buttonColor: React.CSSProperties['color'];
      selColor: React.CSSProperties['color'];
      default: React.CSSProperties['color'];
      dark: React.CSSProperties['color'];
      hoverColor: React.CSSProperties['color'];
      light: React.CSSProperties['color'];
      title: React.CSSProperties['color'];
      underline: React.CSSProperties['color'];
    };
    input: {
      outlineColor: React.CSSProperties['color'];
      fill: React.CSSProperties['color'];
      disabledFill: React.CSSProperties['color'];
      disabledOutlineColor: React.CSSProperties['color'];
    };
    nav: {
      fill: React.CSSProperties['color'];
      fillSelected: React.CSSProperties['color'];
      icon: React.CSSProperties['color'];
      iconSelected: React.CSSProperties['color'];
      border: React.CSSProperties['color'];
      borderSelected: React.CSSProperties['color'];
    };
  }
  export interface ThemeOptions {
    accordion: {
      backgroundColor: React.CSSProperties['color'];
      borderBottom: React.CSSProperties['color'];
      borderColor: React.CSSProperties['color'];
      titleBackgroundColor: React.CSSProperties['color'];
    };
    breadcrumbs: { default: React.CSSProperties['color'] };
    button: {
      disabledBackgroundColor: React.CSSProperties['color'];
      disabledColor: React.CSSProperties['color'];
      minorBackgroundColor: React.CSSProperties['color'];
    };
    card: {
      default: React.CSSProperties['color'];
      defaultHover: React.CSSProperties['color'];
      borderColor: React.CSSProperties['color'];
      formInstructionsColor: React.CSSProperties['color'];
      instructionsColor: React.CSSProperties['color'];
      titleColor: React.CSSProperties['color'];
    };
    header: {
      border: React.CSSProperties['color'];
      buttonColor: React.CSSProperties['color'];
      hoverColor: React.CSSProperties['color'];
      default: React.CSSProperties['color'];
      dark: React.CSSProperties['color'];
      light: React.CSSProperties['color'];
      title: React.CSSProperties['color'];
    };
    input: {
      outlineColor: React.CSSProperties['color'];
      fill: React.CSSProperties['color'];
      disabledFill: React.CSSProperties['color'];
      disabledOutlineColor: React.CSSProperties['color'];
    };
    nav: {
      fill: React.CSSProperties['color'];
      fillSelected: React.CSSProperties['color'];
      icon: React.CSSProperties['color'];
      iconSelected: React.CSSProperties['color'];
      border: React.CSSProperties['color'];
      borderSelected: React.CSSProperties['color'];
    };
  }
}

export type CustomTheme = Theme | ThemeOptions;
