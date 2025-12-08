// import React, { useEffect, useRef, useState } from 'react';
// import ClickAwayListener from '@mui/material/ClickAwayListener';
// import { easingOptions } from '../../constants/Easings';

// /* Icon */
// import MoreVertIcon from '@mui/icons-material/MoreVert';
// import CheckCircleIcon from '@mui/icons-material/CheckCircle';
// import InsertLinkIcon from '@mui/icons-material/InsertLink';
// import MoveDownIcon from '@mui/icons-material/MoveDown';
// import TextRotationAngleupIcon from '@mui/icons-material/TextRotationAngleup';
// import SmartButtonIcon from '@mui/icons-material/SmartButton';

// /* MUI */
// import Box from '@mui/material/Box';
// import Radio from '@mui/material/Radio';
// import FormGroup from '@mui/material/FormGroup';
// import RadioGroup from '@mui/material/RadioGroup';
// import MenuItem from '@mui/material/MenuItem';
// import FormControlLabel from '@mui/material/FormControlLabel';
// import InputLabel from '@mui/material/InputLabel';
// import FormLabel from '@mui/material/FormLabel';
// import Select from '@mui/material/Select';
// import { ToolButton, toolbuttonStyle } from './ToolButton';
// import { Stack } from '@mui/system';
// import { ButtonMinorUi, TextFieldMainUi } from '@rangeos-nx/ui/branded';
// import {
//   AnimationProperties,
//   AnimationsEnum,
//   MediaInsertEnum,
//   MediaProperties,
//   TextEffectProperties,
// } from '../CourseBuilderStyleTypes';
// import { Link, Typography } from '@mui/material';
// import { SlideTrigger } from '@rangeos-nx/ui/branded';

// const DEFAULT_LINK = 'https://picsum.photos/200';
// const DEFAULT_LINK_TEXT = 'Link Text';
// const DEFAULT_BUTTON_TEXT = 'Click Me';
// const DEFAULT_BUTTON_TAG = 'myTag'

// /**
//  * Provides Menu for selecting Header
//  * @returns
//  */
// export default function MediaWidget({
//   buttonIcon,
//   mediaType,
//   mediaSubtype = '',
//   options,
//   tooltip = '',
//   onApply,
//   onSelection,
//   isTextButton = false,
//   setSelection,
//   reselectText,
//   getCurrentlySelectedWord,
// }: {
//   buttonIcon?: JSX.Element;
//   options?: string[];
//   mediaType: MediaInsertEnum;
//   mediaSubtype?: string;
//   tooltip?: string;
//   onApply?: (
//     mediaType: MediaInsertEnum,
//     params: string,
//     mediaSubtype?: string,
//   ) => void;
//   onSelection?: (optionIndex: number) => any;
//   isTextButton?: boolean;
//   setSelection?: () => void;
//   reselectText?: () => void;
//   getCurrentlySelectedWord?: () => string;
// }) {
//   const boxRef = useRef<any>(null);
//   const [isOpen, setIsOpen] = useState(false);
//   const [clickPos, setClickPos] = useState<number[]>([-1, -1]);

//   const params = useRef<{ [key: string]: string }>({});

//   /**
//    * Determine whether user clicked outside panel
//    * @param event
//    */
//   const checkClickAway = (event: any) => {
//     const box = boxRef.current.getBoundingClientRect();
//     const x = event.clientX;
//     const y = event.clientY;
//     const isWithinBounds =
//       x >= box.left && x <= box.right && y >= box.top && y <= box.bottom;

//     if (isOpen && !isWithinBounds) {
//       setIsOpen(false);
//     }
//   };

//   const panelWidth = 320;
//   const halfpanelWidth = 320 / 2.0;

//   /**
//    * Based on the click position, get a position to open the window that is NOT
//    * off screen.
//    */
//   const getWindowOpenPosition = () => {
//     let leftX = clickPos[0] - halfpanelWidth;
//     let topY = clickPos[1];

//     if (leftX < 0) {
//       leftX = 0;
//     }

//     if (topY < 0) {
//       topY = 0;
//     }

//     return [leftX, topY];
//   };

