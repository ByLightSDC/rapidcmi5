// /* eslint-disable @typescript-eslint/no-explicit-any */
// import React, { useContext, useEffect, useMemo, useState } from 'react';
// import { MuiColorInput } from 'mui-color-input';
// import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
// import {
//   appHeaderVisible,
//   setBreadCrumbVisible,
//   setTheme,
//   themeColor,
// } from '@rangeos-nx/ui/redux';
// import { useDispatch, useSelector } from 'react-redux';

// /** Branded  */
// import {
//   ButtonInfoField,
//   ButtonMinorUi,
//   ButtonOptions,
//   TextFieldMainUi,
// } from '@rangeos-nx/ui/branded';

// /** Material */
// import {
//   Box,
//   Divider,
//   IconButton,
//   Link,
//   List,
//   ListItemButton,
//   ListItemIcon,
//   ListItemText,
//   Stack,
//   Tooltip,
//   Typography,
// } from '@mui/material';

// //#region Icons
// /** Icons */
// import AddIcon from '@mui/icons-material/Add';
// import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
// import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
// import ArrowBackIcon from '@mui/icons-material/ArrowBack';
// import CodeIcon from '@mui/icons-material/Code';
// import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
// import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
// import NumbersIcon from '@mui/icons-material/Numbers';
// import EditIcon from '@mui/icons-material/Edit';
// import FileDownloadIcon from '@mui/icons-material/FileDownload';
// import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
// import FileUploadIcon from '@mui/icons-material/FileUpload';
// import FormatBoldIcon from '@mui/icons-material/FormatBold';
// import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
// import FormatClearIcon from '@mui/icons-material/FormatClear';
// import FormatColorFillIcon from '@mui/icons-material/FormatColorFill';
// import FormatItalicIcon from '@mui/icons-material/FormatItalic';
// import KeyboardTabIcon from '@mui/icons-material/KeyboardTab';
// import ImageIcon from '@mui/icons-material/Image';
// import InfoIcon from '@mui/icons-material/Info';
// import InsertLinkIcon from '@mui/icons-material/InsertLink';
// import LocalActivityIcon from '@mui/icons-material/LocalActivity';
// import MoveDownIcon from '@mui/icons-material/MoveDown';
// import NoteAddIcon from '@mui/icons-material/NoteAdd';
// import SaveIcon from '@mui/icons-material/Save';
// import StrikethroughSIcon from '@mui/icons-material/StrikethroughS';
// import TextRotationAngleupIcon from '@mui/icons-material/TextRotationAngleup';
// import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
// import WarningAmberIcon from '@mui/icons-material/WarningAmber';
// import SmartButtonIcon from '@mui/icons-material/SmartButton';
// import FolderZipIcon from '@mui/icons-material/FolderZip';
// //#endregion Icons

// import {
//   disabledSlideOptions,
//   DisplaySlideTypeEnum,
//   enabledSlideOptions,
//   MessageType,
//   ViewModeEnum,
// } from './CourseBuilderTypes';
// import {
//   animationOptions,
//   commonCodeOptions,
//   ComplexObjects,
//   FormatEnumValues,
//   HeaderEnum,
//   headerOptions,
//   MediaInsertEnum,
//   textEffectOptions,
//   TextInsertEnum,
//   TextStyleEnum,
//   TextStyleValueEnum,
// } from './styles/CourseBuilderStyleTypes';
// import { CourseBuilderContext } from './CourseBuilderContext';
// import { Topic } from '@rangeos-nx/ui/api/hooks';
// import { AuContextProps, SlideTypeEnum } from '@rangeos-nx/types/cmi5';
// import { SlideDisplayForm } from './SlideDisplayForm';
// import AuthoringAuSlide from './AuthoringAuSlide';
// import { useMDTextStyles } from './styles/useMDTextStyles';

// import { ToolButton, toolbuttonStyle } from './styles/components/ToolButton';
// import { useMDStyleIcons } from './styles/useMDStyleIcons';
// import { courseBuilderName } from './constants';
// import {
//   changeViewMode,
//   currentAu,
//   currentBlock,
//   currentViewMode,
//   dirtyDisplay,
//   handleCacheChange,
//   updateASlideTitle,
// } from 'apps/rapid-cmi5-electron-frontend/src/app/redux/courseBuilderReducer';
// import {
//   bgColor,
//   borderBgColor,
//   overrideTextInputStyle,
//   iconButtonSize,
//   iconButtonStyle,
//   expandedToolStackStyle,
//   textColorGray,
//   toolsBgColor,
//   tooltipStyle,
// } from './styles/styles';
// import MediaWidget from './styles/components/MediaWidget';
// import { GitContext } from './GitViewer/session/GitContext';
// import LessonSelector from './selectors/LessonSelector';

// import MarkDownInput from './MarkDownInput';
// import { usePrompts } from './hooks/usePrompts';
// import ViewRepo from './GitViewer/Components/SelectedRepo/ViewRepo';

// /** Layout **/
// const itemHeight = 28;

