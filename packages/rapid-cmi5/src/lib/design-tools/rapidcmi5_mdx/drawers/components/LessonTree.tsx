/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */

import './lesson-tree.css';
import TreeView, { INode, ITreeViewOnExpandProps, NodeId } from 'react-accessible-treeview';
import { IFlatMetadata } from 'react-accessible-treeview/dist/TreeView/utils';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addASlide, currentAuPath, deleteSlide, navigateSlide } from '../../../../redux/courseBuilderReducer';
import AddIcon from '@mui/icons-material/Add';

import { AppDispatch } from '../../../../redux/store';

//REF if we want to change colors
// import './tree-view.css';
import { useCourseData } from '../../data-hooks/useCourseData';
import {
  ILessonNode,
  ILessonNodeSelectProps,
  LessonNodeActionEnum,
  LessonTreeNode,
  SlideNodeActionEnum,
} from './LessonTreeNode';
import {
  CourseData,
  defaultSlideContent,
  MoveOnCriteriaEnum,
  LessonTheme,
  SlideTypeEnum,
} from '@rapid-cmi5/cmi5-build-common';

import { RC5Context } from '../../contexts/RC5Context';
import { useRC5Prompts } from '../../modals/useRC5Prompts';
import { Renamer } from './Renamer';
import { MoveOnCriteriaForm } from './MoveOnCriteriaForm';
import { DndProvider } from 'react-dnd';
import { LessonSettingsForm } from './LessonSettingsForm';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { GitContext } from '../../../course-builder/GitViewer/session/GitContext';
import { currentRepoAccessObjectSel } from '../../../../redux/repoManagerReducer';
import { slugifyPath } from '../../../course-builder/GitViewer/utils/useCourseOperationsUtils';
import { ButtonMinorUi, useToaster } from '@rapid-cmi5/ui';
import { Divider } from '@mui/material';
import { Box, minWidth } from '@mui/system';

const textColor = 'text.hint';

interface LessonTreeViewProps {
  courseData?: CourseData;
  courses?: CourseData[];
  isReadOnly?: boolean;
  paddingBase?: number;
  onCreateLesson?: () => void;
}

export enum LessonTreeNodeType {
  Root,
  Course,
  Block,
  Lesson,
  Slide,
}

