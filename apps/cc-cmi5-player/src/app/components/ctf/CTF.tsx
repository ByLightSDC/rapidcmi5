// // @ts-nocheck
// //TODOfff <Grid is deprecated Also, Typescript complaint about the grid is a TS bug

// import { useDispatch, useSelector } from 'react-redux';

// import {
//   getCTFQuiz,
//   getAllAnswers,
//   getGrades,
//   getCurrentAnswer,
//   getCurrentQuestion,
//   resetAnswers,
//   setCurrentQuestion,
//   setCurrentAnswer,
//   setCurrentGrade,
//   setScore,
// } from '../../redux/ctfReducer';
// import {
//   CTFContentType,
//   CTFDisplay,
//   CTFQuestionType,
//   CTFResponseType,
// } from './ctfSchema';
// import Grid from '@mui/material/Grid';
// import { useCallback, useEffect, useRef, useState } from 'react';
// import { debugLog, useDisplayFocus } from '@rangeos-nx/ui/branded';
// import { TextField, Typography } from '@mui/material';
// import { AnswerType, QuizCompletionEnum } from '../../types/QuizState';
// import { debugLogError } from '../../debug';

// /* Icons */
// import OutlinedFlagIcon from '@mui/icons-material/OutlinedFlag';
// import ErrorIcon from '@mui/icons-material/Error';
// import SportsScoreIcon from '@mui/icons-material/SportsScore';

// import RestartAltIcon from '@mui/icons-material/RestartAlt';
// import ReportIcon from '@mui/icons-material/Report';
// import { submitCmi5CtfLRS } from '../../utils/Cmi5Helpers';
// import { progressAU } from '../../utils/AuUtils';
// import { activeTabSel } from '../../redux/navigationReducer';
// import { auJsonSel } from '../../redux/auReducer';

// const answerBoxGridSize = 3.8;

// const attemptedLabel = '#Attempted';
// const accuracyLabel = 'Flags';

// /**
//  * Capture The Flag slide allows users to answer questions displayed in a grid
//  * Questions can be answered out of order
//  * @returns
//  */
// function CTF() {
//   const quiz = useSelector(getCTFQuiz);
//   const quizRef = useRef<CTFContentType | null>(null);
//   const activeTab = useSelector(activeTabSel);
//   const allAnswers = useSelector(getAllAnswers);
//   const auJson = useSelector(auJsonSel);
//   const currentQuestionIndex = useSelector(getCurrentQuestion);
//   const currentAnswer = useSelector(getCurrentAnswer);
//   const currentGrades = useSelector(getGrades);

//   const dispatch = useDispatch();
//   const [isFocused, setIsFocused] = useState(currentQuestionIndex >= 0);
//   const [accuracy, setAccuracy] = useState(0);
//   const [numAttempted, setNumAttempted] = useState(0);
//   const [numCorrect, setNumCorrect] = useState(0);
//   const [hasSubmitted, setHasSubmitted] = useState(false);

//   const focusHelper = useDisplayFocus();
//   const countRef = useRef(currentQuestionIndex); //for tabbing

//   useEffect(() => {
//     quizRef.current = quiz;
//   }, [quiz]);

//   /**
//    * Selects question if it is available (no grade or bad grade)
//    * Correct answers are skipped
//    * Returns whether question was available
//    */
//   const isAvailable = useCallback(
//     (questionIndex: number) => {
//       if (Object.prototype.hasOwnProperty.call(currentGrades, questionIndex)) {
//         if (currentGrades[questionIndex] === 0) {
//           //bad grade
//           dispatch(setCurrentQuestion(questionIndex));
//           setIsFocused(true);
//           return true;
//         }
//       } else {
//         //no grade
//         dispatch(setCurrentQuestion(questionIndex));
//         setIsFocused(true);
//         return true;
//       }
//       return false;
//     },
//     [currentQuestionIndex, currentGrades, setCurrentQuestion, dispatch],
//   );

