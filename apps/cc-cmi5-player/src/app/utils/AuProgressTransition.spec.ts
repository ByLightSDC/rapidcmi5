import { shouldReportAuProgress } from './AuProgressTransition';

describe('shouldReportAuProgress', () => {
  it('reports a final pass when restored numeric progress is already 100%', () => {
    expect(
      shouldReportAuProgress(
        { progress: 100, completed: false, passed: false },
        { progress: 100, completed: true, passed: true },
      ),
    ).toBe(true);
  });

  it('reports numeric progress changes', () => {
    expect(
      shouldReportAuProgress(
        { progress: 50, completed: false, passed: false },
        { progress: 75, completed: false, passed: false },
      ),
    ).toBe(true);
  });

  it('does not report unchanged progress', () => {
    expect(
      shouldReportAuProgress(
        { progress: 100, completed: true, passed: true },
        { progress: 100, completed: true, passed: true },
      ),
    ).toBe(false);
  });
});