// /**
//  * Course Creator UI for CMI5 Client
//  * @returns
//  */
// export function CourseBuilder() {
//   const dispatch = useDispatch();
//   const theme = useSelector(themeColor);
//   const {
//     addSlide,
//     courseData,
//     currentSlide,
//     currentSlideIndex,
//     deleteSlide,
//     displayAuName,
//     inputRef,
//     scenario,
//     slideCount,
//     slideCounterLabel,
//     slides,
//     setCurrentSlideIndex,
//     onEditForm,
//     onTextChangeSlideView,
//   } = useContext(CourseBuilderContext);

//   const {
//     onMediaApply,
//     onTextApplyCodeBlock,
//     onTextApplyHeaders,
//     onTextApplyLineItems,
//     onTextClearFormat,
//     onTextFormatChange,
//     onTextInsertChange,
//     onTextStyleChange,
//     setSelection,
//     reselectText,
//     getCurrentlySelectedWord,
//   } = useMDTextStyles(onTextChangeSlideView, inputRef);

//   const [currentColor, setCurrentColor] = useState('#ffcc00');
//   const { currentCourse, currentRepo, handleNavToDesigner, getLocalImage } =
//     useContext(GitContext);
//   const {
//     promptChangeLesson,
//     promptCreateLesson,
//     promptExportPlan,
//     promptGitModal,
//     promptCodeEditor,
//     promptDeleteAllSlides,
//     promptImportPlan,
//     promptSaveLesson,
//     promptDownloadCmi5Zip
//   } = usePrompts();
//   const dirtyDisplayCount = useSelector(dirtyDisplay);
//   const currentBlockIndex = useSelector(currentBlock);
//   const currentAuIndex = useSelector(currentAu);

//   const [isLanguagesExpanded, setLanguagesExpanded] = useState(false);
//   const [isTextEffectsExpanded, setTextEffectsExpanded] = useState(false);
//   const [isHeadersExpanded, setHeadersExpanded] = useState(false);
//   const [isAnimationsExpanded, setAnimationsExpanded] = useState(false);

//   const gitOutOfSynch = false; //TODO currentRepo && availableRepos.length === 0;

//   const viewMode = useSelector(currentViewMode);
//   const isAppHeaderShowing = useSelector(appHeaderVisible);

//   const { gitIcon } = useMDStyleIcons();

//   // scrolling params
//   const top = isAppHeaderShowing ? 40 : 0;

//   const getSlide = (props: Partial<AuContextProps>) => {
//     if (props?.slides && props.slides.length === 0) {
//       return <div>No Slides Found</div>;
//     }
//     return <AuthoringAuSlide auProps={props} />;
//   };

//   const auProps: Partial<AuContextProps> = {
//     activeTab: currentSlideIndex,
//     course: courseData,
//     au: courseData.blocks[currentBlockIndex].aus[currentAuIndex],
//     progressPercent: 0,
//     viewedSlides: [],
//     scenario: scenario, //from redux, may be more up to date than course data
//     slides: slides, //from redux, may be more up to date than course data
//     getSlide,
//     setActiveTab: setCurrentSlideIndex,
//     getLocalImage: getLocalImage,
//   };

//   const isDeckMode = false;

//   //#region Nav
//   /**
//    * Slide Navigation
//    * go to first slide
//    */
//   const onFirstSlide = () => {
//     setCurrentSlideIndex(0);
//   };

//   /**
//    * Slide Navigation
//    * go to last slide
//    */
//   const onLastSlide = () => {
//     setCurrentSlideIndex(slideCount - 1);
//   };

//   /**
//    * Slide Navigation
//    * go to next slide
//    */
//   const onNextSlide = () => {
//     setCurrentSlideIndex(currentSlideIndex + 1);
//   };

//   /**
//    * Slide Navigation
//    * go to prev slide
//    */
//   const onPrevSlide = () => {
//     setCurrentSlideIndex(currentSlideIndex - 1);
//   };
//   //#endregion

//   //#region Input handlers

//   /**
//    * Handles dropdown
//    * @param event action that occurred - target.value indicates which option was selected
//    */
//   const onAddSlideType = (slideType: DisplaySlideTypeEnum | string) => {
//     let newSlideType = SlideTypeEnum.Markdown;
//     switch (slideType) {
//       case DisplaySlideTypeEnum.Scenario:
//         newSlideType = SlideTypeEnum.Scenario;
//         break;
//       case DisplaySlideTypeEnum.Quiz:
//         newSlideType = SlideTypeEnum.Quiz;
//         break;
//       case DisplaySlideTypeEnum.CTF:
//         newSlideType = SlideTypeEnum.CTF;
//         break;
//       case DisplaySlideTypeEnum.JobeInTheBox:
//         newSlideType = SlideTypeEnum.JobeInTheBox;
//         break;
//       case DisplaySlideTypeEnum.SourceDoc:
//         newSlideType = SlideTypeEnum.SourceDoc;
//         break;
//     }
//     addSlide(newSlideType);
//   };

//   //#endregion

//   const muteSubmit = async (data?: any) => {
//     //REF do not remove
//   };

//   const mdTools = useMemo(() => {
//     if (currentSlide.type !== SlideTypeEnum.Markdown) {
//       return null;
//     }

