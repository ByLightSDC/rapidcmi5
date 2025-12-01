// //https://react-syntax-highlighter.github.io/react-syntax-highlighter/AVAILABLE_LANGUAGES_HLJS.html

// import {
//   useCallback,
//   useRef,
// } from 'react';
// import {
//   slideDataText,
// } from 'apps/rapid-cmi5-electron-frontend/src/app/redux/courseBuilderReducer';
// import { useSelector } from 'react-redux';
// import {
//   FormatEnumValues,
//   HeaderEnum,
//   MediaInsertEnum,
//   TextInsertEnum,
//   TextInsertValueEnum,
//   TextSelectionContext,
//   textStyleOptions,
//   TextStyleValueEnum
// } from './CourseBuilderStyleTypes';
// import {
//   formatWord,
//   wrapLines,
//   wrapWord,
// } from './utils/wordUtils';

// /**
//  * Methods for applying styles
//  * @param onTextChangeSlideView
//  * @param ref
//  * @returns
//  */
// export const useMDTextStyles = (
//   onTextChangeSlideView: (textVal: string, wasApplied?: boolean) => void,
//   ref?: React.RefObject<HTMLInputElement> | null,
// ) => {
//   const displayData = useSelector(slideDataText);
//   const testSelection = false;

//   const currentSel = useRef<TextSelectionContext>({
//     cursorPos: -1,
//     text: '',
//   });

//   const resetSelection = () => {
//     currentSel.current.before = '';
//     currentSel.current.after = '';
//     currentSel.current.word = '';
//     currentSel.current.cursorPos = -1;
//   };

//   /**
//    * start is first highlighted char plus 1
//    * except for if starting on index 0, start = -1
//    * end is last highlighted char plus 1
//    */
//   const setSelection = useCallback(() => {
//     if (ref) {
//       const input: HTMLInputElement | undefined | null = ref
//         ? ref.current
//         : undefined;

//       if (input) {
//         resetSelection();

//         currentSel.current.text = displayData;
//         currentSel.current.start = input.selectionStart || -1;
//         currentSel.current.end = input.selectionEnd || -1;

//         if (currentSel.current.start !== currentSel.current.end) {
//           //selection
//           const selStart = Math.max(0, currentSel.current.start);
//           const selEnd = Math.max(0, currentSel.current.end);
//           currentSel.current.cursorPos = selStart;
//           currentSel.current.word = currentSel.current.text.substring(
//             selStart,
//             selEnd,
//           );
//           currentSel.current.before = currentSel.current.text.substring(
//             0,
//             selStart,
//           );
//           currentSel.current.after = currentSel.current.text.substring(selEnd);
//         } else {
//           //insertion
//           currentSel.current.cursorPos = currentSel.current.start;
//           currentSel.current.word = '';
//           currentSel.current.before = currentSel.current.text.substring(
//             0,
//             currentSel.current.cursorPos,
//           );
//           currentSel.current.after = currentSel.current.text.substring(
//             currentSel.current.cursorPos,
//           );
//         }
//         return;
//       }
//     }

//     currentSel.current.before = '';
//     currentSel.current.after = '';
//     currentSel.current.cursorPos = -1;
//     currentSel.current.word = '';
//   }, [displayData, ref]);

//   /**
//    * Links & Media
//    * @param mediaType
//    * @param insertChars
//    * @param secondaryChars
//    */
//   const onMediaApply = (mediaType: MediaInsertEnum, insertChars: string, secondaryChars = '') => {
//     switch (mediaType) {
//       case MediaInsertEnum.Link:
//         onTextApplyLink(insertChars);
//         break;
//       case MediaInsertEnum.Media:
//         onTextApplyEnd(insertChars);
//         break;
//       case MediaInsertEnum.TextEffects:
//         onTextApplyTextEffect(insertChars);
//         break;
//       case MediaInsertEnum.Animation:
//         onTextApplyAnimation(insertChars);
//         break;
//         case MediaInsertEnum.Button:
//           onTextApplyButton(insertChars, secondaryChars);
//           break;
//     }
//   };