//   /**
//    * Starting with next question
//    * Checks to determine next unanswered or incorrect question
//    * And selects that question
//    * @param {number} questionindex Current Question
//    */
//   const gotoNextAvailable = (questionindex: number) => {
//     const startQuestionIndex = questionindex + 1;
//     let jumpTo = undefined;

//     if (quizRef.current) {
//       for (
//         let i = startQuestionIndex;
//         i < quizRef.current.questions.length;
//         i++
//       ) {
//         jumpTo = i;
//         if (isAvailable(jumpTo)) {
//           return;
//         }
//       }
//     }

//     if (startQuestionIndex > 0) {
//       for (let i = 0; i < startQuestionIndex; i++) {
//         jumpTo = i;
//         if (isAvailable(jumpTo)) {
//           return;
//         }
//       }
//     }

//     debugLog('no available question found');
//   };

//   /**
//    * Starting with previous question
//    * Checks to determine previous unanswered or incorrect question
//    * And selects that question
//    * @param {number} questionindex Current Question
//    */
//   const gotoPrevAvailable = (questionindex: number) => {
//     const startQuestionIndex = questionindex - 1;
//     let jumpTo = undefined;
//     for (let i = startQuestionIndex; i >= 0; i--) {
//       jumpTo = i;
//       if (isAvailable(jumpTo)) {
//         return;
//       }
//     }

//     if (startQuestionIndex < quiz.questions.length - 1) {
//       for (let i = quiz.questions.length - 1; i >= questionindex; i--) {
//         jumpTo = i;
//         if (isAvailable(jumpTo)) {
//           return;
//         }
//       }
//     }

//     debugLog('no available question found');
//   };

//   /**
//    * KeyDown handlers allows user to use arrow keys to cycle through questions
//    */
//   const handleKeyDown = useCallback(
//     (event: KeyboardEvent) => {
//       //REF stale console.log(currentQuestionIndex, countRef.current);
//       if (event.key === 'ArrowDown') {
//         event.stopPropagation();
//         gotoNextAvailable(countRef.current);
//       } else if (event.key === 'ArrowUp') {
//         event.stopPropagation();
//         gotoPrevAvailable(countRef.current);
//       } else if (event.key === 'ArrowRight') {
//         event.stopPropagation();
//         gotoNextAvailable(countRef.current);
//       } else if (event.key === 'ArrowLeft') {
//         event.stopPropagation();
//         gotoPrevAvailable(countRef.current);
//       }
//     },
//     [currentQuestionIndex],
//   );

//   /**
//    * Reset Activity
//    */
//   const handleReset = () => {
//     setIsFocused(true);
//     dispatch(resetAnswers());
//     focusHelper.focusOnElementById('me');
//   };

//   /**
//    * Selection Question
//    * @param {number} index
//    */
//   const handleSelectQuestion = (index: number) => {
//     dispatch(setCurrentQuestion(index));
//     setIsFocused(true);
//   };

//   /**
//    * Score Answer
//    * @param {AnswerType} input
//    */
//   const handleSubmitAnswer = (input: AnswerType) => {
//     //grade here
//     dispatch(setCurrentAnswer(input));
//     gradeAnswer(input, currentQuestionIndex);
//     setIsFocused(false);
//     //REF maybe go to next available here?
//   };

//   /**
//    * Grade Answer
//    * @param {AnswerType} answerInput
//    * @param {number} questionIndex
//    */
//   const gradeAnswer = (answerInput: AnswerType, questionIndex: number) => {
//     if (quiz.questions[questionIndex].type === CTFResponseType.FreeResponse) {
//       if (
//         answerInput ===
//         quiz.questions[questionIndex].typeAttributes.correctAnswer
//       ) {
//         dispatch(setCurrentGrade(1));
//       } else {
//         dispatch(setCurrentGrade(0));
//       }
//     } else {
//       debugLogError('unexpected question type');
//     }
//   };

  // /**
  //  * Submit Score to LRS
  //  */
  // const submitQuiz = () => {
  //   dispatch(setScore(accuracy));

  //   submitCmi5CtfLRS(quiz, allAnswers);

  //   if (quiz.completionRequired === QuizCompletionEnum.Attempted) {
  //     progressAU(activeTab, false, true, auJson, dispatch);
  //   } else if (quiz.completionRequired === QuizCompletionEnum.Passed) {
  //     if (accuracy >= passingScore) {
  //       progressAU(activeTab, false, true, auJson, dispatch);
  //     }
  //   }
  // };