//     return (
//       <>
//         <Stack
//           id="text-tools"
//           direction="row"
//           spacing={1}
//           sx={{
//             backgroundColor: toolsBgColor,
//             display: 'flex',
//             width: '100%',
//             justifyContent: 'center',
//             alignItems: 'center',
//             alignContent: 'center',
//             color: 'white',
//             height: 'auto',
//             marginBottom: '12px',
//           }}
//         >
//           <Stack
//             id="text-tools"
//             direction="row"
//             spacing={0}
//             sx={{
//               backgroundColor: toolsBgColor,
//               display: 'flex',
//               width: '90%',
//               justifyContent: 'center',
//               alignItems: 'center',
//               alignContent: 'center',
//               color: 'white',
//               height: 'auto',
//               flexWrap: 'wrap',
//               columnGap: '4px',
//               rowGap: '10px',
//             }}
//           >
//             {/* text tools */}
//             <ToolButton
//               tooltip={TextStyleEnum.Headers}
//               onClick={() => {
//                 setSelection();
//                 setHeadersExpanded(!isHeadersExpanded);
//                 reselectText();
//               }}
//             >
//               <NumbersIcon color="inherit" />
//             </ToolButton>
//             <ToolButton
//               tooltip={TextStyleEnum.Bold}
//               onClick={() => {
//                 onTextStyleChange(TextStyleValueEnum.Bold);
//               }}
//             >
//               <FormatBoldIcon color="inherit" />
//             </ToolButton>
//             <ToolButton
//               tooltip={TextStyleEnum.Italic}
//               onClick={() => {
//                 onTextStyleChange(TextStyleValueEnum.Italic);
//               }}
//             >
//               <FormatItalicIcon color="inherit" />
//             </ToolButton>
//             <ToolButton
//               tooltip={TextStyleEnum.StrikeThrough}
//               onClick={() => {
//                 onTextStyleChange(TextStyleValueEnum.StrikeThrough);
//               }}
//             >
//               <StrikethroughSIcon color="inherit" />
//             </ToolButton>
//             <ToolButton
//               tooltip={TextInsertEnum.TextEffects}
//               onClick={() => {
//                 setSelection();
//                 setTextEffectsExpanded(!isTextEffectsExpanded);
//                 reselectText();
//               }}
//             >
//               <TextRotationAngleupIcon color="inherit" />
//             </ToolButton>
//             <ToolButton
//               tooltip="Clear Format"
//               onClick={() => {
//                 onTextClearFormat();
//               }}
//             >
//               <FormatClearIcon color="inherit" />
//             </ToolButton>
//             <div style={{ minWidth: '12px' }} />
//             {/* html tags */}
//             <ToolButton
//               tooltip={TextInsertEnum.Tab}
//               onClick={() => {
//                 onTextInsertChange(TextInsertEnum.Tab);
//               }}
//             >
//               <KeyboardTabIcon color="inherit" />
//             </ToolButton>
//             <ToolButton
//               tooltip={TextInsertEnum.Paragraph}
//               props={{ disabled: false }}
//               onClick={() => {
//                 onTextInsertChange(TextInsertEnum.Paragraph);
//               }}
//             >
//               <Typography>P</Typography>
//             </ToolButton>
//             <ToolButton
//               tooltip={TextInsertEnum.Break}
//               props={{ disabled: false }}
//               onClick={() => {
//                 onTextInsertChange(TextInsertEnum.Break);
//               }}
//             >
//               <Typography>BR</Typography>
//             </ToolButton>
//             <ToolButton
//               props={{ disabled: false }}
//               //tooltip={TextInsertEnum.Break}
//               onClick={() => {
//                 onTextFormatChange(FormatEnumValues.ColorSpan, [currentColor]);
//               }}
//             >
//               <div style={{ color: currentColor }}>
//                 <FormatColorFillIcon color="inherit" />{' '}
//               </div>
//             </ToolButton>
//             <div style={{ minWidth: '12px' }} />
//             {/* complex objects */}
//             <ToolButton
//               tooltip={TextInsertEnum.Code}
//               onClick={() => {
//                 setLanguagesExpanded(!isLanguagesExpanded);
//               }}
//             >
//               <CodeIcon color="inherit" />
//             </ToolButton>
//             <ToolButton
//               tooltip={ComplexObjects.OrderedList}
//               onClick={() => {
//                 onTextApplyLineItems(true);
//               }}
//             >
//               <FormatListNumberedIcon color="inherit" />
//             </ToolButton>
//             <ToolButton
//               tooltip={ComplexObjects.BulletList}
//               onClick={() => {
//                 onTextApplyLineItems(false);
//               }}
//             >
//               <FormatListBulletedIcon color="inherit" />
//             </ToolButton>
//             {/* other  */}
//             <div style={{ minWidth: '12px' }} />
//             <MediaWidget
//               mediaType={MediaInsertEnum.Link}
//               tooltip={TextInsertEnum.Link}
//               buttonIcon={<InsertLinkIcon color="inherit" />}
//               onApply={onMediaApply}
//               setSelection={setSelection}
//               reselectText={reselectText}
//               getCurrentlySelectedWord={getCurrentlySelectedWord}
//             />
//             <MediaWidget
//               mediaType={MediaInsertEnum.Media}
//               tooltip={TextInsertEnum.Media}
//               buttonIcon={<ImageIcon color="inherit" />}
//               onApply={onMediaApply}
//             />
//             <ToolButton
//               tooltip={TextInsertEnum.Animation}
//               onClick={() => {
//                 setSelection();
//                 setAnimationsExpanded(!isAnimationsExpanded);
//                 reselectText();
//               }}
//             >
//               <MoveDownIcon color="inherit" />
//             </ToolButton>
//             <MediaWidget
//               mediaType={MediaInsertEnum.Button}
//               tooltip={TextInsertEnum.Button}
//               buttonIcon={<SmartButtonIcon color="inherit" />}
//               onApply={onMediaApply}
//             />
//             <Box
//               sx={{
//                 ...toolbuttonStyle,
//                 borderColor: 'primary.main',
//               }}
//             >
//               <MuiColorInput
//                 color="primary"
//                 size="small" //textfield props
//                 sx={{
//                   width: '36px',
//                   height: '36px',
//                   padding: 0,
//                   margin: 0,
//                   marginLeft: -1.5,
//                   marginTop: -0.75,
//                   ...overrideTextInputStyle,
//                 }}
//                 format="hex"
//                 isAlphaHidden={true}
//                 value={currentColor}
//                 onChange={setCurrentColor}
//               />
//             </Box>
//             <TextFieldMainUi
//               defaultValue={slides ? slides[currentSlideIndex]?.slideTitle : ''}
//               isClearable={false}
//               autoFocus
//               margin="dense"
//               label="Slide Title"
//               onChange={(val: string) => {
//                 dispatch(
//                   updateASlideTitle({
//                     position: currentSlideIndex,
//                     title: val,
//                   }),
//                 );
//               }}
//             >
//               {displayAuName}
//             </TextFieldMainUi>
//           </Stack>
//         </Stack>