//   const onTextApplyButton = (text: string, tag: string) => {
//     setSelection();

//     if (testSelection) {
//       return;
//     }

//     let reselectStart = currentSel.current.before ? currentSel.current.before.length : 0;
//     let reselectEnd = reselectStart;
//     let formattedStr = '';
//     const wordOffset = FormatEnumValues.Link.indexOf('{0}');

//     reselectStart += wordOffset;

//     // if text is selected, apply the Link formatting around the selection,
//     // else apply the Link formatting around a placeholder string
//     if (currentSel.current.word) {
//       reselectEnd = reselectStart + currentSel.current.word.length;

//       formattedStr = FormatEnumValues.Button.replace(
//         '{1}',
//         tag,
//       ).replace('{0}', currentSel.current.word);
//     } else {
//       const placeHolderValue = 'Click Me';
//       formattedStr = FormatEnumValues.Button.replace(
//         '{1}',
//         tag,
//       ).replace('{0}', text);

//       reselectEnd = reselectStart + placeHolderValue.length;
//     }

//     saveText(
//       `${currentSel.current.before}${formattedStr}${currentSel.current.after}`,
//     );

//     reselectText(reselectStart, reselectEnd);
//   };

//   /**
//    * Link
//    * Takes a selection of text and wraps it with tags for a Link.
//    * If nothing is selected, insert tags with placeholder text selected.
//    * @param insertChars
//    */
//   const onTextApplyLink = (insertChars: string) => {
//     setSelection();

//     if (testSelection) {
//       return;
//     }

//     let reselectStart = currentSel.current.before ? currentSel.current.before.length : 0;
//     let reselectEnd = reselectStart;
//     let formattedStr = '';
//     const wordOffset = FormatEnumValues.Link.indexOf('{0}');

//     reselectStart += wordOffset;

//     // if text is selected, apply the Link formatting around the selection,
//     // else apply the Link formatting around a placeholder string
//     if (currentSel.current.word) {
//       reselectEnd = reselectStart + currentSel.current.word.length;

//       formattedStr = FormatEnumValues.Link.replace(
//         '{1}',
//         insertChars,
//       ).replace('{0}', currentSel.current.word);
//     } else {
//       const placeHolderValue = 'Link Text';
//       formattedStr = FormatEnumValues.Link.replace(
//         '{1}',
//         insertChars,
//       ).replace('{0}', placeHolderValue);

//       reselectEnd = reselectStart + placeHolderValue.length;
//     }

//     saveText(
//       `${currentSel.current.before}${formattedStr}${currentSel.current.after}`,
//     );

//     reselectText(reselectStart, reselectEnd);
//   };

//   /**
//    * Text FX
//    * Takes a selection of text and wraps it with tags for Text FX.
//    * If nothing is selected, insert tags with placeholder text selected.
//    * @param insertChars
//    */
//   const onTextApplyTextEffect = (insertChars?: string) => {
//     setSelection();

//     if (testSelection) {
//       return;
//     }

//     let reselectStart = currentSel.current.before ? currentSel.current.before.length : 0;
//     let reselectEnd = reselectStart;
//     let formattedStr = '';
//     const wordOffset = FormatEnumValues.TextEffect.indexOf('{1}');

//     reselectStart += wordOffset;

//     // if text is selected, apply the Text FX formatting around the selection,
//     // else apply the Text FX formatting around a placeholder string
//     if (currentSel.current.word) {
//       reselectEnd = reselectStart + currentSel.current.word.length;

//       formattedStr = FormatEnumValues.TextEffect.replace(
//         '{0}',
//         insertChars || 'type=\'circle\'',
//       ).replace('{1}', currentSel.current.word);

//       // console.log('formattedStr', formattedStr);
//     } else {
//       const placeHolderValue = 'Text FX';
//       formattedStr = FormatEnumValues.TextEffect.replace(
//         '{0}',
//         insertChars || 'type=\'circle\'',
//       ).replace('{1}', placeHolderValue);

//       reselectEnd = reselectStart + placeHolderValue.length;
//     }