//   /**
//    * Logs answer change
//    */
//   useEffect(() => {
//     //console.log('change answer', currentAnswer);
//   }, [currentAnswer]);

//   /**
//    * Listens for arrow key events
//    */
//   useEffect(() => {
//     window.addEventListener('keydown', handleKeyDown);

//     return () => {
//       window.removeEventListener('keydown', handleKeyDown);
//     };
//   }, [handleKeyDown]);

//   /**
//    * UI triggers focus on input element when question index changes
//    * Updates question index ref used in key event handlers
//    */
//   useEffect(() => {
//     debugLog('UE currentQuestionIndex', currentQuestionIndex);
//     focusHelper.focusOnElementById('me');
//     countRef.current = currentQuestionIndex;
//   }, [currentQuestionIndex]);

//   /**
//    * UE updates accuracy score
//    */
//   useEffect(() => {
//     const correct = Object.values(currentGrades).filter((x) => x === 1);
//     const attempted = Object.values(currentGrades).filter(
//       (x) => x === 0 || x === 1,
//     );
//     setNumCorrect(correct.length);
//     setNumAttempted(attempted.length);
//     if (attempted.length > 0) {
//       const decimalAccuracy =
//         (correct.length / (quiz.questions.length * 1.0)) * 100;

//       setAccuracy(Math.round(decimalAccuracy * 10) / 10);
//     } else {
//       setAccuracy(0);
//     }
//   }, [currentGrades]);

//   /* Constants */
//   const passingScore = quiz.passingScore || 80;

//   return (
//     quiz.questions && (
//       <div className="m-4">
//         <Typography
//           color="text.primary"
//           align="center"
//           variant="h4"
//           style={{ fontWeight: 800, paddingTop: '24px', paddingBottom: '24px' }}
//         >
//           {quiz.title}
//         </Typography>

//         <div
//           className="w-full prose-xl"
//           style={{
//             backgroundColor: 'black',
//             display: 'flex',
//             flexDirection: 'column',
//           }}
//         >
//           <Grid
//             container
//             rowSpacing={0}
//             columnSpacing={0} //this warps buttons
//             // sx={{ padding: '8px' }}
//           >
//             <ScoreLabel
//               label={attemptedLabel}
//               value={`${numAttempted}/${quiz.questions.length}`}
//             />

//             <ScoreLabel
//               label={accuracyLabel}
//               value={`${numCorrect}`}
//               startIconDisplay={<OutlinedFlagIcon />}
//             />

//             <ScoreLabel
//               label="Score"
//               value={`${accuracy}%`}
//               iconDisplay={
//                 <>
//                   {accuracy >= passingScore ? (
//                     <>
//                       <SportsScoreIcon
//                         color="success"
//                         sx={{ marginLeft: '8px' }}
//                       />
//                       PASS
//                     </>
//                   ) : numAttempted === quiz.questions.length ? (
//                     <>
//                       <ReportIcon color="error" sx={{ marginLeft: '8px' }} />
//                       FAIL
//                     </>
//                   ) : undefined}

//                   <button
//                     id="submit-button"
//                     tabIndex={3}
//                     style={{
//                       width: '100px',
//                       marginLeft: '20px',
//                       // margin: 'auto',
//                     }}
//                     disabled={!(accuracy >= passingScore) || hasSubmitted}
//                     onClick={() => {
//                       submitQuiz();
//                       setHasSubmitted(true);
//                     }}
//                     className="btn-rangeos"
//                   >
//                     Submit
//                   </button>
//                 </>
//               }
//             />