//   /**
//    * Apply Methods to insert text
//    */
//   const handleApply = () => {
//     switch (mediaType) {
//       case MediaInsertEnum.Media:
//         handleMediaApply();
//         break;
//       case MediaInsertEnum.Link:
//         handleLinkApply();
//         break;
//       case MediaInsertEnum.Animation:
//         handleAnimationApply();
//         break;
//       case MediaInsertEnum.TextEffects:
//         handleTextEffectsApply();
//         break;
//       case MediaInsertEnum.Button:
//         handleButtonApply();
//         break;
//     }
//     params.current = {};
//     setIsOpen(false);
//   };

//   /**
//    * Close Panel
//    */
//   const handleClose = () => {
//     params.current = {};
//     setIsOpen(false);
//   };

//   /**
//    * Apply Image to text
//    */
//   const handleMediaApply = () => {
//     // TextInsertValueEnum.Image;
//     // FUTURE add option to URL encode any spaces with %20
//     if (onApply) {
//       let insertChars = '';

//       if (params.current[MediaProperties.Href]) {
//         insertChars = `[![${params.current[MediaProperties.ImageAltText] || ''}](${params.current[MediaProperties.ImageUrl]})](${params.current[MediaProperties.Href]})`;
//       } else {
//         insertChars = `![${params.current[MediaProperties.ImageAltText] || ''}](${params.current[MediaProperties.ImageUrl]})`;
//       }
//       onApply(mediaType, insertChars);
//     }
//   };

//   /**
//    * Apply Link
//    */
//   const handleLinkApply = () => {
//     //TODO add option to URL encode any spaces with %20 ??

//     const href = params.current[MediaProperties.Href];

//     if (onApply) {
//       onApply(mediaType, href);
//     }
//   };

//   /**
//    * Apply a button
//    */
//   const handleButtonApply = () => {
//     if (onApply) {
//       const tag = params.current[MediaProperties.Tag];
//       const text = params.current[MediaProperties.ButtonText];
//       onApply(mediaType, text, tag);
//     }
//   };

//   /**
//    * Apply a text effect
//    */
//   const handleTextEffectsApply = () => {
//     const type =
//       params.current[TextEffectProperties.TextEffectsType] ?? 'circle';
//     const color =
//       params.current[TextEffectProperties.TextEffectsColor] ?? 'yellow';
//     const strokeWidth =
//       params.current[TextEffectProperties.TextEffectsStrokeWidth] ?? '1';
//     const duration =
//       params.current[TextEffectProperties.TextEffectsDuration] ?? '800';
//     // const animate = params.current[TextEffectProperties.TextEffectIsAnimated] ?? 'true';
//     const autoReveal =
//       params.current[TextEffectProperties.TextEffectsIsAutoReveal] ?? 'false';
//     const delay = params.current[TextEffectProperties.TextEffectsDelay] ?? '0';
//     const triggerTag = params.current[TextEffectProperties.TextEffectsTriggerTag] ?? '';
//     const trigger = params.current[TextEffectProperties.TextEffectsTrigger] ?? '';

//     if (onApply) {
//       let insertChars = `type='${type}' color='${color}' strokeWidth='${strokeWidth}' animationDuration='${duration}' autoReveal='${autoReveal}'`;

//       if (delay !== '0') {
//         insertChars += ` animationDelay='${delay}'`;
//       }

//       if (triggerTag !== '') {
//         insertChars += ` waitForTag='${triggerTag}'`;
//       }

//       if (trigger !== '') {
//         insertChars += ` trigger='${trigger}'`;
//       }

//       onApply(mediaType, insertChars, mediaSubtype);
//     }
//   };

//   /**
//    * Apply an animation
//    */
//   const handleAnimationApply = () => {
//     const duration =
//       params.current[AnimationProperties.AnimationDuration] ?? '3000';
//     const delay = params.current[AnimationProperties.AnimationDelay] ?? '0';
//     const tag = params.current[AnimationProperties.AnimationTag] ?? '';
//     const triggerTag = params.current[AnimationProperties.AnimationTriggerTag] ?? '';
//     const trigger = params.current[AnimationProperties.AnimationTrigger] ?? '';
//     const easing = params.current[AnimationProperties.AnimationEasing] ?? '';