//     saveText(
//       `${currentSel.current.before}${formattedStr}${currentSel.current.after}`,
//     );

//     reselectText(reselectStart, reselectEnd);
//   };

//   /**
//    * Animation
//    * Takes a selection of text and wraps it with tags for Animation.
//    * If nothing is selected, insert tags with placeholder text selected.
//    * @param insertChars
//    */
//   const onTextApplyAnimation = (insertChars?: string) => {
//     setSelection();

//     if (testSelection) {
//       return;
//     }

//     let reselectStart = currentSel.current.before ? currentSel.current.before.length : 0;
//     let reselectEnd = reselectStart;
//     let formattedStr = '';
//     const wordOffset = FormatEnumValues.Animation.indexOf('{1}');

//     reselectStart += wordOffset;

//     // if text is selected, apply the Animation formatting around the selection,
//     // else apply the Animation formatting around a placeholder string
//     if (currentSel.current.word) {
//       reselectEnd = reselectStart + currentSel.current.word.length;

//       formattedStr = FormatEnumValues.Animation.replace(
//         '{0}',
//         insertChars || 'translateX=\'200\'',
//       ).replace('{1}', currentSel.current.word);
//     } else {
//       const placeHolderValue = 'Animation';
//       formattedStr = FormatEnumValues.Animation.replace(
//         '{0}',
//         insertChars || 'translateX=\'200\'',
//       ).replace('{1}', placeHolderValue);

//       reselectEnd = reselectStart + placeHolderValue.length;
//     }

//     saveText(
//       `${currentSel.current.before}${formattedStr}${currentSel.current.after}`,
//     );

//     reselectText(reselectStart, reselectEnd);
//   };

//   /**
//    *
//    * @param header
//    * @returns
//    */
//   const onTextApplyCodeBlock = (len?: string) => {
//     setSelection();
//     //console.log('-------------------onTextApplyCodeBlock', currentSel.current);
//     if (testSelection) {
//       return;
//     }
//     if (currentSel.current.word) {
//       const formattedStr = FormatEnumValues.Code.replace(
//         '{0}',
//         len || 'javascript',
//       ).replace('{1}', currentSel.current.word);

//       saveText(
//         `${currentSel.current.before}${formattedStr}${currentSel.current.after}`,
//       );
//     } else {
//       saveText(
//         `${currentSel.current.before}${TextInsertValueEnum.Code}${currentSel.current.after}`,
//       );
//     }
//   };

//   const onTextApplyEnd = (insertChars: string) => {
//     setSelection();

//     //console.log('-------------------onTextApplyEnd', insertChars);
//     saveText(`${currentSel.current.text}${insertChars as string}`);
//   };

//   const onTextApplyLineItems = (isOrdered: boolean) => {
//     setSelection();
//     // console.log('isOrdered', isOrdered);
//     //console.log('-------------------onTextApplyLineItems', currentSel.current);
//     if (testSelection) {
//       return;
//     }

//     let thePattern = '* ';
//     let newText = '';

//     if (currentSel.current.word && currentSel.current.cursorPos >= 0) {
//       // console.log('currentSel.current.word', currentSel.current.word);
//       const wrappedLines = wrapLines(currentSel.current.word, isOrdered);
//       newText = `${currentSel.current.before}${wrappedLines}${currentSel.current.after}`;
//     } else {
//       //INSERT
//       //last char is a line return,insert pattern
//       //if not insert line return and pattern
//       if (currentSel.current.text.length > 0) {
//         if (isOrdered) {
//           thePattern = '1. ';
//         }
//         const lastCharCode = currentSel.current.text.charCodeAt(
//           currentSel.current.text.length - 1,
//         );
//         if (lastCharCode === 10) {
//           newText = `${currentSel.current.text}${thePattern}`;
//         } else {
//           newText = `${currentSel.current.text}\n${thePattern}`;
//         }
//       } else {
//         newText = thePattern;
//       }
//     }
//     saveText(newText);
//   };