//             <ScoreLabel label="Required" value={`${passingScore} %`} />
//             <ScoreLabel
//               label=""
//               value=""
//               iconDisplay={
//                 <button id="reset-button" tabIndex={4} onClick={handleReset}>
//                   <RestartAltIcon sx={{ marginTop: '-3px' }} />
//                   Reset
//                 </button>
//               }
//               gridSize={2.4}
//             />
//           </Grid>

//           <QuestionInput
//             display={quiz.display}
//             questionIndex={currentQuestionIndex}
//             answer={currentAnswer || ''}
//             handleSubmitAnswer={handleSubmitAnswer}
//           />

//           <Grid
//             container
//             rowSpacing={0}
//             columnSpacing={0} //this warps buttons
//             sx={{ padding: '8px' }}
//           >
//             {quiz.questions.map((option: CTFQuestionType, index: number) => {
//               let grade: undefined | 0 | 1 = undefined;
//               let defaultColor = undefined;
//               if (Object.prototype.hasOwnProperty.call(currentGrades, index)) {
//                 grade = currentGrades[index];
//                 defaultColor = grade === 0 ? 'darkRed' : 'darkGreen';
//               }
//               //REF let theAnswer = option.typeAttributes.correctAnswer;

//               return (
//                 <Grid
//                   className={
//                     currentQuestionIndex === index && isFocused
//                       ? 'btn-rangeos'
//                       : 'bg-zinc'
//                   }
//                   key={`q${index}`}
//                   xs={answerBoxGridSize}
//                   sx={{
//                     borderColor:
//                       currentQuestionIndex === index && isFocused
//                         ? 'white'
//                         : defaultColor,
//                     borderRadius: '6px',
//                     borderStyle: 'solid',
//                     borderWidth: currentQuestionIndex === index ? '2px' : '2px',
//                     display: 'flex',
//                     alignItems: 'flex-start',
//                     margin: '4px',
//                     padding: '8px',
//                   }}
//                   onClick={() => handleSelectQuestion(index)}
//                 >
//                   {option.title && (
//                     <div style={{ display: 'flex', flexDirection: 'column' }}>
//                       <div style={{ display: 'flex', flexDirection: 'row' }}>
//                         {quiz.display?.shouldNumberQuestions && (
//                           <Typography
//                             variant="body1"
//                             sx={{ padding: '8px', paddingTop: '0px' }}
//                           >
//                             {`${index + 1}`}
//                           </Typography>
//                         )}
//                         {option.title && (
//                           <Typography
//                             variant="body1"
//                             sx={{ padding: '8px', paddingTop: '0px' }}
//                           >
//                             {option.title}
//                           </Typography>
//                         )}
//                         {grade === 0 && <ErrorIcon color="error" />}
//                         {grade === 1 && <OutlinedFlagIcon color="success" />}
//                       </div>
//                       <Typography
//                         variant="h5"
//                         sx={{
//                           lineHeight: 1.1,
//                         }}
//                       >
//                         {option.question}
//                       </Typography>
//                     </div>
//                   )}
//                   {!option.title && (
//                     <>
//                       {quiz.display?.shouldNumberQuestions && (
//                         <Typography
//                           variant="body1"
//                           sx={{ padding: '8px', paddingTop: '0px' }}
//                         >
//                           {`${index + 1}`}
//                         </Typography>
//                       )}

//                       <Typography
//                         variant="h5"
//                         sx={{
//                           lineHeight: 1.1,
//                         }}
//                       >
//                         {option.question}
//                       </Typography>
//                       {grade === 0 && <ErrorIcon color="error" />}
//                       {grade === 1 && <OutlinedFlagIcon color="success" />}
//                     </>
//                   )}
//                 </Grid>
//               );
//             })}
//           </Grid>
//         </div>
//       </div>
//     )
//   );
// }

