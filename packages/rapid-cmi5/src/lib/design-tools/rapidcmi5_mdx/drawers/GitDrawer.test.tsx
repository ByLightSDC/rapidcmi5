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
  create = jest.fn().mockResolvedValue(undefined),
) {
  return render(
    <ThemeProvider theme={theme}>
      <GitContext.Provider
        value={
          {
            handleCheckoutBranch: checkout,
            handleCreateBranch: create,
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

  it('creates a branch from the selector add button and closes the dialog', async () => {
    let finish!: () => void;
    const create = jest.fn(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    );
    renderDrawer(jest.fn(), false, create);
    fireEvent.click(screen.getByRole('button', { name: 'Create Branch' }));
    expect(
      screen.getByRole('dialog', { name: 'Create Branch' }),
    ).toHaveTextContent('Create a branch from main');
    const input = screen.getByRole('textbox', { name: 'Branch Name' });
    fireEvent.change(input, { target: { value: 'feature/new-lesson' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create Branch' }));
    expect(create).toHaveBeenCalledWith('feature/new-lesson');
    expect(create).toHaveBeenCalledTimes(1);
    expect(input).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    finish();
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
  });

  it('rejects invalid and duplicate names and keeps creation errors in the dialog', async () => {
    const create = jest
      .fn()
      .mockRejectedValue(new Error('Commit or stash your changes.'));
    renderDrawer(jest.fn(), false, create);
    fireEvent.click(screen.getByRole('button', { name: 'Create Branch' }));
    const input = screen.getByRole('textbox', { name: 'Branch Name' });
    const submit = screen.getByRole('button', { name: 'Create Branch' });
    expect(submit).toBeDisabled();
    for (const name of ['main', 'bad..name', 'feature/course']) {
      fireEvent.change(input, { target: { value: name } });
      expect(submit).toBeDisabled();
    }
    expect(create).not.toHaveBeenCalled();
    fireEvent.change(input, { target: { value: 'feature/valid' } });
    fireEvent.click(submit);
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Commit or stash your changes.',
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
  });

  it('disables switching while a merge is in progress', () => {
    renderDrawer(jest.fn(), true);
    expect(screen.getByRole('combobox', { name: 'Branch' })).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Create Branch' }),
    ).toBeDisabled();
  });
});