//   /**
//    * Place the given header at the beginning of the current line.
//    * If a header already exists, remove the old header first.
//    * Reselect any selected text, or place the cursor back in the correct
//    * location.
//    * @param header
//    * @returns
//    */
//   const onTextApplyHeaders = (header: HeaderEnum | string) => {
//     setSelection();

//     //console.log('-------------------onTextApplyHeaders', currentSel.current);
//     if (testSelection) {
//       return;
//     }

//     // used for when text is selected
//     let reselectStart = currentSel.current.before ? currentSel.current.before.length + header.length : header.length;
//     let reselectEnd = reselectStart;

//     // find the beginning and end of the current line of text
//     const lineStart = currentSel.current.text.lastIndexOf('\n',  currentSel.current.cursorPos - 1) + 1;
//     let lineEnd = currentSel.current.text.indexOf('\n', currentSel.current.cursorPos);
//     if (lineEnd === -1) lineEnd = currentSel.current.text.length;

//     // where is the header going to be placed?
//     const insertionPosition = lineStart;

//     // clear the line of any existing headers
//     const lineText = currentSel.current.text.substring(lineStart, lineEnd);
//     const cleanedLineText = lineText.replace(/^#+\s*/, '');
//     const lengthRemoved = lineText.length - cleanedLineText.length;

//     reselectStart -= lengthRemoved;
//     reselectEnd -= lengthRemoved;

//     if (currentSel.current.word && currentSel.current.cursorPos >= 0) {
//       reselectEnd = reselectStart + currentSel.current.word.length;
//     }

//     saveText(
//       currentSel.current.text.slice(0, insertionPosition)
//       + header
//       + currentSel.current.text.slice(insertionPosition + lengthRemoved)
//     );

//     reselectText(reselectStart, reselectEnd);
//   };

//   /**
//    *
//    * @returns
//    */
//   const onTextClearFormat = () => {
//     setSelection();
//     //console.log('-------------------onTextClearFormat', currentSel.current);
//     if (testSelection) {
//       return;
//     }
//     if (currentSel.current.word) {
//       let newWord = currentSel.current.word;

//       for (let i = 0; i < textStyleOptions.length; i++) {
//         const pattern = textStyleOptions[i];
//         do {
//           newWord = newWord.replace(pattern, '');
//         } while (newWord.indexOf(pattern) >= 0);
//       }
//       //TODO regex clear repeating # followed by a space

//       saveText(
//         `${currentSel.current.before}${newWord}${currentSel.current.after}`,
//       );
//     }
//   };

//   /**
//    * Takes a cursor position
//    * and inserts text
//    * @param style
//    * @returns
//    */
//   const onTextInsertChange = (insertProperty: TextInsertEnum) => {
//     setSelection();

//     //console.log('-------------------onTextInsertChange', currentSel.current);
//     if (testSelection) {
//       return;
//     }

//     if (currentSel.current.cursorPos >= 0) {
//       let insertChars = '';
//       switch (insertProperty) {
//         case TextInsertEnum.Paragraph:
//           insertChars = TextInsertValueEnum.Paragraph;
//           break;
//         case TextInsertEnum.Break:
//           insertChars = TextInsertValueEnum.Break;
//           break;
//         case TextInsertEnum.Tab:
//           insertChars = TextInsertValueEnum.Tab;
//           break;
//       }
//       if (insertChars) {
//         saveText(
//           `${currentSel.current.before}${insertChars}${currentSel.current.after}`,
//         );

//         const updatedCursorPosition = currentSel.current.cursorPos + insertChars.length;
//         reselectText(updatedCursorPosition, updatedCursorPosition);
//       }
//     }
//   };

//   /**
//    * Takes a selection and wraps it with formatting.
//    * If nothing is selected, wrap a blank space and position the cursor in the
//    * middle of the formatting.
//    * @param format
//    * @param params
//    */
//   const onTextFormatChange = (format: string, params?: string[]) => {
//     setSelection();

//     // console.log('-------------------onTextFormatChange', currentSel.current);
//     if (testSelection) {
//       return;
//     }