//     const translateX =
//       params.current[AnimationProperties.AnimationTranslateX] ?? '100';
//     const translateY =
//       params.current[AnimationProperties.AnimationTranslateY] ?? '100';
//     const rotate = params.current[AnimationProperties.AnimationRotate] ?? '180';
//     const scale = params.current[AnimationProperties.AnimationScale] ?? '1';
//     const skew = params.current[AnimationProperties.AnimationSkew] ?? '30';
//     const opacity = params.current[AnimationProperties.AnimationOpacity] ?? '1';

//     let insertChars = '';
//     switch (mediaSubtype) {
//       case AnimationsEnum.move:
//         insertChars = `translateX='${translateX}' translateY='${translateY}'`;
//         break;
//       case AnimationsEnum.fade:
//         insertChars = `opacity='${opacity}'`;
//         break;
//       case AnimationsEnum.scale:
//         insertChars = `scale='${scale}'`;
//         break;
//       case AnimationsEnum.rotate:
//         insertChars = `rotate='${rotate}'`;
//         break;
//       case AnimationsEnum.skew:
//         insertChars = `skew='${skew}'`;
//         break;
//     }

//     insertChars += ` duration='${duration}'`;

//     if (delay !== '0') {
//       insertChars += ` delay='${delay}'`;
//     }

//     if (tag !== '') {
//       insertChars += ` tag='${tag}'`;
//     }

//     if (triggerTag !== '') {
//       insertChars += ` waitForTag='${triggerTag}'`;
//     }

//     if (trigger !== '') {
//       insertChars += ` trigger='${trigger}'`;
//     }

//     if (easing !== '') {
//       insertChars += ` easing='${easing}'`;
//     }

//     if (onApply) {
//       onApply(mediaType, insertChars);
//     }
//   };

//   /**
//    * UE to set some default values for params.
//    */
//   useEffect(() => {
//     if (mediaType === MediaInsertEnum.TextEffects) {
//       params.current[TextEffectProperties.TextEffectsType] = mediaSubtype;
//       params.current[TextEffectProperties.TextEffectsColor] =
//         options && options.length > 0 ? options[0] : 'yellow';
//       params.current[TextEffectProperties.TextEffectsStrokeWidth] = '1';
//       params.current[TextEffectProperties.TextEffectsDuration] = '800';
//       params.current[TextEffectProperties.TextEffectsIsAutoReveal] = 'false';
//     } else if (mediaType === MediaInsertEnum.Animation) {
//       params.current[AnimationProperties.AnimationType] = mediaSubtype;
//       params.current[AnimationProperties.AnimationTranslateX] = '100';
//       params.current[AnimationProperties.AnimationTranslateY] = '100';
//       params.current[AnimationProperties.AnimationRotate] = '180';
//       params.current[AnimationProperties.AnimationScale] = '2';
//       params.current[AnimationProperties.AnimationSkew] = '30';
//       params.current[AnimationProperties.AnimationOpacity] = '0';
//       params.current[AnimationProperties.AnimationEasing] = '';
//     } else if (mediaType === MediaInsertEnum.Link) {
//       params.current[MediaProperties.Href] = DEFAULT_LINK;
//     } else if (mediaType === MediaInsertEnum.Button) {
//       params.current[MediaProperties.Tag] = DEFAULT_BUTTON_TAG;
//     }
//   });

//   return (
//     <>
//       {isTextButton ? (
//         <Link
//           id={mediaSubtype}
//           className="crumb-text"
//           component="button"
//           gutterBottom={false}
//           sx={{
//             fontSize: '14px',
//             margin: '0px',
//             padding: '0px',
//             height: 'auto',
//             textDecoration: 'none',
//             color: (theme: any) => `${theme.breadcrumbs.underline}`,
//           }}
//           onClick={(event: React.MouseEvent<HTMLElement>) => {
//             setClickPos([event.clientX, event.clientY]);
//             if (event) {
//               event.stopPropagation(); //stops focus from leaving text field
//             }
//             setIsOpen(!isOpen);
//           }}
//         >
//           {mediaSubtype}
//         </Link>
//       ) : (
//         <ToolButton
//           tooltip={tooltip}
//           onClick={(event: React.MouseEvent<HTMLElement>) => {
//             if (setSelection) setSelection();

