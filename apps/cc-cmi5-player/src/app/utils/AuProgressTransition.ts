export interface AuProgressSnapshot {
  progress: number;
  completed: boolean;
  passed: boolean;
}

/**
 * AU completion/pass transitions are reportable even if rounded progress did
 * not change (for example, when repairing a legacy cache that already said
 * 100%).
 */
export function shouldReportAuProgress(
  previous: AuProgressSnapshot,
  current: AuProgressSnapshot,
): boolean {
  return (
    previous.progress !== current.progress ||
    previous.completed !== current.completed ||
    previous.passed !== current.passed
  );
}
