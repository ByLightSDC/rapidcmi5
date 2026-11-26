import React from 'react';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { GitDrawer } from './GitDrawer';
import { GitContext } from '../../course-builder/GitViewer/session/GitContext';

jest.mock('react-redux', () => ({
  useDispatch: () => jest.fn(),
  useSelector: (selector: (state: unknown) => unknown) =>
    selector({
      repoManager: {
        currentBranch: 'main',
        allBranches: ['main', 'feature/course'],
      },
      courseBuilder: { gitViewCurrentTab: 0 },
    }),
}));
jest.mock('../../course-builder/GitViewer/session/GitContext', () => ({
  GitContext: require('react').createContext({}),
}));

const theme = createTheme({ button: { iconColor: '#333' } } as any);

function renderDrawer(
  checkout: (branch: string) => Promise<void>,
  isInMerge = false,
) {
  return render(
    <ThemeProvider theme={theme}>
      <GitContext.Provider
        value={
          {
            handleCheckoutBranch: checkout,
            gettingRepoStatus: false,
            isGitLoaded: true,
            isInMerge,
          } as any
        }
      >
        <GitDrawer />
      </GitContext.Provider>
    </ThemeProvider>,
  );
}

describe('Version Control branch selector', () => {
  it('switches from the existing selector once and disables it while checkout runs', async () => {
    let finish!: () => void;
    const checkout = jest.fn(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    );
    renderDrawer(checkout);
    const input = screen.getByRole('combobox', { name: 'Branch' });
    expect(input).toHaveValue('main');
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    fireEvent.click(
      await screen.findByRole('option', { name: 'feature/course' }),
    );
    expect(checkout).toHaveBeenCalledTimes(1);
    expect(checkout).toHaveBeenCalledWith('feature/course');
    expect(input).toBeDisabled();
    finish();
    await waitFor(() => expect(input).not.toBeDisabled());
  });

  it('shows checkout errors and keeps the current branch selected', async () => {
    renderDrawer(
      jest.fn().mockRejectedValue(new Error('Commit or stash your changes.')),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    fireEvent.click(
      await screen.findByRole('option', { name: 'feature/course' }),
    );
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Commit or stash your changes.',
    );
    expect(screen.getByRole('combobox', { name: 'Branch' })).toHaveValue(
      'main',
    );
  });

  it('disables switching while a merge is in progress', () => {
    renderDrawer(jest.fn(), true);
    expect(screen.getByRole('combobox', { name: 'Branch' })).toBeDisabled();
  });
});
