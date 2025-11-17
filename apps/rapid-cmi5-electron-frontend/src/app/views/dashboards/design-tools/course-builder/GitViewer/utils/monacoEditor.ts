export const getMonacoTheme = (muiTheme: string) => {
  if (muiTheme === 'light') {
    return 'light';
  }
  return 'vs-dark';
};
