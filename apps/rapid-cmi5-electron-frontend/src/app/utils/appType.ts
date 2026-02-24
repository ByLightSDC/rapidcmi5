
export function detectIsElectron(): boolean {
  return typeof window !== 'undefined' && !!(window as any).fsApi;
}
