import { render } from '@testing-library/react';

import { ThemeProvider } from '@mui/material';
import { lightTheme } from '../../../styles/muiTheme';

import MessageCard from '../MessageCard';
import { MessageCardProps } from '../../../types/cardTypes';

const fullMsgProps: MessageCardProps = {
  title: 'Message Title',
  subtitle: 'Sub Title',
  message: 'this is the message',
  children: <div>children</div>,
};

const simpleMsgProps: MessageCardProps = {
  title: 'Message Title',
  message: 'this is the message',
};

describe('MessageCard', () => {
  it('should render full message successfully', () => {
    const { baseElement } = render(
      <ThemeProvider theme={lightTheme}>
        <MessageCard props={fullMsgProps} />
      </ThemeProvider>,
    );

    expect(baseElement).toBeTruthy();
  });

  it('should have title, SubTitle, message, children', () => {
    const { getByText } = render(
      <ThemeProvider theme={lightTheme}>
        <MessageCard props={fullMsgProps} />
      </ThemeProvider>,
    );

    expect(getByText('Message Title', { exact: false })).toBeTruthy();
    expect(getByText('Sub Title', { exact: false })).toBeTruthy();
    expect(getByText('this is the message', { exact: false })).toBeTruthy();
    expect(getByText('children', { exact: false })).toBeTruthy();
  });

  it('should should match full snapshot', () => {
    const { asFragment } = render(
      <ThemeProvider theme={lightTheme}>
        <MessageCard props={fullMsgProps} />
      </ThemeProvider>,
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('should render message with only title and msg successfully', () => {
    const { baseElement } = render(
      <ThemeProvider theme={lightTheme}>
        <MessageCard props={simpleMsgProps} />
      </ThemeProvider>,
    );

    expect(baseElement).toBeTruthy();
  });

  it('should only have title and message', () => {
    const { getByText, queryByText } = render(
      <ThemeProvider theme={lightTheme}>
        <MessageCard props={simpleMsgProps} />
      </ThemeProvider>,
    );

    expect(getByText(/Message Title/i)).toBeTruthy();
    expect(queryByText(/Sub Title/i)).not.toBeTruthy();
    expect(getByText(/this is the message/i)).toBeTruthy();
    expect(queryByText(/children/i)).not.toBeTruthy();
  });

  it('should should match simple snapshot', () => {
    const { asFragment } = render(
      <ThemeProvider theme={lightTheme}>
        <MessageCard props={simpleMsgProps} />
      </ThemeProvider>,
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