// export default CTF;

// function QuestionInput({
//   questionIndex,
//   answer = '',
//   display,
//   grade = -1,
//   handleSubmitAnswer,
// }: {
//   grade?: number;
//   questionIndex: number;
//   answer?: AnswerType;
//   handleSubmitAnswer: (input: AnswerType) => void;
//   display?: CTFDisplay;
// }) {
//   const [theAnswer, setTheAnswer] = useState<AnswerType>(answer);
//   const [isEnabled, setIsEnabled] = useState(false);
//   const currentGrades = useSelector(getGrades);
//   const inputRef = useRef<HTMLInputElement>(null);

//   useEffect(() => {
//     let grade: undefined | 0 | 1 = undefined;

//     if (Object.prototype.hasOwnProperty.call(currentGrades, questionIndex)) {
//       grade = currentGrades[questionIndex];
//       setIsEnabled(grade !== 1); //dont let them write over correct
//       // if (inputRef.current) {
//       //   inputRef.current.selectionEnd = inputRef.current.selectionStart;
//       // }
//     } else {
//       setIsEnabled(true);
//     }
//   }, [questionIndex, currentGrades]);

//   /**
//    * UE selects text when answer is populated for a new question
//    */
//   useEffect(() => {
//     setTheAnswer(answer);

//     setTimeout(() => {
//       if (inputRef.current) {
//         inputRef.current.select();
//       }
//     }, 100);
//   }, [answer]);

//   return (
//     <div
//       style={{
//         display: 'flex',
//         justifyContent: 'center',
//         alignItems: 'center',
//       }}
//     >
//       <TextField
//         inputRef={inputRef}
//         sx={{ position: 'relative', maxWidth: '480px', marginRight: '8px' }}
//         InputLabelProps={{ shrink: true }} // always put label above box even if empty
//         fullWidth={true}
//         id="me"
//         name=""
//         margin="dense"
//         variant="outlined"
//         label={
//           display?.shouldNumberQuestions
//             ? `Answer #${questionIndex + 1} `
//             : 'Answer'
//         }
//         rows={2}
//         multiline={true}
//         placeholder="Type Here"
//         value={theAnswer}
//         size="small"
//         disabled={!isEnabled}
//         InputProps={{
//           readOnly: false, //TODO !isEnabled,
//           inputProps: { tabIndex: 1 },
//         }}
//         onChange={(event) => {
//           setTheAnswer(event.target.value);
//         }}
//         onFocus={(event) => {
//           if (inputRef.current && theAnswer) {
//             inputRef.current.select();
//           }
//         }}
//         onKeyDown={(event) => {
//           if (event.key === 'Enter') {
//             event.stopPropagation();
//             event.preventDefault();
//             handleSubmitAnswer(theAnswer);
//           }
//         }}
//       />
//       <button
//         id="enter-button"
//         tabIndex={2}
//         disabled={!isEnabled}
//         onClick={() => {
//           handleSubmitAnswer(theAnswer);
//         }}
//         className="btn-rangeos"
//       >
//         Enter
//       </button>
//     </div>
//   );
// }

// function ScoreLabel({
//   label,
//   value,
//   iconDisplay,
//   startIconDisplay,
//   gridSize = 2.4,
// }: {
//   label: string;
//   value: string;
//   iconDisplay?: JSX.Element;
//   startIconDisplay?: JSX.Element;
//   gridSize?: number;
// }) {
//   return (
//     <Grid
//       xs={gridSize}
//       sx={{
//         display: 'flex',
//         justifyContent: 'center',
//         alignItems: 'center',
//       }}
//     >
//       {label && value && <h5>{label}</h5>}
//       {startIconDisplay}
//       {label && value && <h5 style={{ marginLeft: '1px' }}>{`:`}</h5>}
//       {value && <h5 style={{ marginLeft: '4px' }}>{`${value}`}</h5>}
//       {iconDisplay}
//     </Grid>
//   );
// }
