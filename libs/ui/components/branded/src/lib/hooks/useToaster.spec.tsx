import { useToaster } from '@rapid-cmi5/ui/api/hooks';
import '@testing-library/jest-dom';
import {
  fireEvent,
  render,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import { NotificationsProvider } from '@toolpad/core';

const UseToasterHookWrapper = ({
  message,
  severity,
  autoHideDuration = 5000,
}: {
  message: string;
  severity?: 'error' | 'success' | 'warning' | 'info' | undefined;
  autoHideDuration?: number | undefined;
}) => {
  const displayToaster = useToaster();

  const onClick = () => {
    displayToaster({
      message: message,
      severity: severity,
      autoHideDuration: autoHideDuration,
    });
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'row' }}>
      <button onClick={onClick}>toaster</button>
    </div>
  );
};

xdescribe('useToaster hook', () => {
  it('should show success toaster', async () => {
    const { baseElement, getByText, findByRole } = render(
      <NotificationsProvider
        slotProps={{
          snackbar: {
            anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
          },
        }}
      >
        <UseToasterHookWrapper message="success message" severity="success" />
      </NotificationsProvider>,
    );

    expect(baseElement).toBeTruthy();

    const button = getByText('toaster');
    expect(button).toBeTruthy();
    fireEvent.click(button);
    const toaster = await findByRole('alert');
    expect(toaster).toHaveClass('SnackbarItem-variantSuccess');
    const message = getByText('success message');
    expect(message).toBeTruthy();
  });

  it('should show info toaster', async () => {
    const { baseElement, getByText, findByRole } = render(
      <NotificationsProvider
        slotProps={{
          snackbar: {
            anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
          },
        }}
      >
        <UseToasterHookWrapper message="info message" severity="info" />
      </NotificationsProvider>,
    );

    expect(baseElement).toBeTruthy();

    const button = getByText('toaster');
    expect(button).toBeTruthy();
    fireEvent.click(button);
    const toaster = await findByRole('alert');
    expect(toaster).toHaveClass('SnackbarItem-variantInfo');
    const message = getByText('info message');
    expect(message).toBeTruthy();
  });

  it('should show warning toaster', async () => {
    const { baseElement, getByText, findByRole } = render(
      <NotificationsProvider
        slotProps={{
          snackbar: {
            anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
          },
        }}
      >
        <UseToasterHookWrapper message="warning message" severity="warning" />
      </NotificationsProvider>,
    );

    expect(baseElement).toBeTruthy();

    const button = getByText('toaster');
    expect(button).toBeTruthy();
    fireEvent.click(button);
    const toaster = await findByRole('alert');
    expect(toaster).toHaveClass('SnackbarItem-variantWarning');
    const message = getByText('warning message');
    expect(message).toBeTruthy();
  });

  it('should show error toaster', async () => {
    const { baseElement, getByText, findByRole } = render(
      <NotificationsProvider
        slotProps={{
          snackbar: {
            anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
          },
        }}
      >
        <UseToasterHookWrapper message="error message" severity="error" />
      </NotificationsProvider>,
    );

    expect(baseElement).toBeTruthy();

    const button = getByText('toaster');
    expect(button).toBeTruthy();
    fireEvent.click(button);
    const toaster = await findByRole('alert');
    expect(toaster).toHaveClass('SnackbarItem-variantError');
    const message = getByText('error message');
    expect(message).toBeTruthy();
  });

  it('should close toaster on click', async () => {
    const { baseElement, getByText, findByRole } = render(
      <NotificationsProvider
        slotProps={{
          snackbar: {
            anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
          },
        }}
      >
        <UseToasterHookWrapper message="error message" severity="error" />
      </NotificationsProvider>,
    );

    expect(baseElement).toBeTruthy();

    const button = getByText('toaster');
    expect(button).toBeTruthy();
    fireEvent.click(button);
    const toaster = await findByRole('alert');
    fireEvent.click(toaster);
    await waitForElementToBeRemoved(toaster);
  });

  it('should render toaster at given anchor position', async () => {
    const { baseElement, getByText, findByRole, asFragment } = render(
      <NotificationsProvider
        slotProps={{
          snackbar: {
            anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
          },
        }}
      >
        <UseToasterHookWrapper message="error message" severity="error" />
      </NotificationsProvider>,
    );

    expect(baseElement).toBeTruthy();

    const button = getByText('toaster');
    expect(button).toBeTruthy();
    fireEvent.click(button);
    const toaster = await findByRole('alert');
    // since there is no actual painted element in a browser,
    // we can't verify the actual position
    // we will just snapshot the "rendered" fragment
    expect(asFragment()).toMatchSnapshot();
  });
});