function LessonTree({ courseData, isReadOnly = false, paddingBase = 12, onCreateLesson }: LessonTreeViewProps) {
  const { changeLesson, currentAuIndex, currentSlideIndex, handleReorderSlide, handleReorderLesson } = useCourseData();
  const { changeLessonMoveOn, changeLessonName, changeSlideName, saveSlide, changeLessonTheme } =
    useContext(RC5Context);
  const repoAccessObject = useSelector(currentRepoAccessObjectSel);

  const dispatch = useDispatch<AppDispatch>();
  const displayToaster = useToaster();
  const [treeData, setTreeData] = useState<INode<IFlatMetadata>[]>([]);
  const currentExpandedNodes = useRef<NodeId[]>([]);
  const { promptDeleteLesson, promptCreateLesson } = useRC5Prompts();
  const currentAuDir = useSelector(currentAuPath);
  const { handleGetUniqueFilePath } = useContext(GitContext);

  const [menuNode, setMenuNode] = useState<ILessonNode | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<any>(null);
  const [menuAnchorPos, setMenuAnchorPos] = useState<number[]>([0, 0]);
  const [moveOnCriteriaForm, setMoveOnCriteriaForm] = useState<ILessonNode | null>(null);
  const [lessonSettingsForm, setLessonSettingsForm] = useState<ILessonNode | null>(null);

  const handleMoveOn = (moveOn: MoveOnCriteriaEnum) => {
    if (moveOnCriteriaForm) {
      changeLessonMoveOn(moveOn, moveOnCriteriaForm);
    }
    setMoveOnCriteriaForm(null);
    displayToaster({
      message: `Move on criteria for AU changed to ${moveOn.replace('-', ' ')}`,
      severity: 'success',
    });
  };

  const handleLessonSettings = (theme: LessonTheme) => {
    if (lessonSettingsForm) {
      changeLessonTheme(theme, lessonSettingsForm);
    }
    setLessonSettingsForm(null);
    displayToaster({
      message: 'Lesson settings updated',
      severity: 'success',
    });
  };

  const handleRename = (newName: string, element: ILessonNode) => {
    if (element.type === LessonTreeNodeType.Slide) {
      changeSlideName(newName, element);
    } else if (element.type === LessonTreeNodeType.Lesson) {
      changeLessonName(newName, element);
    }
  };

  /**
   *
   * @param element Node context menu action
   * @param whichAction
   */
  const handleNodeAction = async (event: any, element: ILessonNode, whichAction: number) => {
    // debugLog('onAction', element);
    if (element.type === LessonTreeNodeType.Lesson) {
      switch (whichAction) {
        case LessonNodeActionEnum.TriggerRename:
          setMenuAnchorPos([event.clientX - 60, event.clientY + 20]);
          setMenuNode(element);
          break;
        case LessonNodeActionEnum.AddSlide:
          saveSlide(); //save before navigating away from this slide
          // eslint-disable-next-line no-case-declarations
          const slideTitle = `Slide ${element.children.length + 1}`;

          if (!repoAccessObject) return;

          dispatch(
            addASlide({
              content: defaultSlideContent,
              display: defaultSlideContent,
              slideTitle: slideTitle,
              type: SlideTypeEnum.Markdown,
              filepath: await handleGetUniqueFilePath(repoAccessObject, slugifyPath(slideTitle), currentAuDir || ''),
            }),
          );

          break;
        case LessonNodeActionEnum.Rename:
          setMenuAnchor(event.target);
          break;

        case LessonNodeActionEnum.LessonSettings:
          setLessonSettingsForm(element);
          break;

        case LessonNodeActionEnum.SetMoveOnCriteria:
          setMoveOnCriteriaForm(element);
          break;
        case LessonNodeActionEnum.Delete:
          promptDeleteLesson(element.name, element.id as number);
          break;
      }
    }
    if (element.type === LessonTreeNodeType.Slide) {
      switch (whichAction) {
        case SlideNodeActionEnum.Delete:
          if ((courseData?.blocks[0]?.aus[element.parent as number]?.slides.length || 0) > 1) {
            if (element.slide !== undefined && element.lesson !== undefined) {
              dispatch(
                deleteSlide({
                  slideIndex: element.slide,
                  lessonIndex: element.lesson,
                }),
              );
            }
          }

          // deleteASlide(element.name);
          break;
        case SlideNodeActionEnum.TriggerRename:
          setMenuAnchorPos([event.clientX - 60, event.clientY + 20]);
          setMenuNode(element);
          break;
        case SlideNodeActionEnum.Rename:
          setMenuAnchor(event.target);
          break;
        //REF maybe future?
        // case SlideNodeActionEnum.SetMoveOnCriteria:
        //   console.log('setMoveOnCriteria');
        //   setMoveOnCriteriaForm(element);
        //   break;
      }
    }
  };

  /**
   * Loads slide and lesson if applicable
   * @param param0
   */
  const handleNodeSelect = ({ element, isSelected, isBranch }: ILessonNodeSelectProps) => {
    if (
      element.type === LessonTreeNodeType.Slide &&
      typeof element.block !== 'undefined' &&
      typeof element.lesson !== 'undefined'
    ) {
      if (currentAuIndex !== element.lesson) {
        const blockName = courseData?.blocks[element.block].blockName;
        const lessonName = courseData?.blocks[element.block]?.aus?.[element.lesson]?.auName;
        if (blockName && lessonName) {
          if (!currentExpandedNodes.current.includes(element.lesson)) {
            currentExpandedNodes.current.push(element.lesson);
          }
          //promptChangeLesson(blockName, lessonName, element.slide);
          changeLesson(blockName, lessonName, element.slide);
        }
      } else {
        if (typeof element.slide !== 'undefined') {
          saveSlide();
          dispatch(navigateSlide(element.slide));
        }
      }
    }
  };

  /**
   * Keeps track of which node(s) are currently expanded for the current repo
   * @param {ITreeViewOnExpandProps} props props from OnExpand callback of TreeView
   */
  const handleNodeExpand = ({
    element,
    isExpanded,
    isSelected,
    isHalfSelected,
    isDisabled,
    treeState,
  }: ITreeViewOnExpandProps) => {
    const currentlyExpanded: NodeId[] = [...currentExpandedNodes.current];
    if (isExpanded) {
      if (!currentlyExpanded.includes(element.id)) {
        currentlyExpanded.push(element.id);
      }
    } else {
      const foundIndex = currentlyExpanded.findIndex((id) => id === element.id);
      if (foundIndex >= 0) {
        currentlyExpanded.splice(foundIndex, 1);
      }
    }

    currentExpandedNodes.current = currentlyExpanded;
  };

  const handleCancel = () => {
    setMenuAnchor(null);
  };

  /**
   * UE recreates tree data when course data changes
   */
  useEffect(() => {
    if (courseData && courseData.blocks) {
      const theLessons: number[] = [];
      const theTreeData = [];

      const theCourse = {
        id: courseData.courseId,
        name: courseData.courseTitle,
        children: theLessons,
        parent: null,
        isBranch: true,
        type: LessonTreeNodeType.Course,
      };

      currentExpandedNodes.current = [currentAuIndex];
      // if (!currentExpandedNodes.current.includes(currentAuIndex)) {
      //   currentExpandedNodes.current.push(currentAuIndex);
      // }

      let theSlidesChildren: string[] = [];
      theTreeData.push(theCourse);

      for (let i = 0; i < courseData.blocks.length; i++) {
        const currentBlock = courseData.blocks[i];
        if (!currentBlock || !currentBlock.aus) {
          continue; // Skip this block if it doesn't have aus
        }
        for (let j = 0; j < currentBlock.aus.length; j++) {
          theSlidesChildren = [];
          const lessonId = j;
          const currentAu = currentBlock.aus[j];
          if (!currentAu || !currentAu.slides) {
            continue; // Skip this AU if it doesn't have slides
          }

          const lesson = {
            id: lessonId,
            name: currentAu.auName,
            children: theSlidesChildren,
            parent: courseData.courseId,
            isBranch: true,
            type: LessonTreeNodeType.Lesson,
            block: i,
          };
          theLessons.push(lessonId);
          theTreeData.push(lesson);

          const theSlides = currentAu.slides;
          for (let k = 0; k < theSlides.length; k++) {
            const slideId = `slide-${i}-${j}-${k}`; //REF redux slides not saved to file system do not have a file path yet theSlides[k].filepath || `slide${k}`;
            const content = theSlides[k].content as string;
            const hasActivity =
              content &&
              (content.indexOf(':::scenario') >= 0 ||
                content.indexOf(':::quiz') >= 0 ||
                content.indexOf(':::ctf') >= 0 ||
                content.indexOf(':::jobe') >= 0);
            theSlidesChildren.push(slideId);
            theTreeData.push({
              id: slideId,
              name: theSlides[k].slideTitle,
              children: [],
              parent: lessonId,
              isBranch: false,
              type: LessonTreeNodeType.Slide,
              lesson: j,
              block: i,
              slide: k,
              hasActivity: hasActivity,
            });
          }
        }
        //REF
        // console.log('theTreeData', theTreeData);
        setTreeData(theTreeData);
      }
    }
  }, [courseData]);

  /**
   * UE will select slide
   */
  useEffect(() => {
    // expand current selected lesson if it is not already expanded
    if (!currentExpandedNodes.current.includes(currentAuIndex)) {
      const currentlyExpanded: NodeId[] = [...currentExpandedNodes.current];
      currentlyExpanded.push(currentAuIndex);
      currentExpandedNodes.current = currentlyExpanded;
    }
  }, [currentSlideIndex, currentAuIndex, courseData?.courseId]);

  const moveNode = useCallback((drag: ILessonNode, hover: ILessonNode) => {
    // === Lesson Reordering ===
    if (drag.type === LessonTreeNodeType.Lesson && hover.type === LessonTreeNodeType.Lesson) {
      if (drag.id === undefined || hover.id === undefined) return;
      if (drag.id === hover.id) return;
      handleReorderLesson(drag.id as number, hover.id as number);
      return;
    }

    // === Slide Reordering (within same lesson) ===
    if (
      drag.type === LessonTreeNodeType.Slide &&
      hover.type === LessonTreeNodeType.Slide &&
      drag.lesson === hover.lesson
    ) {
      if (drag.lesson === undefined || drag.slide === undefined || hover.slide === undefined) return;

      if (drag.slide === hover.slide) return;

      handleReorderSlide(drag.lesson, drag.lesson, drag.slide, hover.slide);
      return;
    }

    // === FUTURE Slide Move to Another Lesson ===
    if (drag.type === LessonTreeNodeType.Slide && hover.type === LessonTreeNodeType.Lesson) {
      if (drag.lesson === undefined || drag.slide === undefined || hover.id === undefined) return;

      if (hover.id === drag.lesson) {
        return;
      }

      // handleReorderSlide(drag.lesson, hover.id as number, drag.slide, 0); // Drop at top for now (you can enhance)
      return;
    }
  }, []);
  return (
    <>
      <DndProvider backend={HTML5Backend}>
        <Box
          sx={{
            height: '100%', // IMPORTANT: parent must have a height
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0, // IMPORTANT for overflow in flex children
          }}
        >
          <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
            {/* only show the tree when there is data to show to prevent errors while in process of switching repos - tree not yet filled in */}
            {treeData.length > 1 && (
              <div
                className="directory"
                style={{
                  color: textColor,
                }}
              >
                <TreeView
                  data={treeData}
                  aria-label="directory tree"
                  data-testid="course-tree"
                  onNodeSelect={handleNodeSelect}
                  onExpand={handleNodeExpand}
                  defaultExpandedIds={currentExpandedNodes.current}
                  //expandedIds={currentExpandedNodes.current}
                  selectedIds={[]}
                  nodeRenderer={({ element, isBranch, isExpanded, getNodeProps, level }) => (
                    <div
                      {...getNodeProps()}
                      style={{
                        marginTop: '2px',
                        paddingLeft: paddingBase * (level - 1),
                      }}
                    >
                      <LessonTreeNode
                        key={element.id.toString() + '/' + (element.parent || 0).toString()}
                        data-testid={'slide-node-' + element.id.toString() + '/' + (element.parent || 0).toString()}
                        isOpen={isExpanded}
                        element={element}
                        isReadOnly={isReadOnly}
                        currentLesson={currentAuIndex}
                        currentSlide={currentSlideIndex}
                        onAction={handleNodeAction}
                        moveNode={moveNode}
                      />
                    </div>
                  )}
                />
                {menuAnchor && (
                  <Renamer
                    anchor={menuAnchor}
                    anchorPos={menuAnchorPos}
                    element={menuNode}
                    onClose={handleCancel}
                    onSave={handleRename}
                  />
                )}
                {moveOnCriteriaForm && (
                  <MoveOnCriteriaForm
                    handleCloseModal={() => {
                      setMoveOnCriteriaForm(null);
                    }}
                    handleModalAction={handleMoveOn}
                    currentMoveOn={
                      moveOnCriteriaForm.id !== undefined && moveOnCriteriaForm.block !== undefined
                        ? courseData?.blocks?.[moveOnCriteriaForm.block]?.aus?.[moveOnCriteriaForm.id as number]
                            ?.moveOnCriteria
                        : undefined
                    }
                  />
                )}
                {lessonSettingsForm && (
                  <LessonSettingsForm
                    handleCloseModal={() => {
                      setLessonSettingsForm(null);
                    }}
                    handleModalAction={handleLessonSettings}
                    currentTheme={
                      lessonSettingsForm.id !== undefined && lessonSettingsForm.block !== undefined
                        ? courseData?.blocks?.[lessonSettingsForm.block]?.aus?.[lessonSettingsForm.id as number]
                            ?.lessonTheme
                        : undefined
                    }
                  />
                )}
              </div>
            )}
          </Box>
          {onCreateLesson && (
            <>
              <Divider sx={{ mt: 'auto' }} />
              <Box
                sx={{
                  mt: 'auto',
                  borderTop: 1,
                  borderColor: 'divider',
                  p: 1.5,
                }}
              >
                <ButtonMinorUi
                  startIcon={<AddIcon />}
                  sxProps={{
                    width: '100%',
                    justifyContent: 'center',
                    px: 1,
                    fontWeight: 700,
                    minWidth: 200,
                  }}
                  onClick={onCreateLesson}
                  data-testid="create-lesson-button"
                >
                  Create Lesson
                </ButtonMinorUi>
              </Box>
            </>
          )}
        </Box>
      </DndProvider>
    </>
  );
}

export default LessonTree;
