/* eslint-disable @typescript-eslint/no-empty-function */
import App from './app';
import renderConnected from './utils/renderConnected';
import { act } from 'react';
import { screen } from '@testing-library/react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mockFetch(data: any) {
  return jest.fn().mockImplementation(() =>
    Promise.resolve({
      ok: true,
      json: () => data,
    }),
  );
}

class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

describe('App', () => {
  window.ResizeObserver = ResizeObserver;
  beforeEach(async () => {
    window.fetch = mockFetch({});
    await act(async () => {
      renderConnected(<App />, {});
    });
  });

  //we are not currently mocking cmi5 so there are no slides
  it('should render the form', () => {
    expect(screen.getByText('Loading...')).toBeTruthy();
  });
});