//         {isLanguagesExpanded && (
//           <Stack
//             id="languages"
//             direction="row"
//             spacing={1}
//             sx={expandedToolStackStyle}
//           >
//             <IconButton
//               autoFocus={false}
//               sx={{ ...toolbuttonStyle, borderStyle: 'none' }}
//               aria-label="text-bold"
//               color="inherit"
//               onMouseDown={(event: React.MouseEvent<HTMLElement>) => {
//                 event.preventDefault();
//                 setLanguagesExpanded(false);
//               }}
//             >
//               <UnfoldLessIcon color="primary" />
//             </IconButton>
//             <React.Fragment key="code-languages">
//               {commonCodeOptions.map((label: string, index: number) => (
//                 <LanguageButton
//                   key={'languageOption' + index}
//                   label={label}
//                   onClick={() => {
//                     onTextApplyCodeBlock(label);
//                   }}
//                 />
//               ))}
//             </React.Fragment>
//           </Stack>
//         )}
//         {isAnimationsExpanded && (
//           <Stack
//             id="animations"
//             direction="row"
//             spacing={1}
//             sx={expandedToolStackStyle}
//           >
//             <IconButton
//               autoFocus={false}
//               sx={{ ...toolbuttonStyle, borderStyle: 'none' }}
//               aria-label="text-bold"
//               color="inherit"
//               onMouseDown={(event: React.MouseEvent<HTMLElement>) => {
//                 event.preventDefault();
//                 setAnimationsExpanded(false);
//               }}
//               //onFocus={handleFocus}
//             >
//               <UnfoldLessIcon color="primary" />
//             </IconButton>
//             <React.Fragment key="animations">
//               {animationOptions.map((label: string, index: number) => (
//                 <MediaWidget
//                   key={'animationOption' + index}
//                   mediaType={MediaInsertEnum.Animation}
//                   mediaSubtype={label}
//                   options={[currentColor]}
//                   tooltip={label}
//                   isTextButton={true}
//                   buttonIcon={<Typography>{label}</Typography>}
//                   onApply={onMediaApply}
//                 />
//               ))}
//             </React.Fragment>
//           </Stack>
//         )}
//         {isTextEffectsExpanded && (
//           <Stack
//             id="textEffects"
//             direction="row"
//             spacing={1}
//             sx={expandedToolStackStyle}
//           >
//             <IconButton
//               autoFocus={false}
//               sx={{ ...toolbuttonStyle, borderStyle: 'none' }}
//               aria-label="text-bold"
//               color="inherit"
//               onMouseDown={(event: React.MouseEvent<HTMLElement>) => {
//                 event.preventDefault();
//                 setTextEffectsExpanded(false);
//               }}
//               //onFocus={handleFocus}
//             >
//               <UnfoldLessIcon color="primary" />
//             </IconButton>
//             <React.Fragment key="text-effects">
//               {textEffectOptions.map((label: string, index: number) => (
//                 <MediaWidget
//                   key={'effectOptionButton' + index}
//                   mediaType={MediaInsertEnum.TextEffects}
//                   mediaSubtype={label}
//                   options={[currentColor]}
//                   tooltip={label}
//                   isTextButton={true}
//                   buttonIcon={<Typography>{label}</Typography>}
//                   onApply={onMediaApply}
//                 />
//               ))}
//             </React.Fragment>
//           </Stack>
//         )}
//         {isHeadersExpanded && (
//           <Stack
//             id="languages"
//             direction="row"
//             spacing={1}
//             sx={expandedToolStackStyle}
//           >
//             <IconButton
//               autoFocus={false}
//               sx={{ ...toolbuttonStyle, borderStyle: 'none' }}
//               aria-label="text-bold"
//               color="inherit"
//               onMouseDown={(event: React.MouseEvent<HTMLElement>) => {
//                 event.preventDefault();
//                 setHeadersExpanded(false);
//               }}
//               //onFocus={handleFocus}
//             >
//               <UnfoldLessIcon color="primary" />
//             </IconButton>
//             <React.Fragment key="header-options">
//               {headerOptions.map((label: string, index: number) => (
//                 <ToolButton
//                   key={'headerOption' + index}
//                   tooltip={TextStyleEnum.Bold}
//                   onClick={() => {
//                     onTextApplyHeaders(
//                       HeaderEnum[label as keyof typeof HeaderEnum],
//                     );
//                   }}
//                 >
//                   <Typography variant="body2">{label}</Typography>
//                 </ToolButton>
//               ))}
//             </React.Fragment>
//           </Stack>
//         )}
//       </>
//     );
//   }, [
//     isHeadersExpanded,
//     isTextEffectsExpanded,
//     isAnimationsExpanded,
//     isLanguagesExpanded,
//     currentColor,
//     currentSlide.type,
//     onMediaApply,
//     onTextApplyCodeBlock,
//     onTextApplyHeaders,
//     onTextApplyLineItems,
//     onTextClearFormat,
//     onTextFormatChange,
//     onTextInsertChange,
//     onTextStyleChange,
//   ]);

