// import { TextField } from '@mui/material';
// import { overrideTextInputStyle } from './styles/styles';
// import { useContext } from 'react';
// import { CourseBuilderContext } from './CourseBuilderContext';


// /**
//  * Input Component For Mark Down
//  * @returns
//  */
// export function MarkDownInput() {
//   const { displayData, inputRef, onPaste, onTextChangeSlideView } =
//     useContext(CourseBuilderContext);

//   return (
//     <div
//       className="scrollingDiv"
//       style={{
//         // minHeight: '480px',
//         //TOP maxHeight: slideHeight,
//         flexGrow: 1,
//         overflowX: 'hidden',
//         borderColor: '#42464D',
//         borderRadius: '6px',
//         borderStyle: 'solid',
//         borderWidth: '2px',
//       }}
//     >
//       <TextField
//         InputProps={{
//           //onFocus: handleFocus,
//           //onBlur: handleFocusOut,
//           //onDoubleClickCapture: handleDoubleClick,
//           sx: {
//             padding: 0,
//             ...overrideTextInputStyle,
//             margin: '12px',
//           },
//         }}
//         autoFocus={false}
//         style={{ whiteSpace: 'pre-wrap' }}
//         key="slide-input"
//         id="slide-input"
//         defaultValue={displayData}
//         value={displayData}
//         inputRef={inputRef}
//         fullWidth={true}
//         label=""
//         minRows={16}
//         //maxRows={16}
//         multiline
//         onPaste={onPaste}
//         placeholder=""
//         sx={{ whiteSpace: 'pre-wrap' }}
//         onChange={(event) => {
//           onTextChangeSlideView(event.target.value);
//         }}
//         onKeyDown={(event) => {
//           //console.log('event.key', event.key);
//         }}
//       ></TextField>
//     </div>
//   );
// }

// export default MarkDownInput;