//             // for links, use the currently selected word
//             if (mediaType === MediaInsertEnum.Link) {
//               let selectedWord = '';
//               if (getCurrentlySelectedWord) {
//                 selectedWord = getCurrentlySelectedWord();
//               }
//               params.current[MediaProperties.LinkText] = selectedWord.length > 0 ? selectedWord : DEFAULT_LINK_TEXT;
//             } else if (mediaType === MediaInsertEnum.Button) {
//               let selectedWord = '';
//               if (getCurrentlySelectedWord) {
//                 selectedWord = getCurrentlySelectedWord();
//               }
//               params.current[MediaProperties.ButtonText] = selectedWord.length > 0 ? selectedWord : DEFAULT_BUTTON_TEXT;
//             }

//             setClickPos([event.clientX, event.clientY]);
//             if (event) {
//               event.stopPropagation(); //stops focus from leaving text field
//             }
//             setIsOpen(!isOpen);

//             if (reselectText) reselectText();
//           }}
//         >
//           {buttonIcon || <MoreVertIcon color="primary" />}
//         </ToolButton>
//       )}
//       {isOpen && (
//         <ClickAwayListener onClickAway={checkClickAway}>
//           <Box
//             ref={boxRef}
//             sx={{
//               position: 'absolute',
//               left: getWindowOpenPosition()[0],
//               top: getWindowOpenPosition()[1],
//               zIndex: 99,
//               borderColor: 'primary.main',
//               borderRadius: '6px',
//               borderStyle: 'solid',
//               borderWidth: '2px',
//               boxShadow: 1,
//               backgroundColor: toolbuttonStyle.backgroundColor, //(theme: any) => `${theme.nav.fill}`,
//             }}
//           >
//             {mediaType === MediaInsertEnum.Media && (
//               <Stack
//                 direction="column"
//                 sx={{
//                   width: panelWidth,
//                   padding: '12px',
//                   //display: 'flex',
//                   //alignItems: 'center',
//                 }}
//               >
//                 <TextFieldMainUi
//                   isClearable={false}
//                   autoFocus
//                   margin="dense"
//                   label={`${mediaType} URL`}
//                   placeholder="https://picsum.photos/200"
//                   //required={true}
//                   fullWidth
//                   onChange={(textValue: string) => {
//                     params.current[MediaProperties.ImageUrl] = textValue;
//                   }}
//                 />
//                 <TextFieldMainUi
//                   isClearable={false}
//                   autoFocus
//                   margin="dense"
//                   label="Alt Text"
//                   fullWidth
//                   onChange={(textValue: string) => {
//                     params.current[MediaProperties.ImageAltText] = textValue;
//                   }}
//                 />
//                 <TextFieldMainUi
//                   isClearable={false}
//                   autoFocus
//                   margin="dense"
//                   label="Link URL"
//                   placeholder="https://picsum.photos/200"
//                   fullWidth
//                   onChange={(textValue: string) => {
//                     params.current[MediaProperties.Href] = textValue;
//                   }}
//                 />
//                 <div
//                   style={{
//                     width: '100%',
//                     display: 'flex',
//                     justifyContent: 'center',
//                   }}
//                 >
//                   <ButtonMinorUi
//                     onClick={handleClose}
//                     sx={{ width: '80px', maxWidth: '100px' }}
//                   >
//                     Cancel
//                   </ButtonMinorUi>
//                   <ButtonMinorUi
//                     startIcon={<CheckCircleIcon />}
//                     sx={{ width: '80px', maxWidth: '100px' }}
//                     onClick={handleApply}
//                   >
//                     Apply
//                   </ButtonMinorUi>
//                 </div>
//               </Stack>
//             )}
//             {mediaType === MediaInsertEnum.Link && (
//               <Stack
//                 direction="column"
//                 sx={{
//                   width: panelWidth,
//                   padding: '12px',
//                 }}
//               >
//                 <Stack
//                   direction="row"
//                   sx={{
//                     marginBottom: '8px',
//                     padding: '0px',
//                     display: 'flex',
//                     alignContent: 'center',
//                   }}
//                 >
//                   <InsertLinkIcon color="primary" />
//                   <Typography color="primary">Insert Link</Typography>
//                 </Stack>
//                 <TextFieldMainUi
//                   isClearable={false}
//                   autoFocus
//                   margin="dense"
//                   label="Link URL"
//                   placeholder={DEFAULT_LINK}
//                   defaultValue={DEFAULT_LINK}
//                   fullWidth
//                   onChange={(textValue: string) => {
//                     params.current[MediaProperties.Href] = textValue;
//                   }}
//                 />
//                 <TextFieldMainUi
//                   isClearable={false}
//                   autoFocus
//                   margin="dense"
//                   label="Link Text"
//                   defaultValue={params.current[MediaProperties.LinkText]}
//                   fullWidth
//                   onChange={(textValue: string) => {
//                     params.current[MediaProperties.LinkText] = textValue;
//                   }}
//                 />
//                 <div
//                   style={{
//                     width: '100%',
//                     display: 'flex',
//                     justifyContent: 'center',
//                   }}
//                 >
//                   <ButtonMinorUi
//                     onClick={handleClose}
//                     sx={{ width: '80px', maxWidth: '100px' }}
//                   >
//                     Cancel
//                   </ButtonMinorUi>
//                   <ButtonMinorUi
//                     startIcon={<CheckCircleIcon />}
//                     sx={{ width: '80px', maxWidth: '100px' }}
//                     onClick={handleApply}
//                   >
//                     Apply
//                   </ButtonMinorUi>
//                 </div>
//               </Stack>
//             )}
//             {mediaType === MediaInsertEnum.Button && (
//               <Stack
//                 direction="column"
//                 sx={{
//                   width: panelWidth,
//                   padding: '12px',
//                 }}
//               >
//                 <Stack
//                   direction="row"
//                   sx={{
//                     marginBottom: '8px',
//                     padding: '0px',
//                     display: 'flex',
//                     alignContent: 'center',
//                   }}
//                 >
//                   <SmartButtonIcon color="primary" />
//                   <Typography color="primary">Insert Button</Typography>
//                 </Stack>
//                 <TextFieldMainUi
//                   isClearable={false}
//                   autoFocus
//                   margin="dense"
//                   label="Button Text"
//                   defaultValue={params.current[MediaProperties.ButtonText]}
//                   fullWidth
//                   onChange={(textValue: string) => {
//                     params.current[MediaProperties.ButtonText] = textValue;
//                   }}
//                 />
//                 <TextFieldMainUi
//                   isClearable={false}
//                   autoFocus
//                   margin="dense"
//                   label="Tag"
//                   defaultValue={params.current[MediaProperties.Tag]}
//                   fullWidth
//                   onChange={(textValue: string) => {
//                     params.current[MediaProperties.Tag] = textValue;
//                   }}
//                 />
//                 <div
//                   style={{
//                     width: '100%',
//                     display: 'flex',
//                     justifyContent: 'center',
//                   }}
//                 >
//                   <ButtonMinorUi
//                     onClick={handleClose}
//                     sx={{ width: '80px', maxWidth: '100px' }}
//                   >
//                     Cancel
//                   </ButtonMinorUi>
//                   <ButtonMinorUi
//                     startIcon={<CheckCircleIcon />}
//                     sx={{ width: '80px', maxWidth: '100px' }}
//                     onClick={handleApply}
//                   >
//                     Apply
//                   </ButtonMinorUi>
//                 </div>
//               </Stack>
//             )}
//             {mediaType === MediaInsertEnum.Animation && (
//               <Stack
//                 direction="column"
//                 sx={{
//                   width: panelWidth,
//                   padding: '12px',
//                 }}
//               >
//                 <Stack
//                   direction="row"
//                   sx={{
//                     marginBottom: '8px',
//                     padding: '0px',
//                     display: 'flex',
//                     alignContent: 'center',
//                   }}
//                 >
//                   <MoveDownIcon color="primary" />
//                   <Typography color="primary">Animation</Typography>
//                 </Stack>
//                 {mediaSubtype === AnimationsEnum.move && (
//                   <>
//                     <TextFieldMainUi
//                       isClearable={false}
//                       autoFocus
//                       margin="dense"
//                       label="Translate X"
//                       placeholder="100"
//                       fullWidth
//                       onChange={(textValue: string) => {
//                         params.current[
//                           AnimationProperties.AnimationTranslateX
//                         ] = textValue;
//                       }}
//                     />
//                     <TextFieldMainUi
//                       isClearable={false}
//                       autoFocus
//                       margin="dense"
//                       label="Translate Y"
//                       placeholder="100"
//                       fullWidth
//                       onChange={(textValue: string) => {
//                         params.current[
//                           AnimationProperties.AnimationTranslateY
//                         ] = textValue;
//                       }}
//                     />
//                   </>
//                 )}
//                 {mediaSubtype === AnimationsEnum.rotate && (
//                   <TextFieldMainUi
//                     isClearable={false}
//                     autoFocus
//                     margin="dense"
//                     label="Rotate"
//                     placeholder="180"
//                     fullWidth
//                     onChange={(textValue: string) => {
//                       params.current[AnimationProperties.AnimationRotate] =
//                         textValue;
//                     }}
//                   />
//                 )}
//                 {mediaSubtype === AnimationsEnum.scale && (
//                   <TextFieldMainUi
//                     isClearable={false}
//                     autoFocus
//                     margin="dense"
//                     label="Scale"
//                     placeholder="2"
//                     fullWidth
//                     onChange={(textValue: string) => {
//                       params.current[AnimationProperties.AnimationScale] =
//                         textValue;
//                     }}
//                   />
//                 )}
//                 {mediaSubtype === AnimationsEnum.fade && (
//                   <TextFieldMainUi
//                     isClearable={false}
//                     autoFocus
//                     margin="dense"
//                     label="Opacity"
//                     placeholder="1"
//                     fullWidth
//                     onChange={(textValue: string) => {
//                       params.current[AnimationProperties.AnimationOpacity] =
//                         textValue;
//                     }}
//                   />
//                 )}
//                 {mediaSubtype === AnimationsEnum.skew && (
//                   <TextFieldMainUi
//                     isClearable={false}
//                     autoFocus
//                     margin="dense"
//                     label="Skew"
//                     placeholder="30"
//                     fullWidth
//                     onChange={(textValue: string) => {
//                       params.current[AnimationProperties.AnimationSkew] =
//                         textValue;
//                     }}
//                   />
//                 )}
//                 <TextFieldMainUi
//                   isClearable={false}
//                   autoFocus
//                   margin="dense"
//                   label="Duration"
//                   placeholder="3000"
//                   fullWidth
//                   onChange={(textValue: string) => {
//                     params.current[AnimationProperties.AnimationDuration] =
//                       textValue;
//                   }}
//                 />
//                 <TextFieldMainUi
//                   isClearable={false}
//                   autoFocus
//                   margin="dense"
//                   label="Delay"
//                   placeholder="0"
//                   fullWidth
//                   onChange={(textValue: string) => {
//                     params.current[AnimationProperties.AnimationDelay] =
//                       textValue;
//                   }}
//                 />
//                 <TextFieldMainUi
//                   isClearable={false}
//                   autoFocus
//                   margin="dense"
//                   label="Tag"
//                   placeholder=""
//                   fullWidth
//                   onChange={(textValue: string) => {
//                     params.current[AnimationProperties.AnimationTag] =
//                       textValue;
//                   }}
//                 />
//                 <FormGroup>
//                   <InputLabel id="easing">Easing</InputLabel>
//                   <Select
//                     labelId="easing-label"
//                     id="easing-id"
//                     margin="dense"
//                     defaultValue=''
//                     label="Easing"
//                     onChange={(e) => {
//                       params.current[AnimationProperties.AnimationEasing] = e.target.value as string;
//                       console.log('--->', e.target.value);
//                     }}
//                   >
//                     {easingOptions.map((optionString) => (
//                       <MenuItem key={optionString} value={optionString}>
//                         {optionString}
//                       </MenuItem>
//                     ))}
//                   </Select>
//                 </FormGroup>
//                 <Box padding="5px">
//                   <FormGroup>
//                     <FormLabel id="triggers">Trigger</FormLabel>
//                     <RadioGroup
//                       defaultValue={SlideTrigger.None}
//                       onChange={(e) => {
//                         params.current[AnimationProperties.AnimationTrigger] = e.target.value;
//                     }}>
//                       <FormControlLabel value={SlideTrigger.None} control={<Radio />} label="Auto" />
//                       <FormControlLabel value={SlideTrigger.ItemClick} control={<Radio />} label="On Animation Click" />
//                       <FormControlLabel value={SlideTrigger.SlideClick} control={<Radio />} label="On Slide Click" />
//                       <FormControlLabel value={SlideTrigger.InView} control={<Radio />} label="On Scroll Into View" />
//                       <FormControlLabel value={SlideTrigger.ButtonClick} control={<Radio />} label="On Button Click" />
//                       <FormControlLabel value={SlideTrigger.TagComplete} control={<Radio />} label="On Animation Complete" />
//                     </RadioGroup>
//                   </FormGroup>
//                 </Box>
//                 <TextFieldMainUi
//                   isClearable={false}
//                   autoFocus
//                   margin="dense"
//                   label="Trigger Tag"
//                   placeholder=""
//                   fullWidth
//                   onChange={(textValue: string) => {
//                     params.current[AnimationProperties.AnimationTriggerTag] =
//                       textValue;
//                   }}
//                 />
//                 <div
//                   style={{
//                     width: '100%',
//                     display: 'flex',
//                     justifyContent: 'center',
//                   }}
//                 >
//                   <ButtonMinorUi
//                     onClick={handleClose}
//                     sx={{ width: '80px', maxWidth: '100px' }}
//                   >
//                     Cancel
//                   </ButtonMinorUi>
//                   <ButtonMinorUi
//                     startIcon={<CheckCircleIcon />}
//                     sx={{ width: '80px', maxWidth: '100px' }}
//                     onClick={handleApply}
//                   >
//                     Apply
//                   </ButtonMinorUi>
//                 </div>
//               </Stack>
//             )}
//             {mediaType === MediaInsertEnum.TextEffects && (
//               <Stack
//                 direction="column"
//                 sx={{
//                   width: panelWidth,
//                   padding: '12px',
//                 }}
//               >
//                 <Stack
//                   direction="row"
//                   sx={{
//                     marginBottom: '8px',
//                     padding: '0px',
//                     display: 'flex',
//                     alignContent: 'center',
//                   }}
//                 >
//                   <TextRotationAngleupIcon color="primary" />
//                   <Typography color="primary">Text FX</Typography>
//                 </Stack>
//                 <TextFieldMainUi
//                   isClearable={false}
//                   autoFocus
//                   margin="dense"
//                   label="Type"
//                   disabled={true}
//                   value={mediaSubtype}
//                   fullWidth
//                   onChange={(textValue: string) => {
//                     params.current[TextEffectProperties.TextEffectsType] =
//                       textValue;
//                   }}
//                 />
//                 <TextFieldMainUi
//                   isClearable={false}
//                   autoFocus
//                   margin="dense"
//                   label="Color"
//                   placeholder="yellow"
//                   defaultValue={
//                     options && options.length > 0 ? options[0] : 'yellow'
//                   }
//                   fullWidth
//                   onChange={(textValue: string) => {
//                     params.current[TextEffectProperties.TextEffectsColor] =
//                       textValue;
//                   }}
//                 />
//                 <TextFieldMainUi
//                   isClearable={false}
//                   autoFocus
//                   margin="dense"
//                   label="Stroke Width"
//                   placeholder="1"
//                   defaultValue="1"
//                   fullWidth
//                   onChange={(textValue: string) => {
//                     params.current[
//                       TextEffectProperties.TextEffectsStrokeWidth
//                     ] = textValue;
//                   }}
//                 />
//                 <TextFieldMainUi
//                   isClearable={false}
//                   autoFocus
//                   margin="dense"
//                   label="Duration"
//                   placeholder="800"
//                   defaultValue="800"
//                   fullWidth
//                   onChange={(textValue: string) => {
//                     params.current[TextEffectProperties.TextEffectsDuration] =
//                       textValue;
//                   }}
//                 />
//                 <TextFieldMainUi
//                   isClearable={false}
//                   autoFocus
//                   margin="dense"
//                   label="Delay"
//                   placeholder="0"
//                   fullWidth
//                   onChange={(textValue: string) => {
//                     params.current[TextEffectProperties.TextEffectsDelay] =
//                       textValue;
//                   }}
//                 />
//                 <Box padding="5px">
//                   <FormGroup>
//                     <FormLabel id="triggers-effects">Trigger</FormLabel>
//                     <RadioGroup
//                       defaultValue={SlideTrigger.None}
//                       onChange={(e) => {
//                         params.current[TextEffectProperties.TextEffectsTrigger] = e.target.value;
//                       }}>
//                       <FormControlLabel value={SlideTrigger.None} control={<Radio />} label="Auto" />
//                       <FormControlLabel value={SlideTrigger.ItemClick} control={<Radio />} label="On Effect Click" />
//                       <FormControlLabel value={SlideTrigger.SlideClick} control={<Radio />} label="On Slide Click" />
//                       <FormControlLabel value={SlideTrigger.InView} control={<Radio />} label="On Scroll Into View" />
//                       <FormControlLabel value={SlideTrigger.ButtonClick} control={<Radio />} label="On Button Click" />
//                       <FormControlLabel value={SlideTrigger.TagComplete} control={<Radio />} label="On Animation Complete" />
//                     </RadioGroup>
//                   </FormGroup>
//                 </Box>
//                 <TextFieldMainUi
//                   isClearable={false}
//                   autoFocus
//                   margin="dense"
//                   label="Trigger Tag"
//                   placeholder=""
//                   fullWidth
//                   onChange={(textValue: string) => {
//                     params.current[TextEffectProperties.TextEffectsTriggerTag] =
//                       textValue;
//                   }}
//                 />
//                 <div
//                   style={{
//                     width: '100%',
//                     display: 'flex',
//                     justifyContent: 'center',
//                   }}
//                 >
//                   <ButtonMinorUi
//                     onClick={handleClose}
//                     sx={{ width: '80px', maxWidth: '100px' }}
//                   >
//                     Cancel
//                   </ButtonMinorUi>
//                   <ButtonMinorUi
//                     startIcon={<CheckCircleIcon />}
//                     sx={{ width: '80px', maxWidth: '100px' }}
//                     onClick={handleApply}
//                   >
//                     Apply
//                   </ButtonMinorUi>
//                 </div>
//               </Stack>
//             )}
//           </Box>
//         </ClickAwayListener>
//       )}
//     </>
//   );
// }

