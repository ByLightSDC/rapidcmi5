/* eslint-disable react/jsx-no-useless-fragment */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { INode } from 'react-accessible-treeview/dist/TreeView/types';

/* MUI */
import {
  Box,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  TypographyOwnProps,
} from '@mui/material';
import type { Identifier } from 'dnd-core';
import { useDrag, useDrop, XYCoord } from 'react-dnd';

/**
 * Icons
 */
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import LocalActivity from '@mui/icons-material/LocalActivity';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import NewspaperOutlinedIcon from '@mui/icons-material/NewspaperOutlined';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TuneIcon from '@mui/icons-material/Tune';

import React, { useRef } from 'react';
import { ButtonOptions, RowAction } from '@rapid-cmi5/ui';
import { ITreeViewOnNodeSelectProps } from 'react-accessible-treeview';
import { LessonTreeNodeType } from './LessonTree';

interface NodeProps {
  isOpen: boolean;
  isReadOnly?: boolean;
  element: ILessonNode; //INode<IFlatMetadata>;
  currentCourse?: string;
  currentLesson?: number;
  currentSlide?: number;
  onAction?: (event: any, element: any, whichAction: number) => void;
  moveNode: (dragIndex: ILessonNode, hoverIndex: ILessonNode) => void;
}

export interface ILessonNode extends INode {
  type?: LessonTreeNodeType;
  block?: number;
  name: string;
  lesson?: number;
  slide?: number;
  hasActivity?: boolean;
}

export interface ILessonNodeSelectProps extends ITreeViewOnNodeSelectProps {
  element: ILessonNode;
}

export enum LessonNodeActionEnum {
  TriggerRename,
  AddSlide,
  Rename,
  SetMoveOnCriteria,
  LessonSettings,
  Delete,
}

export enum SlideNodeActionEnum {
  TriggerRename,
  Rename,
  Delete,
}

/**
 * context menu for lesson node
 */
const lessonNodeActions = [
  {
    tooltip: 'Rename Lesson',
    icon: <EditIcon color="inherit" />,
    hidden: true, // hidden for showing the edit field to rename lesson
  },
  {
    tooltip: 'Add Slide',
    icon: <NoteAddIcon color="inherit" />,
  },
  {
    tooltip: 'Rename Lesson',
    icon: <EditIcon color="inherit" />,
  },
  {
    tooltip: 'Move On Criteria',
    icon: <EmojiEventsIcon color="inherit" />,
  },
  {
    tooltip: 'Lesson Settings',
    icon: <TuneIcon color="inherit" />,
  },
  {
    tooltip: 'Delete Lesson',
    icon: <DeleteForeverIcon color="inherit" />,
  },
];

/**
 * context menu for slide node
 */
const slideNodeActions = [
  {
    tooltip: 'Rename Slide',
    icon: <EditIcon color="inherit" />,
    hidden: true,
  },
  {
    tooltip: 'Rename Slide',
    icon: <EditIcon color="inherit" />,
  },
  {
    tooltip: 'Delete Slide',
    icon: <DeleteForeverIcon color="inherit" />,
  },
];

/**
 * styles
 */
const fontStyle = { fontSize: '15px', padding: 0, lineHeight: 1 }; //fontFamily: 'monaco',
export const listItemProps: TypographyOwnProps = {
  color: 'primary',
  fontSize: 'small',
  fontWeight: 'lighter',
  textTransform: 'none',
};

export const ItemTypes = {
  lesson: 'lesson',
  slide: 'slide',
};
/**
 * Lesson Tree Node -- lessons and slides
 * @param param0
 * @returns
 */