//   //#region UE
//   /**
//    * force dark mode until we implement a proper theme
//    */
//   useEffect(() => {
//     if (theme === 'light') {
//       dispatch(setTheme('dark'));
//     }
//   }, [theme, dispatch]);

//   /**
//    * hide breadcrumbs in this UI
//    */
//   useEffect(() => {
//     //reset to design view
//     dispatch(changeViewMode(ViewModeEnum.Designer));

//     dispatch(setBreadCrumbVisible(false));

//     return () => {
//       dispatch(setBreadCrumbVisible(true));
//     };
//   }, []);

//   useEffect(() => {}, [dirtyDisplayCount]);

//   // This use effect is what triggers the repo cache to run
//   // it will either make an entry, use an entry, or clear an entry.
//   // The user then will either return to the last AU and slide they were working,
//   // or will be brought to the first AU and slide.
//   // useEffect(() => {
//   //   if (
//   //     currentRepo !== null &&
//   //     currentCourse &&
//   //     currentCourse?.mkdocsPath !== null
//   //   ) {
//   //     dispatch(
//   //       handleCacheChange({
//   //         currentRepo: currentRepo,
//   //         currentCourse: currentCourse?.mkdocsPath,
//   //       }),
//   //     );
//   //   }
//   // }, [currentRepo, currentCourse?.mkdocsPath, courseData]);

//   //#endregion

//   return (
//     <div
//       style={{
//         // position: 'absolute',
//         left: 0,
//         top: top,
//         width: '100%',
//         height: '100%',
//         zIndex: 500,
//         overflowX: 'hidden',
//         overflowY: 'hidden',
//       }}
//     >
//       {viewMode === ViewModeEnum.CodeEditor && (
//         <Stack
//           direction="column"
//           sx={{
//             display: 'flex',
//             borderColor: borderBgColor,
//             borderStyle: 'solid',
//             borderWidth: '2px',
//             width: '100%',
//             height: '100%',
//             padding: '12px',
//           }}
//         >
//           <Stack direction="row" sx={{ display: 'flex', alignItems: 'center' }}>
//             <Typography sx={{ color: textColorGray }}>
//               {`Design Tools › ${courseBuilderName} › Code Editor`}
//             </Typography>
//           </Stack>
//           <ViewRepo />
//           <ButtonMinorUi
//             sxProps={{ maxWidth: '120px' }}
//             startIcon={<ArrowBackIosIcon />}
//             onClick={() => {
//               handleNavToDesigner();
//             }}
//           >
//             Designer
//           </ButtonMinorUi>
//         </Stack>
//       )}
//       {viewMode === ViewModeEnum.Designer && (
//         <Box
//           sx={{
//             display: 'flex',
//             borderColor: borderBgColor,
//             borderStyle: 'solid',
//             borderWidth: '2px',
//             width: '100%',
//             height: '100%',
//           }}
//         >
//           <PanelGroup direction="horizontal">
//             {/* Left Editor */}
//             <Panel>
//               <Box
//                 sx={{
//                   display: 'flex',
//                   flexDirection: 'column',
//                   backgroundColor: bgColor,
//                   width: '100%',
//                   height: '100%',
//                   padding: '12px',
//                 }}
//               >
//                 <Stack direction="row">
//                   <Stack
//                     direction="row"
//                     spacing={0}
//                     sx={{
//                       width: '100%',
//                       display: 'flex',
//                       justifyContent: 'flex-start',
//                       alignItems: 'center',
//                       alignContent: 'flex-start',
//                     }}
//                   >
//                     <Stack
//                       direction="row"
//                       sx={{ width: '38%', backColor: 'red' }}
//                     >
//                       <Typography sx={{ color: textColorGray }}>
//                         {`Design Tools › ${courseBuilderName} › Designer › `}
//                       </Typography>
//                     </Stack>