//     // used for when text is selected
//     let reselectStart = currentSel.current.before ? currentSel.current.before.length : 0;
//     let reselectEnd = reselectStart;
//     const wordOffset = format.indexOf('{0}');

//     let word = '';

//     // if text is selected, apply the format change around the selection, else
//     // apply the format to a placeholder string
//     if (currentSel.current.word && currentSel.current.cursorPos >= 0) {
//       word = currentSel.current.word;
//     } else {
//       const placeHolderValue = 'Color';
//       word = placeHolderValue;
//     }

//     const newParams = [word].concat(params || []);
//     const formattedWord = formatWord(format, newParams);

//     let totalLengthOfParams = 0;
//     if (params) {
//       totalLengthOfParams = params.reduce((sum, str) => sum + str.length, 0);
//     }

//     reselectStart += wordOffset + totalLengthOfParams - 3; // subtract 3 for the token {0}
//     reselectEnd = reselectStart + word.length;

//     saveText(
//       `${currentSel.current.before}${formattedWord}${currentSel.current.after}`,
//     );

//     reselectText(reselectStart, reselectEnd);
//   };

//   /**
//    * If a word is currently selected, return it, else return an empty string.
//    */
//   const getCurrentlySelectedWord = () => {
//     if (currentSel.current.word) {
//       return currentSel.current.word;
//     }

//     return '';
//   };

//   /**
//    * Refocus on the input text and reapply the selection.
//    * A selection size of zero simply places the cursor back at the correct
//    * position.
//    * If start and end are both less than zero, get the placement from the
//    * currentSel ref.
//    * @param start
//    * @param end
//    */
//   const reselectText = (start: number = -1, end: number = -1) => {
//     const input: HTMLInputElement | undefined | null = ref
//       ? ref.current
//       : undefined;

//     if (start < 0 && end < 0 && currentSel.current.start && currentSel.current.end) {
//       start = currentSel.current.start;
//       end = currentSel.current.end;
//     }

//     if (
//       input &&
//       start >= 0 &&
//       end >= start
//     ) {
//       setTimeout(() => {
//         input.focus();
//         input.setSelectionRange(start, end);
//       }, 0); // zero to just wait for the current event loop to finish
//     }
//   };

//   /**
//    * Takes a selection and wraps it with style.
//    * If nothing is selected, wrap a blank space and position the cursor in the
//    * middle of the style.
//    * @param style
//    */
//   const onTextStyleChange = (style: TextStyleValueEnum) => {
//     setSelection();

//     // console.log('-------------------onTextStyleChange', currentSel.current);
//     if (testSelection) {
//       return;
//     }

//     // used for when text is selected
//     const reselectStart = currentSel.current.before ? currentSel.current.before.length + style.length : style.length;
//     let reselectEnd = reselectStart;

//     // used for when no text is selected
//     const insertionPosition = reselectStart - style.length;

//     if (currentSel.current.word && currentSel.current.cursorPos >= 0) {
//       const wrappedWord = wrapWord(style, currentSel.current.word);
//       reselectEnd = reselectStart + (wrappedWord.length - style.length * 2);

//       saveText(
//         `${currentSel.current.before}${wrappedWord}${currentSel.current.after}`,
//       );
//     } else {
//       // console.log('B currentSel.current.text', currentSel.current.text);
//       saveText(
//         currentSel.current.text.slice(0, insertionPosition)
//         + style
//         + style
//         + currentSel.current.text.slice(insertionPosition)
//       );
//     }

//     reselectText(reselectStart, reselectEnd);
//   };

//   const saveText = (textVal: string) => {
//     onTextChangeSlideView(textVal, true);
//   };

//   return {
//     onMediaApply,
//     onTextApplyCodeBlock,
//     onTextApplyHeaders,
//     onTextApplyTextEffect,
//     onTextApplyAnimation,
//     onTextApplyEnd,
//     onTextApplyLineItems,
//     onTextClearFormat,
//     onTextStyleChange,
//     onTextFormatChange,
//     onTextInsertChange,
//     setSelection,
//     reselectText,
//     getCurrentlySelectedWord,
//   };
// };