// //REF for a drop down popper
// // for list <List component="div" disablePadding>
// //               {options.map((item: any, index) => (
// //                 <React.Fragment key={item + '_action'}>
// //                   <ListItemButton
// //                     sx={{
// //                       //color: (theme: any) => `${theme.nav.icon}`,
// //                       '&:hover': {
// //                         backgroundColor: '#a4b8eb80', //main color ,
// //                       },
// //                     }}
// //                     dense={true}
// //                     onMouseDown={(event) => {
// //                       event.stopPropagation();
// //                       setIsOpen(false);
// //                       onSelection(index);
// //                     }}
// //                     // onClick={(event) => {
// //                     //   setIsOpen(false);
// //                     //   onSelection(index);
// //                     // }}
// //                     disabled={item.disabled}
// //                   >
// //                     <ListItemText
// //                       sx={{
// //                         color: 'inherit',
// //                         '&:hover': {
// //                           color: 'inherit',
// //                         },
// //                       }}
// //                       primaryTypographyProps={{ variant: 'subtitle2' }}
// //                       secondaryTypographyProps={{ variant: 'subtitle2' }}
// //                       inset={false}
// //                       primary={item}
// //                     />
// //                   </ListItemButton>
// //                   {item.includeDivider && <Divider />}
// //                 </React.Fragment>
// //               ))}
// //             </List>