//                     <Stack
//                       direction="row"
//                       sx={{
//                         backColor: 'orange',
//                         //flexGrow:1,
//                         width: '75%',
//                         display: 'flex',
//                         justifyContent: 'flex-start',
//                       }}
//                     >
//                       {/* we show lessons even if no repo connected */}
//                       <LessonSelector
//                         currentCourse={currentCourse || undefined}
//                         defaultAu={displayAuName}
//                         data={courseData}
//                         disabled={!currentRepo}
//                         styleProps={{
//                           marginLeft: '12px',
//                         }}
//                         onAction={promptCreateLesson}
//                         onSelect={promptChangeLesson}
//                       />
//                       <IconButton
//                         aria-label="select-git"
//                         color="inherit"
//                         size={iconButtonSize}
//                         style={iconButtonStyle}
//                         onClick={() => {
//                           promptGitModal();
//                         }}
//                       >
//                         <Tooltip
//                           arrow
//                           title={currentRepo ? currentRepo : `Git Repository`}
//                           {...tooltipStyle}
//                         >
//                           <div>{gitIcon}</div>
//                         </Tooltip>
//                       </IconButton>
//                       {/* WarningAmberIcon PriorityHighIcon */}
//                       {!currentRepo && (
//                         <ButtonInfoField
//                           infoIcon={<InfoIcon fontSize="small" color="info" />}
//                           alertProps={{
//                             icon: <InfoIcon fontSize="small" color="inherit" />,
//                             severity: 'info',
//                           }}
//                           message="Connect git to manage courses and save files"
//                           props={{
//                             sx: {
//                               margin: 0,
//                               marginRight: -2,
//                             },
//                           }}
//                         />
//                       )}
//                       {gitOutOfSynch && (
//                         <ButtonInfoField
//                           infoIcon={
//                             <WarningAmberIcon fontSize="small" color="info" />
//                           }
//                           alertProps={{
//                             icon: (
//                               <WarningAmberIcon
//                                 fontSize="small"
//                                 color="inherit"
//                               />
//                             ),
//                             severity: 'warning',
//                           }}
//                           message="Git may be offline. You can download your work to avoid losing changes."
//                           props={{
//                             sx: {
//                               margin: 0,
//                               marginRight: -2,
//                             },
//                           }}
//                         />
//                       )}
//                       <IconButton
//                         aria-label="code-editor-view"
//                         disabled={!currentRepo}
//                         color="inherit"
//                         size={iconButtonSize}
//                         style={iconButtonStyle}
//                         onClick={() => {
//                           promptCodeEditor();
//                         }}
//                       >
//                         <Tooltip arrow title={`Code Editor`} {...tooltipStyle}>
//                           <CodeIcon color="inherit" />
//                         </Tooltip>
//                       </IconButton>
//                     </Stack>
//                   </Stack>
//                 </Stack>

