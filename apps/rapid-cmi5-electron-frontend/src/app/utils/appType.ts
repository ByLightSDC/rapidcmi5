/*
  Eventually should be expanded to include all helper functions for 
  logic relating to electron vs web application.
  This could help to have a unified utility flow function when it matters
  what type of action is taken.
*/
export function detectIsElectron(): boolean {
  return typeof window !== 'undefined' && !!(window as any).fsApi;
}
