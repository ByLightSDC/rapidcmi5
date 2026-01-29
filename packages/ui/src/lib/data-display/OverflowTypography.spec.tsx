// import '@testing-library/jest-dom/extend-expect';
// import { fireEvent, render, screen } from '@testing-library/react';
// import { act } from 'react';
// import { brandedTheme } from '../styles/muiTheme';
// import { OverflowTypography } from './OverflowTypography';
// import { ThemeProvider } from '@mui/material';

// const shortTitle = 'Short Title';
// const longTitle =
//   'Long Title which needs to be tooltipped because of its length';
// describe('OverflowTypography', () => {
//   it('should render component successfully', async () => {
//     await act(async () => {
//       render(
//         <ThemeProvider theme={brandedTheme}>
//           <OverflowTypography title={shortTitle} />
//         </ThemeProvider>,
//       );
//     });
//     expect(screen.getByText(shortTitle)).toBeTruthy();
//   });

//   // NOTE: running in jest does NOT yield the actual scrollWidth/clientWidth
//   //       needed to determine when NOT to show the tooltip
//   //       so we only test that a tooltip does appear when hovering
//   it('should show tooltip on hover', async () => {
//     await act(async () => {
//       render(
//         <ThemeProvider theme={brandedTheme}>
//           <OverflowTypography title={longTitle} sxProps={{ width: '80px' }} />
//         </ThemeProvider>,
//       );
//     });
//     const textField = screen.getByText(longTitle);
//     expect(textField).toBeTruthy();

//     act(() => {
//       fireEvent(
//         textField,
//         new MouseEvent('mouseover', {
//           bubbles: true,
//         }),
//       );
//     });

//     const tip = await screen.findByRole('tooltip');
//     expect(tip).toBeInTheDocument();
//   });
// });