//                 <Stack direction="column">
//                   {/* slide deck */}
//                   <Stack
//                     direction="row"
//                     spacing={0}
//                     sx={{
//                       borderRadius: 2,
//                       backgroundColor: toolsBgColor,
//                       borderColor: borderBgColor,
//                       borderStyle: 'solid',
//                       borderWidth: 1,
//                       display: 'flex',
//                       width: '100%',
//                       justifyContent: 'flex-start',
//                       margin: '8px',
//                       paddingLeft: '8px',
//                       paddingRight: '8px',
//                     }}
//                   >
//                     <Stack
//                       direction="row"
//                       spacing={0}
//                       sx={{
//                         //backgroundColor: 'pink',
//                         width: '70%',
//                         display: 'flex',
//                         justifyContent: 'flex-start',
//                         alignItems: 'center',
//                         padding: 0,
//                         margin: 0,
//                       }}
//                     >
//                       <IconButton
//                         aria-label="add-markdown-slide"
//                         color="inherit"
//                         size={iconButtonSize}
//                         style={iconButtonStyle}
//                         onClick={() =>
//                           onAddSlideType(DisplaySlideTypeEnum.Markdown)
//                         }
//                       >
//                         <Tooltip arrow title={`Add Slide`} {...tooltipStyle}>
//                           <NoteAddIcon color="primary" />
//                         </Tooltip>
//                       </IconButton>
//                       <ButtonOptions
//                         closeOnClick={true}
//                         id={'slide-options-menu'}
//                         tooltip="Select Slide Type"
//                         optionButton={(handleClick: any, tooltip: string) => {
//                           return (
//                             <IconButton
//                               aria-label="apps"
//                               className="nodrag"
//                               sx={iconButtonStyle}
//                               onClick={handleClick}
//                             >
//                               <Tooltip
//                                 arrow
//                                 title={`Add Activity`}
//                                 {...tooltipStyle}
//                               >
//                                 {/* <MoreVertIcon color="primary" /> */}
//                                 <LocalActivityIcon color="primary" />
//                               </Tooltip>
//                             </IconButton>
//                           );
//                         }}
//                       >
//                         <List
//                           sx={{
//                             backgroundColor: (theme: any) =>
//                               `${theme.nav.fill}`,
//                             color: (theme: any) => `${theme.nav.icon}`,
//                             display: 'flex',
//                             flexDirection: 'column',
//                             width: '100%',
//                             height: 'auto',
//                             marginRight: '24px',
//                           }}
//                           component="nav"
//                         >
//                           {enabledSlideOptions.map(
//                             (option: string, index: number) => (
//                               // eslint-disable-next-line react/jsx-no-useless-fragment
//                               <React.Fragment key={option}>
//                                 <>
//                                   {index > 0 && (
//                                     <Divider
//                                       sx={{
//                                         marginTop: '6px',
//                                         marginBottom: '6px',
//                                       }}
//                                     />
//                                   )}
//                                   <ListItemButton
//                                     disabled={disabledSlideOptions.includes(
//                                       option,
//                                     )}
//                                     sx={{
//                                       height: itemHeight,
//                                       // eslint-disable-next-line @typescript-eslint/no-explicit-any
//                                       backgroundColor: (theme: any) =>
//                                         `${
//                                           !(
//                                             currentSlide.type &&
//                                             option === currentSlide.type
//                                           )
//                                             ? undefined
//                                             : '#a4b8eb40'
//                                         }`, //main color with transparenct
//                                       '&:hover': {
//                                         backgroundColor: '#a4b8eb80', //main color ,
//                                       },
//                                     }}
//                                     onClick={(event) => {
//                                       onAddSlideType(option);
//                                     }}
//                                   >
//                                     <ListItemIcon
//                                       sx={{
//                                         color: 'inherit',
//                                         '&:hover': {
//                                           color: 'inherit',
//                                         },
//                                       }}
//                                     >
//                                       <AddIcon color="inherit" />
//                                     </ListItemIcon>
//                                     <ListItemText
//                                       sx={{
//                                         color: 'inherit',
//                                         '&:hover': {
//                                           color: 'inherit',
//                                         },
//                                       }}
//                                       primaryTypographyProps={{
//                                         variant: 'subtitle2',
//                                       }}
//                                       secondaryTypographyProps={{
//                                         variant: 'subtitle2',
//                                       }}
//                                       inset={false}
//                                       primary={option}
//                                     />
//                                   </ListItemButton>
//                                 </>
//                               </React.Fragment>
//                             ),
//                           )}
//                         </List>
//                       </ButtonOptions>
//                       <IconButton
//                         aria-label="import-course"
//                         color="primary"
//                         size={iconButtonSize}
//                         style={iconButtonStyle}
//                         disabled={slideCount > 1}
//                         onClick={() => promptImportPlan()}
//                       >
//                         <Tooltip
//                           arrow
//                           title={`Load ${Topic.CMI5Course}`}
//                           {...tooltipStyle}
//                         >
//                           <FileUploadIcon color="inherit" />
//                         </Tooltip>
//                       </IconButton>
//                       {/*REF <IconButton
//                         aria-label="first-slide"
//                         color="inherit"
//                         disabled={currentSlideIndex <= 0}
//                         onClick={onFirstSlide}
//                       >
//                         <SkipPreviousIcon color="inherit" />
//                       </IconButton> */}
//                       <IconButton
//                         aria-label="prev-slide"
//                         color="inherit"
//                         disabled={currentSlideIndex <= 0}
//                         style={iconButtonStyle}
//                         onClick={onPrevSlide}
//                       >
//                         <ArrowBackIcon color="inherit" />
//                       </IconButton>
//                       <Typography
//                         sx={{
//                           height: '20px',
//                           color: textColorGray,
//                         }}
//                       >
//                         {slideCounterLabel}
//                       </Typography>
//                       <IconButton
//                         aria-label="next-slide"
//                         disabled={currentSlideIndex >= slideCount - 1}
//                         style={iconButtonStyle}
//                         color="inherit"
//                         onClick={onNextSlide}
//                       >
//                         {/* <NavigateNextIcon color="inherit" /> */}
//                         <ArrowForwardIcon color="inherit" />
//                       </IconButton>
//                       {/*REF <IconButton
//                         aria-label="last-slide"
//                         color="inherit"
//                         disabled={currentSlideIndex >= slideCount - 1}
//                         onClick={onLastSlide}
//                       >
//                         <SkipNextIcon color="inherit" />
//                       </IconButton> */}
//                       {/* </Stack> */}
//                       <IconButton
//                         aria-label="edit-form"
//                         color="primary"
//                         disabled={!currentRepo || !currentCourse}
//                         style={iconButtonStyle}
//                         onClick={() => {
//                           onEditForm();
//                         }}
//                       >
//                         <Tooltip
//                           arrow
//                           title={`Edit ${Topic.CMI5Course}`}
//                           {...tooltipStyle}
//                         >
//                           <EditIcon color="inherit" />
//                         </Tooltip>
//                       </IconButton>
//                       <IconButton
//                         aria-label="delete-slide"
//                         color="primary"
//                         disabled={slideCount <= 1}
//                         onClick={() => {
//                           deleteSlide();
//                         }}
//                       >
//                         <Tooltip
//                           arrow
//                           title={`Delete Current Slide`}
//                           {...tooltipStyle}
//                         >
//                           <DeleteForeverIcon color="inherit" />
//                         </Tooltip>
//                       </IconButton>

