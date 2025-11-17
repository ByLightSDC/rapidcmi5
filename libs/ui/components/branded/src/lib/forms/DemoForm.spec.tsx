import '@testing-library/jest-dom/extend-expect';
import { fireEvent, render, screen } from '@testing-library/react';
import { act } from 'react';
import { brandedTheme } from '../styles/muiTheme';
import { DemoForm } from './DemoForm';
import { ThemeProvider } from '@mui/material';
import { renderBrandedConnected } from './renderBrandedConnected';
const removeIconButtonArialLabel = 'Delete Item From Array';

describe('DemoForm', () => {
  it('should render form fields successfully', async () => {
    // array fields causing re-render as this is all loading
    // wrapping the render in "act" prevents the following console warning
    //
    // console.error
    // Warning: An update to DemoForm inside a test was not wrapped in act(...).

    // When testing, code that causes React state updates should be wrapped into act(...):
    await act(async () => {
      renderBrandedConnected(<DemoForm editable={true} />, {});
    });
    // IP Fields
    expect(screen.getByTestId('ipAddress_version')).toBeTruthy();
    expect(screen.getByTestId('ipAddress')).toBeTruthy();
    // Integer Fields
    expect(screen.getByTestId('demoPositiveInt')).toBeTruthy();
    expect(screen.getByTestId('demoInteger')).toBeTruthy();
    // Array Field
    expect(screen.getByText(/List With Custom Renderer/i)).toBeTruthy();
    expect(screen.getByTestId('demoArray[0].field1')).toBeTruthy();
    expect(screen.getByTestId('demoArray[0].field2')).toBeTruthy();
    // Array List Field
    expect(screen.getByText(/List of Strings/i)).toBeTruthy();
    expect(screen.getByTestId('demoList[0]')).toBeTruthy();
    expect(screen.getByTestId('demoList[1]')).toBeTruthy();
  });

  it('should require valid IPv4 Address', async () => {
    const targetFieldTestId = 'field-ipAddress';

    const { queryByText, getByLabelText, getByText } = renderBrandedConnected(
      <DemoForm editable={true} />,
      {},
    );

    const targetField = screen.getByTestId(targetFieldTestId);
    expect(targetField).toBeTruthy();
    expect(getByLabelText('Required IPv4 Address')).toBeTruthy();

    // Verify IP Address Field cannot be empty
    await act(async () => {
      fireEvent.change(targetField, {
        target: { value: '' },
      });

      fireEvent.focusOut(targetField);
    });

    expect(getByText('IP address is required')).toBeTruthy();

    // Verify Bad Format
    await act(async () => {
      fireEvent.change(targetField, {
        target: { value: '10.10.10.300' },
      });
    });

    expect(getByText('Invalid IPv4 address')).toBeTruthy();

    //Verify Disabled Button
    // const disabledSubmitButton = screen.getByTestId('submit-button');
    // expect(disabledSubmitButton).toHaveAttribute('disabled');

    //Verify Submittable
    await act(async () => {
      fireEvent.change(targetField, {
        target: { value: '10.10.10.10/24' },
      });
    });

    expect(queryByText('Invalid IPv4 address')).toBeNull();
    const submitButton = screen.getByTestId('submit-button');
    expect(submitButton).not.toHaveAttribute('disabled');
  });

  it('should require valid IPv6 Address', async () => {
    const targetFieldTestId = 'field-ipAddressAlt';

    const { queryByText, getByLabelText, getByText } = renderBrandedConnected(
      <DemoForm editable={true} />,
      {},
    );

    const targetField = screen.getByTestId(targetFieldTestId);
    expect(targetField).toBeTruthy();
    expect(getByLabelText('Required IPv6 Address')).toBeTruthy();

    // Verify IP Address Field cannot be empty
    await act(async () => {
      fireEvent.change(targetField, {
        target: { value: '' },
      });

      fireEvent.focusOut(targetField);
    });

    expect(getByText('IP address is required')).toBeTruthy();

    // Verify Bad Format
    await act(async () => {
      fireEvent.change(targetField, {
        target: { value: 'AAAA:BBBB::CCCC:DDDD::EEEE' },
      });
    });

    expect(getByText('Invalid IPv6 address')).toBeTruthy();

    //Verify Disabled Button
    // const disabledSubmitButton = screen.getByTestId('submit-button');
    // expect(disabledSubmitButton).toHaveAttribute('disabled');

    //Verify Submittable
    await act(async () => {
      fireEvent.change(targetField, {
        target: { value: 'AAAA:BBBB:CCCC:DDDD:EEEE:FFFF:1111:2222/24' },
      });
    });

    expect(queryByText('Invalid IPv6 address')).toBeNull();
    const submitButton = screen.getByTestId('submit-button');
    expect(submitButton).not.toHaveAttribute('disabled');
  });

  it('should allow collapse/expand of form area', async () => {
    const targetFieldTestId = 'field-ipAddress';
    await act(async () => {
      renderBrandedConnected(<DemoForm editable={true} />, {});
    });

    //TODO?? will there now be multiple when I also have the array fields one?
    const expansionIcon = screen.getByTestId('view-expand');
    expect(expansionIcon).toBeTruthy();

    expect(screen.getByTestId(targetFieldTestId)).toBeTruthy();

    // collapse area
    await act(async () => {
      fireEvent.click(expansionIcon);
    });

    const ipField = screen.queryByTestId(targetFieldTestId);
    expect(ipField).toBeNull(); // it doesn't exist

    // expand area
    const collapsedIcon = screen.getByTestId('view-expand');
    expect(collapsedIcon).toBeTruthy();
    await act(async () => {
      fireEvent.click(collapsedIcon);
    });

    expect(screen.getByTestId(targetFieldTestId)).toBeTruthy();
  });

  it('should require valid Positive Integer Field Value', async () => {
    const targetFieldTestId = 'field-demoPositiveInt';

    const { queryByText, getByLabelText, getByText } = renderBrandedConnected(
      <DemoForm editable={true} />,
      {},
    );

    const targetField = screen.getByTestId(targetFieldTestId);
    expect(targetField).toBeTruthy();
    expect(getByLabelText('Positive Integer')).toBeTruthy();

    // Verify Bad Formats
    await act(async () => {
      fireEvent.change(targetField, {
        target: { value: 'a' },
      });
    });

    // expect value not to be empty non-numberic char typed in
    expect((targetField as HTMLInputElement).value).toEqual('');

    await act(async () => {
      fireEvent.change(targetField, {
        target: { value: '-5' },
      });
    });

    expect(getByText('Must be a positive integer')).toBeTruthy();

    //Verify Disabled Button
    // submitButton = screen.getByTestId('submit-button');
    // expect(submitButton).toHaveAttribute('disabled');

    //Verify Submittable
    await act(async () => {
      fireEvent.change(targetField, {
        target: { value: '24' },
      });
    });

    let submitButton = screen.getByTestId('submit-button');
    expect(submitButton).not.toHaveAttribute('disabled');
  });

  it('should require valid Integer Field Value', async () => {
    const targetFieldTestId = 'field-demoInteger';

    const { queryByText, getByLabelText, getByText } = renderBrandedConnected(
      <DemoForm editable={true} />,
      {},
    );

    const targetField = screen.getByTestId(targetFieldTestId);
    expect(targetField).toBeTruthy();
    expect(getByLabelText('Any Integer')).toBeTruthy();

    // Verify Integer Field cannot be empty
    await act(async () => {
      fireEvent.change(targetField, {
        target: { value: '' },
      });

      fireEvent.focusOut(targetField);
    });

    expect(getByText('Field is required')).toBeTruthy();

    //Verify Submittable
    await act(async () => {
      fireEvent.change(targetField, {
        target: { value: '-24' },
      });
    });

    expect(queryByText('Must be an integer')).toBeNull();
    const submitButton = screen.getByTestId('submit-button');
    expect(submitButton).not.toHaveAttribute('disabled');

    // Verify Bad Format
    await act(async () => {
      fireEvent.change(targetField, {
        target: { value: '-5.8' },
      });
    });

    // expect error if decimal value entered
    expect(getByText('Must be an integer')).toBeTruthy();
  });

  it('should allow edit of Array Fields', async () => {
    renderBrandedConnected(<DemoForm editable={true} />, {});
    const targetField = screen.getByTestId('field-demoArray[0].field1');

    expect(targetField).toBeTruthy();
    expect(targetField).toHaveValue('apple');

    await act(async () => {
      fireEvent.change(targetField, {
        target: { value: '' },
      });

      fireEvent.focusOut(targetField);
    });
    expect(targetField).toHaveValue('');
  });

  it('should allow addition of Array Items', async () => {
    // scrollIntoView is not implemented in jsdom so we need to "mock it"
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
    await act(async () => {
      renderBrandedConnected(<DemoForm editable={true} />, {});
    });

    const addButtons = screen.getAllByRole('button', {
      name: 'Add',
    });
    expect(addButtons).toBeTruthy();

    // clicking on one for demoArray
    await act(async () => {
      fireEvent.click(addButtons[0]);
    });

    const targetField = screen.getByTestId('field-demoArray[1].field1');
    expect(targetField).toBeTruthy();
    expect(targetField).toHaveValue('A');

    // since max rows is 2 add button should now be disabled
    expect(addButtons[0]).toHaveClass('Mui-disabled');
  });

  it('should allow removal of Array Items', async () => {
    await act(async () => {
      renderBrandedConnected(<DemoForm editable={true} />, {});
    });

    const demoArray = screen.getByTestId('field-demoArray[0].field1');
    expect(demoArray).toBeTruthy();

    let removeButtons = screen.getAllByRole('button', {
      name: removeIconButtonArialLabel,
    });

    expect(removeButtons).toBeTruthy();

    // click first remove button -- in demoArray
    await act(async () => {
      fireEvent.click(removeButtons[0]);
    });

    // should now only have one entry
    let arrayFieldAfter = screen.queryByTestId('field-demoArray[1].field1');
    expect(arrayFieldAfter).toBeNull();

    // delete the last one
    removeButtons = screen.getAllByRole('button', {
      name: removeIconButtonArialLabel,
    });
    await act(async () => {
      fireEvent.click(removeButtons[0]);
    });
    expect(removeButtons).toBeTruthy();
    arrayFieldAfter = screen.queryByTestId('field-demoArray[0].field1');
    expect(arrayFieldAfter).toBeNull();

    // since mimimum of one is required should display error
    const arrayError = screen.queryByText('Field is required');
    expect(arrayError).toBeTruthy();
  });

  it('should disable Array buttons when not editable', async () => {
    await act(async () => {
      renderBrandedConnected(<DemoForm editable={false} />, {});
    });

    const nullAddButton = screen.queryByRole('button', {
      name: 'Add',
    });
    expect(nullAddButton).toBeNull();
  });

  it('should allow collapse/expand of Array Field list', async () => {
    // scrollIntoView is not implemented in jsdom so we need to "mock it"
    window.HTMLElement.prototype.scrollIntoView = jest.fn();

    await act(async () => {
      renderBrandedConnected(<DemoForm editable={true} />, {});
    });

    const expansionIcon = screen.getByTestId('array-expand');
    expect(expansionIcon).toBeTruthy();
    expect(screen.getByTestId('demoArray[0].field1')).toBeVisible();

    // collapse array
    await act(async () => {
      fireEvent.click(expansionIcon);
    });

    const arrayElement = screen.queryByTestId('demoArray[0].field1');
    expect(arrayElement).toBeNull(); // it doesn't exist

    // expand array by clicking Add
    const addButtons = screen.getAllByRole('button', {
      name: 'Add',
    });
    expect(addButtons).toBeTruthy();

    // clicking on one for demoArray
    await act(async () => {
      fireEvent.click(addButtons[0]);
    });

    expect(screen.getByTestId('demoArray[0].field1')).toBeVisible();
  });
});
