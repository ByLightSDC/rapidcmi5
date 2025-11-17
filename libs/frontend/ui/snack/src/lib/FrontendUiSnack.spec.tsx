import { Provider } from 'react-redux';

import { configureStore } from '@reduxjs/toolkit';
import { render } from '@testing-library/react';

import { FrontendUiSnack } from './FrontendUiSnack';
import { snackReducer } from './slice';

describe('FrontendUiSnack', () => {
  it('should render successfully', () => {
    const store = configureStore({
      reducer: { snack: snackReducer },
    });
    const { baseElement } = render(
      <Provider store={store}>
        <FrontendUiSnack />
      </Provider>,
    );
    expect(baseElement).toBeTruthy();
  });
});