//                       {/* <ButtonOptions
//                         closeOnClick={true}
//                         id={'lesson-menu'}
//                         tooltip="Select Lesson"
//                         optionButton={(handleClick: any, tooltip: string) => {
//                           return (
//                             <IconButton
//                               aria-label="select-lesson"
//                               disabled={!currentRepo}
//                               color="inherit"
//                               style={iconButtonStyle}
//                               onClick={handleClick}
//                             >
//                               <Tooltip arrow title={`Select Lesson`}>
//                                 <CreateNewFolderIcon color="inherit" />
//                               </Tooltip>
//                             </IconButton>
//                           );
//                         }}
//                       ></ButtonOptions> */}
//                     </Stack>

//                     <Stack
//                       direction="row"
//                       spacing={0}
//                       sx={{
//                         width: '30%',
//                         display: 'flex',
//                         justifyContent: 'flex-end',
//                         padding: 0,
//                         margin: 0,
//                       }}
//                     >
//                       <IconButton
//                         aria-label="save-files"
//                         disabled={
//                           !currentRepo ||
//                           dirtyDisplayCount === 0 ||
//                           !currentCourse
//                         }
//                         color="inherit"
//                         size={iconButtonSize}
//                         style={iconButtonStyle}
//                         onClick={() => {
//                           promptSaveLesson(undefined, undefined, {
//                             notify: MessageType.remountLesson,
//                           });
//                         }}
//                       >
//                         <Tooltip arrow title={`Save Files`} {...tooltipStyle}>
//                           <SaveIcon color="inherit" />
//                         </Tooltip>
//                       </IconButton>

//                       <IconButton
//                         aria-label="download-cmi5-zip"
//                         color="inherit"
//                         disabled={slideCount <= 0}
//                         style={iconButtonStyle}
//                         onClick={() => {
//                           promptDownloadCmi5Zip();
//                         }}
//                       >
//                         <Tooltip
//                           title={`Download CMI5 Zip`}
//                           {...tooltipStyle}
//                         >
//                           <FolderZipIcon color="primary" />
//                         </Tooltip>
//                       </IconButton>

//                       <IconButton
//                         aria-label="download-course-content"
//                         color="inherit"
//                         disabled={slideCount <= 0}
//                         style={iconButtonStyle}
//                         onClick={() => {
//                           promptExportPlan();
//                         }}
//                       >
//                         <Tooltip
//                           title={`Download Course Content`}
//                           {...tooltipStyle}
//                         >
//                           <FileDownloadIcon color="primary" />
//                         </Tooltip>
//                       </IconButton>

//                       <IconButton
//                         aria-label="clear-all"
//                         color="inherit"
//                         disabled={slideCount === 0}
//                         onClick={() => {
//                           promptDeleteAllSlides();
//                         }}
//                       >
//                         <Tooltip arrow title={`Delete All`} {...tooltipStyle}>
//                           <DeleteSweepIcon color="primary" />
//                         </Tooltip>
//                       </IconButton>
//                     </Stack>
//                   </Stack>

//                   {/* md tools */}
//                   {mdTools}
//                 </Stack>

//                 {/* text editor */}
//                 {!isDeckMode &&
//                   currentSlide.type === SlideTypeEnum.Markdown && (
//                     <MarkDownInput />
//                   )}

//                 {/* form */}
//                 {!isDeckMode &&
//                   currentSlide.type !== SlideTypeEnum.Markdown && (
//                     <Box
//                       sx={{
//                         //backgroundColor: toolsBgColor,
//                         minHeight: '480px',
//                         // maxHeight: `calc(100vh-100px)`,
//                         flexGrow: 1,
//                         overflowY: 'auto',
//                       }}
//                     >
//                       <form
//                         className="form"
//                         data-testid="current-slide-form"
//                         onSubmit={muteSubmit}
//                       >
//                         <SlideDisplayForm />
//                       </form>
//                     </Box>
//                   )}
//               </Box>
//             </Panel>
//             <PanelResizeHandle
//               style={{
//                 width: 4,
//                 backgroundColor: '#232323',
//               }}
//             />
//             <Panel>
//               {/* Right Slide Display & Nav */}
//               <div
//                 style={{
//                   width: '100%',
//                   height: '100%',
//                   overflow: 'auto',
//                 }}
//               >
//                 {getSlide(auProps)}
//               </div>
//             </Panel>
//           </PanelGroup>
//         </Box>
//       )}
//     </div>
//   );
// }

// export default CourseBuilder;

// function LanguageButton({ label, onClick }: { label: string; onClick: any }) {
//   return (
//     <Link
//       id={label}
//       className="crumb-text"
//       component="button"
//       gutterBottom={false}
//       sx={{
//         fontSize: '14px',
//         margin: '0px',
//         padding: '0px',
//         height: 'auto',
//         textDecoration: 'none',
//         color: (theme: any) => `${theme.breadcrumbs.underline}`,
//       }}
//       onClick={() => onClick(label)}
//     >
//       {label}
//     </Link>
//   );
// }
