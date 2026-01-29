import { configureStore } from '@reduxjs/toolkit';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';

import { FrontendEnvironment } from './FrontendEnvironment';
import { environmentReducer } from './FrontendEnvironment.slice';

describe('FrontendApiEnvironment', () => {
  it('should render successfully', () => {
    const store = configureStore({
      reducer: { environment: environmentReducer },
    });
    const { baseElement } = render(
      <Provider store={store}>
        <FrontendEnvironment />
      </Provider>,
    );
    expect(baseElement).toBeTruthy();
  });
});
