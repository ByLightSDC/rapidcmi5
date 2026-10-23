import { ReactNode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { DevopsApiClient } from '@rangeos-nx/frontend/clients/devops-api';

import { ScenarioUpdatesContext } from '../ScenarioUpdatesContext';
import { useAutoGraderProgress } from './useAutoGraderProgress';

// The real module pulls in the GraphQL subscription stack; only the context is needed.
jest.mock('../ScenarioUpdatesContext', () => ({
  ScenarioUpdatesContext: jest.requireActual('react').createContext({}),
}));

jest.mock('@rangeos-nx/frontend/clients/devops-api', () => ({
  DevopsApiClient: { deployedAutoGradersList: jest.fn() },
}));

jest.mock('../../../session/cmi5', () => ({
  cmi5Instance: { getAuthToken: () => 'token' },
}));

jest.mock('../../../debug', () => ({
  logger: { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

jest.mock('@rapid-cmi5/ui', () => ({ debugLogError: jest.fn() }));

const listAutoGraders = DevopsApiClient.deployedAutoGradersList as jest.Mock;

const wrapper = ({ children }: { children: ReactNode }) => (
  <ScenarioUpdatesContext.Provider
    value={{ rangeId: 'range-1', scenarioId: 'scenario-1' } as any}
  >
    {children}
  </ScenarioUpdatesContext.Provider>
);

const renderProgress = () => {
  const submitScore = jest.fn();
  const view = renderHook(
    () =>
      useAutoGraderProgress({
        isAuthenticated: true,
        getActivityCache: jest.fn().mockResolvedValue(new Set()),
        submitScore,
        scenarioContent: { uuid: 'scenario-1' } as any,
      }),
    { wrapper },
  );
  return { ...view, submitScore };
};

describe('useAutoGraderProgress', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    listAutoGraders.mockReset();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const runRetries = async () => {
    // backoff between the three attempts: 1s, then 2s
    for (const ms of [1000, 2000]) {
      await act(async () => {
        await jest.advanceTimersByTimeAsync(ms);
      });
    }
  };

  it('auto-passes a scenario whose autograder list is genuinely empty', async () => {
    listAutoGraders.mockResolvedValue({ data: { data: [] } });

    const { result, submitScore } = renderProgress();

    await waitFor(() => expect(result.current.agsLoaded).toBe(true));
    expect(result.current.agsError).toBeNull();
    expect(submitScore).toHaveBeenCalledWith(
      expect.objectContaining({
        scoreData: expect.objectContaining({ allCompleted: true, totalTasks: 0 }),
      }),
    );
  });

  it('does not pass the scenario when the autograder fetch keeps failing', async () => {
    listAutoGraders.mockRejectedValue(new Error('401 token expired'));

    const { result, submitScore } = renderProgress();
    await runRetries();

    await waitFor(() => expect(result.current.agsError).not.toBeNull());
    expect(listAutoGraders).toHaveBeenCalledTimes(3);
    expect(result.current.agsLoaded).toBe(false);
    expect(submitScore).not.toHaveBeenCalled();
  });

  it('treats a response without a list as a failure, not an empty scenario', async () => {
    listAutoGraders.mockResolvedValue({ data: {} });

    const { result, submitScore } = renderProgress();
    await runRetries();

    await waitFor(() => expect(result.current.agsError).not.toBeNull());
    expect(submitScore).not.toHaveBeenCalled();
  });

  it('recovers when a retry succeeds', async () => {
    listAutoGraders
      .mockRejectedValueOnce(new Error('network blip'))
      .mockResolvedValue({ data: { data: [{ uuid: 'ag-1', name: 'Task 1' }] } });

    const { result, submitScore } = renderProgress();
    await runRetries();

    await waitFor(() => expect(result.current.agsLoaded).toBe(true));
    expect(result.current.autoGraders).toHaveLength(1);
    expect(result.current.agsError).toBeNull();
    // one autograder still to complete, so nothing is submitted yet
    expect(submitScore).not.toHaveBeenCalled();
  });

  it('retryAutoGraders fetches again after the error is shown', async () => {
    listAutoGraders.mockRejectedValue(new Error('down'));

    const { result, submitScore } = renderProgress();
    await runRetries();
    await waitFor(() => expect(result.current.agsError).not.toBeNull());

    listAutoGraders.mockResolvedValue({ data: { data: [] } });
    act(() => result.current.retryAutoGraders());

    await waitFor(() => expect(result.current.agsLoaded).toBe(true));
    expect(result.current.agsError).toBeNull();
    expect(submitScore).toHaveBeenCalledTimes(1);
  });
});
