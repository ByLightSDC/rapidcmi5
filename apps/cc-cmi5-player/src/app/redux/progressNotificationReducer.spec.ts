import reducer, {
  initialState,
  queueProgressToast,
  removeProgressToast,
} from './progressNotificationReducer';

describe('progressNotificationReducer', () => {
  it('preserves queued toasts in dispatch order', () => {
    const first = { message: 'First result' };
    const second = { message: 'Second result' };

    const withFirst = reducer(initialState, queueProgressToast(first));
    const withBoth = reducer(withFirst, queueProgressToast(second));

    expect(withBoth.toastQueue).toEqual([
      { id: 1, toast: first },
      { id: 2, toast: second },
    ]);
  });

  it('removes only the toast at the front of the queue', () => {
    const withFirst = reducer(
      initialState,
      queueProgressToast({ message: 'First result' }),
    );
    const withBoth = reducer(
      withFirst,
      queueProgressToast({ message: 'Second result' }),
    );

    expect(reducer(withBoth, removeProgressToast(2)).toastQueue).toHaveLength(
      2,
    );
    expect(reducer(withBoth, removeProgressToast(1)).toastQueue).toEqual([
      { id: 2, toast: { message: 'Second result' } },
    ]);
  });
});