export const LessonTreeNode: React.FC<NodeProps> = ({
  isOpen,
  isReadOnly,
  element,
  currentCourse,
  currentLesson,
  currentSlide,
  onAction,
  moveNode,
}) => {
  const [insertionDirection, setInsertionDirection] = React.useState<'above' | 'below' | null>(null);

  const ref = useRef<HTMLDivElement>(null);
  const [{ handlerId }, drop] = useDrop<ILessonNode, void, { handlerId: Identifier | null }>({
    accept: ItemTypes.slide,
    collect(monitor) {
      if (!monitor.isOver()) {
        setInsertionDirection(null);
      }
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: ILessonNode, monitor) {
      if (!ref.current || item.id === element.id) return;

      const isLesson = item.type === LessonTreeNodeType.Lesson && element.type === LessonTreeNodeType.Lesson;
      const isSlide = item.type === LessonTreeNodeType.Slide && element.type === LessonTreeNodeType.Slide;

      if (!isLesson && !isSlide) return;

      if (isSlide && item.lesson !== element.lesson) return;

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

      setInsertionDirection(hoverClientY < hoverMiddleY ? 'above' : 'below');

      // Calculate drag & hover indexes
      const dragIndex = isLesson ? (item.id as number) : (item.slide as number);
      const hoverIndex = isLesson ? (element.id as number) : (element.slide as number);

      // Prevent premature reorder
      const isDraggingUp = dragIndex > hoverIndex;
      const isDraggingDown = dragIndex < hoverIndex;

      if ((isDraggingDown && hoverClientY < hoverMiddleY) || (isDraggingUp && hoverClientY > hoverMiddleY)) {
        return;
      }
    },
    drop(item: ILessonNode, monitor) {
      if (!ref.current || item.id === element.id) return;

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;
      const insertAbove = hoverClientY < hoverMiddleY;

      // === Lesson Drop Logic ===
      if (item.type === LessonTreeNodeType.Lesson && element.type === LessonTreeNodeType.Lesson) {
        const dragLessonIndex = item.id as number;
        const hoverLessonIndex = element.id as number;
        if (dragLessonIndex === hoverLessonIndex) return;

        let dropIndex = hoverLessonIndex;
        if (!insertAbove) {
          dropIndex += 1;
        }
        if (dragLessonIndex < hoverLessonIndex) {
          dropIndex -= 1;
        }
        moveNode(item, { ...element, id: dropIndex });
        setInsertionDirection(null);
        return;
      }

      // === Slide Drop Logic ===
      if (item.type === LessonTreeNodeType.Slide && element.type === LessonTreeNodeType.Slide) {
        if (item.lesson !== element.lesson) return;

        const dragIndex = item.slide!;
        const hoverIndex = element.slide!;
        if (dragIndex === hoverIndex) return;

        let dropIndex = hoverIndex;
        if (!insertAbove) {
          dropIndex += 1;
        }
        if (dragIndex < hoverIndex) {
          dropIndex -= 1;
        }
        moveNode(item, { ...element, slide: dropIndex });
        setInsertionDirection(null);
        return;
      }
    },
  });

  const [{ isDragging, opacity }, drag] = useDrag({
    type: ItemTypes.slide,
    item: element,
    collect: (monitor) => ({
      opacity: monitor.isDragging() ? 0.5 : 1,
      isDragging: monitor.isDragging(),
    }),
  });

  const isCurrentLessonFolder = typeof currentLesson !== 'undefined' && currentLesson === element.id;

  const focusColor = 'primary.main';

  const isCurrentSlide =
    element.type === LessonTreeNodeType.Slide &&
    typeof currentLesson !== 'undefined' &&
    typeof currentSlide !== 'undefined' &&
    currentLesson === element.lesson &&
    currentSlide === element.slide;

  const expandIconTransform = isOpen ? 'rotate(180deg)' : 'rotate(90deg)';
  const insertionBar = (
    <Box
      sx={{
        height: '2px',
        opacity: opacity,
        backgroundColor: 'primary.main',
        position: 'absolute',
        left: 0,
        right: 0,
        top: insertionDirection === 'above' ? 0 : 'unset',
        bottom: insertionDirection === 'below' ? 0 : 'unset',
        zIndex: 10,
      }}
    />
  );
  drag(drop(ref));
  return (
    <Box
      ref={ref}
      data-handler-id={handlerId}
      sx={{
        position: 'relative',
        opacity: opacity,
        display: 'flex',
        justifyContent: 'space-between', //makes action icons align far right
        width: '100%',
        height: '28px', //no other way to trim vertical padding on folder icons
        color: 'text.hint',
      }}
    >
      {insertionDirection && insertionBar}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          padding: 0,
          width: '100%',
        }}
      >
        {element.isBranch && (
          <ExpandLessIcon
            sx={
              isCurrentLessonFolder
                ? {
                    transform: expandIconTransform,
                    color: focusColor,
                  }
                : { transform: expandIconTransform }
            }
          />
        )}

        {!element.isBranch && (
          <Box
            sx={{
              ...fontStyle,
              display: 'flex',
              justifyContent: 'center',
              marginLeft: '1px',
              color: (theme: any) =>
                `${element.isBranch ? theme.palette.text.hint : isCurrentSlide ? focusColor : theme.palette.text.hint}`,
            }}
          >
            {element.type === LessonTreeNodeType.Slide && element.hasActivity === true ? (
              <LocalActivity color="inherit" />
            ) : (
              <NewspaperOutlinedIcon color="inherit" />
            )}
          </Box>
        )}
        {isCurrentLessonFolder && (
          <BookmarkBorderIcon
            sx={{
              marginLeft: -1,
              padding: 0,
              color: focusColor,
            }}
          />
        )}
        <Typography
          sx={{
            ...fontStyle,
            color: (theme: any) =>
              `${element.isBranch ? (isCurrentLessonFolder ? focusColor : theme.palette.text.hint) : isCurrentSlide ? focusColor : theme.palette.text.hint}`,
          }}
        >
          {element.name}
        </Typography>

        <Box sx={{ flexGrow: 1 }} />

        {element.type === LessonTreeNodeType.Slide && (
          <ButtonOptions
            optionButton={(handleClick: any, tooltip: string) => {
              return (
                <IconButton
                  aria-label="slide options"
                  className="nodrag"
                  sx={{
                    color: 'primary',
                  }}
                  onClick={handleClick}
                >
                  <MoreVertIcon fontSize="inherit" color="primary" />
                </IconButton>
              );
            }}
            closeOnClick={true}
            onTrigger={(event?: any) => {
              if (onAction) {
                onAction(event, element, SlideNodeActionEnum.TriggerRename);
              }
            }}
          >
            <List
              sx={{
                backgroundColor: (theme: any) => `${theme.nav.fill}`,
                color: (theme: any) => `${theme.nav.icon}`,
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                height: 'auto',
              }}
              component="nav"
            >
              <Typography sx={{ marginLeft: '12px' }} variant="caption">
                {element.name}
              </Typography>
              {slideNodeActions.map((option: RowAction, index: number) => (
                // eslint-disable-next-line react/jsx-no-useless-fragment
                <>
                  {!option.hidden && (
                    <React.Fragment key={option.tooltip}>
                      <>
                        {index > 0 && <Divider />}
                        <ListItemButton
                          sx={{
                            height: 30,
                          }}
                          onClick={(event) => {
                            if (onAction) {
                              onAction(event, element, index);
                            }
                          }}
                        >
                          <ListItemIcon
                            sx={{
                              padding: '0px',
                              margin: '0px',
                              marginRight: '2px',
                              minWidth: '0px',
                            }}
                          >
                            {option.icon}
                          </ListItemIcon>
                          <ListItemText primary={option.tooltip} slotProps={{ primary: listItemProps }} />
                        </ListItemButton>
                      </>
                    </React.Fragment>
                  )}
                </>
              ))}
            </List>
          </ButtonOptions>
        )}

        {element.type === LessonTreeNodeType.Lesson && (
          <ButtonOptions
            optionButton={(handleClick: any, tooltip: string) => {
              return (
                <IconButton
                  aria-label="lesson options"
                  className="nodrag"
                  sx={{
                    color: 'primary',
                  }}
                  onClick={handleClick}
                >
                  <MoreVertIcon fontSize="inherit" color="primary" />
                </IconButton>
              );
            }}
            closeOnClick={true}
            onTrigger={(event?: any) => {
              if (onAction) {
                onAction(event, element, LessonNodeActionEnum.TriggerRename);
              }
            }}
          >
            <List
              sx={{
                backgroundColor: (theme: any) => `${theme.nav.fill}`,
                color: (theme: any) => `${theme.nav.icon}`,
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                height: 'auto',
              }}
              component="nav"
            >
              <Typography sx={{ marginLeft: '12px' }} variant="caption">
                {element.name}
              </Typography>

              {lessonNodeActions.map((option: RowAction, index: number) => {
                if (option.hidden) return null;
                // only allow add slide on current lesson
                if (index === LessonNodeActionEnum.AddSlide && !isCurrentLessonFolder) return null;
                return (
                  <React.Fragment key={option.tooltip}>
                    {index > 0 && <Divider />}
                    <ListItemButton
                      sx={{ height: 30 }}
                      onClick={(event) => {
                        if (onAction) {
                          onAction(event, element, index);
                        }
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          padding: '0px',
                          margin: '0px',
                          marginRight: '2px',
                          minWidth: '0px',
                        }}
                      >
                        {option.icon}
                      </ListItemIcon>
                      <ListItemText primary={option.tooltip} slotProps={{ primary: listItemProps }} />
                    </ListItemButton>
                  </React.Fragment>
                );
              })}
            </List>
          </ButtonOptions>
        )}
      </Box>
    </Box>
  );
};
