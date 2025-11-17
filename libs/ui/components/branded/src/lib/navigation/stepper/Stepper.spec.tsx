import { render } from '@testing-library/react';

import StepperUi from './Stepper';

describe('Stepper', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <StepperUi steps={[]} completed={[]} disabled={[]} />,
    );
    expect(baseElement).toBeTruthy();
  });
});
