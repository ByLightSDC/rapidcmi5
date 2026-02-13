import { VideoPlaceholder } from './VideoPlaceholder';
import { $wrapNodeInElement, mergeRegister } from '@lexical/utils';
import {
  Action,
  Cell,
  Signal,
  map,
  mapTo,
  withLatestFrom,
} from '@mdxeditor/gurx';
import {
  $createParagraphNode,
  $createRangeSelection,
  $getNodeByKey,
  $getSelection,
  $insertNodes,
  $isNodeSelection,
  $isRootOrShadowRoot,
  $setSelection,
  COMMAND_PRIORITY_CRITICAL,
  COMMAND_PRIORITY_EDITOR,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_LOW,
  DRAGOVER_COMMAND,
  DRAGSTART_COMMAND,
  DROP_COMMAND,
  LexicalCommand,
  LexicalEditor,
  PASTE_COMMAND,
  createCommand,
} from 'lexical';

import {
  realmPlugin,
  activeEditor$,
  addComposerChild$,
  addExportVisitor$,
  addImportVisitor$,
  addLexicalNode$,
  createActiveEditorSubscription$,
} from '@mdxeditor/editor';

import { EditVideoToolbar, EditVideoToolbarProps } from './EditVideoToolbar';
import { VideoDialog } from './VideoDialog';
import {
  $createVideoNode,
  $isVideoNode,
  CreateVideoNodeParameters,
  VideoNode,
} from './VideoNode';
import { LexicalVideoVisitor } from './LexicalVideoVisitor';
import {
  MdastHtmlVideoVisitor,
  MdastJsxVideoVisitor,
} from './MdastVideoVisitor';
import { MdxJsxAttribute, MdxJsxExpressionAttribute } from 'mdast-util-mdx-jsx';

export * from './VideoNode';

export const CAN_USE_DOM: boolean =
  typeof window !== 'undefined' &&
  typeof window.document.createElement !== 'undefined';

/**
 * @group Video
 */
export type VideoUploadHandler = ((video: File) => Promise<string>) | null;

/**
 * @group Video
 */
export type VideoPreviewHandler =
  | ((videoSource: string) => Promise<string>)
  | null;

interface BaseVideoParameters {
  title?: string;
}

/**
 * @group Video
 */
export interface FileVideoParameters extends BaseVideoParameters {
  file: File;
}

/**
 * @group Video
 */
export interface SrcVideoParameters extends BaseVideoParameters {
  src: string;
  rest?: (MdxJsxAttribute | MdxJsxExpressionAttribute)[];
  width?: number;
  height?: number;
  autoplay?: boolean;
}

/**
 * @group Video
 */
export type InsertVideoParameters = FileVideoParameters | SrcVideoParameters;

/**
 * @group Video
 */
export interface SaveVideoParameters extends BaseVideoParameters {
  src?: string;
  file?: FileList;
  rest?: (MdxJsxAttribute | MdxJsxExpressionAttribute)[];
  width?: number; // undefined means 'inherit'
  height?: number; // undefined means 'inherit'
  autoplay?: boolean;
}

/**
 * The state of the video dialog when it is inactive.
 * @group Video
 */
export interface InactiveVideoDialogState {
  type: 'inactive';
}

/**
 * The state of the video dialog when it is in new mode.
 * @group Video
 */
export interface NewVideoDialogState {
  type: 'new';
}

/**
 * The state of the video dialog when it is editing an existing node.
 * @group Video
 */
export interface EditingVideoDialogState {
  type: 'editing';
  nodeKey: string;
  initialValues: Omit<SaveVideoParameters, 'file'> & {
    width?: number | 'inherit';
    height?: number | 'inherit';
  };
}

const internalInsertVideo$ = Signal<SrcVideoParameters>((r) => {
  r.sub(
    r.pipe(internalInsertVideo$, withLatestFrom(activeEditor$)),
    ([values, theEditor]) => {
      theEditor?.update(() => {
        const videoNode = $createVideoNode({
          src: values.src,
          title: values.title ?? '',
          rest: values.rest ?? [],
          width: values.width,
          height: values.height,
          autoplay: values.autoplay,
        });
        $insertNodes([videoNode]);
        if ($isRootOrShadowRoot(videoNode.getParentOrThrow())) {
          $wrapNodeInElement(videoNode, $createParagraphNode).selectEnd();
        }
      });
    },
  );
});

/**
 * A signal that inserts a new video node with the published payload.
 * @group Video
 */
export const insertVideo$ = Signal<InsertVideoParameters>((r) => {
  r.sub(
    r.pipe(insertVideo$, withLatestFrom(videoUploadHandler$)),
    ([values, videoUploadHandler]) => {
      const handler = (src: string) => {
        r.pub(internalInsertVideo$, { ...values, src });
      };

      if ('file' in values) {
        videoUploadHandler?.(values.file)
          .then(handler)
          .catch((e: unknown) => {
            throw e;
          });
      } else {
        handler(values.src);
      }
    },
  );
});

/**
 * Holds the path for local file reading and writing.
 */
export const videoFilePath$ = Cell<string>('');

/**
 * Holds the autocomplete suggestions for video sources.
 * @group Video
 */
export const videoAutocompleteSuggestions$ = Cell<string[]>([]);

/**
 * Holds the disable video resize configuration flag.
 * @group Video
 */
export const disableVideoResize$ = Cell<boolean>(false);

/**
 * Holds the video upload handler callback.
 * @group Video
 */
export const videoUploadHandler$ = Cell<VideoUploadHandler>(null);

/**
 * Holds the video preview handler callback.
 * @group Video
 */
export const videoPreviewHandler$ = Cell<VideoPreviewHandler>(null);

/**
 * Holds the video placeholder.
 * @group Video
 */
export const videoPlaceholder$ = Cell<typeof VideoPlaceholder | null>(null);

/**
 * Holds the current state of the video dialog.
 * @group Video
 */
export const videoDialogState$ = Cell<
  InactiveVideoDialogState | NewVideoDialogState | EditingVideoDialogState
>({ type: 'inactive' }, (r) => {
  r.sub(
    r.pipe(
      saveVideo$,
      withLatestFrom(activeEditor$, videoUploadHandler$, videoDialogState$),
    ),
    ([values, theEditor, videoUploadHandler, dialogState]) => {
      const handler =
        dialogState.type === 'editing'
          ? (src: string) => {
              theEditor?.update(() => {
                const { nodeKey } = dialogState;
                const videoNode = $getNodeByKey(nodeKey)! as VideoNode;

                videoNode.setTitle(values.title);
                videoNode.setSrc(src);
                videoNode.setRest(values.rest);
                videoNode.setWidthAndHeight(
                  values.width ?? 'inherit',
                  values.height ?? 'inherit',
                );
                videoNode.setAutoplay(values.autoplay ?? false);
              });
              r.pub(videoDialogState$, { type: 'inactive' });
            }
          : (src: string) => {
              r.pub(internalInsertVideo$, { ...values, src });
              r.pub(videoDialogState$, { type: 'inactive' });
            };

      if (values.file && values.file.length > 0) {
        videoUploadHandler?.(values.file.item(0)!)
          .then(handler)
          .catch((e: unknown) => {
            throw e;
          });
      } else if (values.src) {
        handler(values.src);
      }
    },
  );

  r.pub(createActiveEditorSubscription$, (editor) => {
    const theUploadHandler = r.getValue(videoUploadHandler$);
    return mergeRegister(
      editor.registerCommand<InsertVideoPayload>(
        INSERT_VIDEO_COMMAND,
        (payload) => {
          const videoNode = $createVideoNode(payload);
          $insertNodes([videoNode]);
          if ($isRootOrShadowRoot(videoNode.getParentOrThrow())) {
            $wrapNodeInElement(videoNode, $createParagraphNode).selectEnd();
          }

          return true;
        },
        COMMAND_PRIORITY_EDITOR,
      ),
      editor.registerCommand<DragEvent>(
        DRAGSTART_COMMAND,
        (event) => {
          return onDragStart(event);
        },
        COMMAND_PRIORITY_HIGH,
      ),
      editor.registerCommand<DragEvent>(
        DRAGOVER_COMMAND,
        (event) => {
          return onDragover(event, !!theUploadHandler);
        },
        COMMAND_PRIORITY_LOW,
      ),

      editor.registerCommand<DragEvent>(
        DROP_COMMAND,
        (event) => {
          return onDrop(event, editor, r.getValue(videoUploadHandler$));
        },
        COMMAND_PRIORITY_HIGH,
      ),
      editor.registerCommand(
        PASTE_COMMAND,
        (event: ClipboardEvent) => {
          if (!theUploadHandler) {
            return false;
          }

          const cbPayload = Array.from(event.clipboardData?.items ?? []);
          const videoItems = cbPayload.filter((item) =>
            item.type.includes('video'),
          );

          if (videoItems.length === 0) {
            return false;
          }

          const videoUploadHandlerValue = r.getValue(videoUploadHandler$)!;

          Promise.all(
            videoItems.map((file) =>
              videoUploadHandlerValue(file.getAsFile()!),
            ),
          )
            .then((urls) => {
              urls.forEach((url) => {
                editor.dispatchCommand(INSERT_VIDEO_COMMAND, {
                  src: url,
                  title: '',
                });
              });
            })
            .catch((e: unknown) => {
              throw e;
            });
          return true;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
    );
  });
});

/**
 * Opens the new video dialog.
 * @group Video
 */
export const openNewVideoDialog$ = Action((r) => {
  r.link(
    r.pipe(openNewVideoDialog$, mapTo({ type: 'new' })),
    videoDialogState$,
  );
});

/**
 * Opens the edit video dialog with the published parameters.
 * @group Video
 */
export const openEditVideoDialog$ = Signal<
  Omit<EditingVideoDialogState, 'type'>
>((r) => {
  r.link(
    r.pipe(
      openEditVideoDialog$,
      map((payload) => ({ type: 'editing' as const, ...payload })),
    ),
    videoDialogState$,
  );
});

/**
 * Close the video dialog.
 * @group Video
 */
export const closeVideoDialog$ = Action((r) => {
  r.link(
    r.pipe(closeVideoDialog$, mapTo({ type: 'inactive' })),
    videoDialogState$,
  );
});

export const disableVideoSettingsButton$ = Cell<boolean>(false);

/**
 * Saves the data from the video dialog
 * @group Video
 */
export const saveVideo$ = Signal<SaveVideoParameters>();

/**
 * Holds the custom EditVideoToolbar component.
 * @group Video
 */
export const editVideoToolbarComponent$ =
  Cell<React.FC<EditVideoToolbarProps>>(EditVideoToolbar);

/**
 * A plugin that adds support for videos.
 * @group Video
 */
export const videoPlugin = realmPlugin<{
  videoUploadHandler?: VideoUploadHandler;
  videoAutocompleteSuggestions?: string[];
  disableVideoResize?: boolean;
  disableVideoSettingsButton?: boolean;
  videoPreviewHandler?: VideoPreviewHandler;
  VideoDialog?: (() => JSX.Element) | React.FC;
  EditVideoToolbar?: (() => JSX.Element) | React.FC;
  videoPlaceholder?: (() => JSX.Element) | null;
  videoFilePath?: string;
}>({
  init(realm, params) {
    realm.pubIn({
      [addImportVisitor$]: [MdastHtmlVideoVisitor, MdastJsxVideoVisitor],
      [addLexicalNode$]: VideoNode,
      [addExportVisitor$]: LexicalVideoVisitor,
      [addComposerChild$]: params?.VideoDialog ?? VideoDialog,
      [videoUploadHandler$]: params?.videoUploadHandler ?? null,
      [videoAutocompleteSuggestions$]:
        params?.videoAutocompleteSuggestions ?? [],
      [disableVideoResize$]: Boolean(params?.disableVideoResize),
      [disableVideoSettingsButton$]: Boolean(
        params?.disableVideoSettingsButton,
      ),
      [videoPreviewHandler$]: params?.videoPreviewHandler ?? null,
      [editVideoToolbarComponent$]:
        params?.EditVideoToolbar ?? EditVideoToolbar,
      [videoPlaceholder$]: params?.videoPlaceholder ?? VideoPlaceholder,
      [videoFilePath$]: params?.videoFilePath,
    });
  },

  update(realm, params) {
    realm.pubIn({
      [videoUploadHandler$]: params?.videoUploadHandler ?? null,
      [videoAutocompleteSuggestions$]:
        params?.videoAutocompleteSuggestions ?? [],
      [disableVideoResize$]: Boolean(params?.disableVideoResize),
      [videoPreviewHandler$]: params?.videoPreviewHandler ?? null,
      [editVideoToolbarComponent$]:
        params?.EditVideoToolbar ?? EditVideoToolbar,
      [videoPlaceholder$]: params?.videoPlaceholder ?? VideoPlaceholder,
      [videoFilePath$]: params?.videoFilePath,
    });
  },
});

/** @internal */
export type InsertVideoPayload = Readonly<CreateVideoNodeParameters>;

const getDOMSelection = (targetWindow: Window | null): Selection | null =>
  CAN_USE_DOM ? (targetWindow ?? window).getSelection() : null;

/**
 * @internal
 */
export const INSERT_VIDEO_COMMAND: LexicalCommand<InsertVideoPayload> =
  createCommand('INSERT_VIDEO_COMMAND');

const TRANSPARENT_IMAGE =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

function onDragStart(event: DragEvent): boolean {
  const node = getVideoNodeInSelection();
  if (!node) {
    return false;
  }
  const dataTransfer = event.dataTransfer;
  if (!dataTransfer) {
    return false;
  }
  dataTransfer.setData('text/plain', '_');
  const img = document.createElement('img');
  img.src = TRANSPARENT_IMAGE;
  dataTransfer.setDragImage(img, 0, 0);
  dataTransfer.setData(
    'application/x-lexical-drag',
    JSON.stringify({
      data: {
        title: node.__title,
        key: node.getKey(),
        src: node.__src,
      },
      type: 'video',
    }),
  );

  return true;
}

function onDragover(event: DragEvent, hasUploadHandler: boolean): boolean {
  if (hasUploadHandler) {
    // test if the user is dragging a file from the explorer
    let cbPayload = Array.from(event.dataTransfer?.items ?? []);
    cbPayload = cbPayload.filter((i) => i.type.includes('video'));

    if (cbPayload.length > 0) {
      event.preventDefault();
      return true;
    }
  }

  // handle moving videos
  const node = getVideoNodeInSelection();
  if (!node) {
    return false;
  }
  if (!canDropVideo(event)) {
    event.preventDefault();
  }

  return true;
}

function onDrop(
  event: DragEvent,
  editor: LexicalEditor,
  videoUploadHandler: VideoUploadHandler,
): boolean {
  let cbPayload = Array.from(event.dataTransfer?.items ?? []);
  cbPayload = cbPayload.filter((i) => i.type.includes('video'));

  if (cbPayload.length > 0) {
    if (videoUploadHandler !== null) {
      event.preventDefault();
      Promise.all(
        cbPayload.map((video) => {
          if (video.kind === 'string') {
            return new Promise<string>((rs) => {
              video.getAsString(rs);
            });
          }
          return videoUploadHandler(video.getAsFile()!);
        }),
      )
        .then((urls) => {
          urls.forEach((url) => {
            editor.dispatchCommand(INSERT_VIDEO_COMMAND, {
              src: url,
              title: '',
            });
          });
        })
        .catch((e: unknown) => {
          throw e;
        });

      return true;
    }
  }

  const node = getVideoNodeInSelection();
  if (!node) {
    return false;
  }
  const data = getDragVideoData(event);

  if (!data) {
    return false;
  }

  event.preventDefault();
  if (canDropVideo(event)) {
    const range = getDragSelection(event);
    node.remove();
    const rangeSelection = $createRangeSelection();
    if (range !== null && range !== undefined) {
      rangeSelection.applyDOMRange(range);
    }
    $setSelection(rangeSelection);
    editor.dispatchCommand(INSERT_VIDEO_COMMAND, data);
  }
  return true;
}

function getVideoNodeInSelection(): VideoNode | null {
  const selection = $getSelection();
  if (!$isNodeSelection(selection)) {
    return null;
  }
  const nodes = selection.getNodes();
  const node = nodes[0];
  return $isVideoNode(node) ? node : null;
}

function getDragVideoData(event: DragEvent): null | InsertVideoPayload {
  const dragData = event.dataTransfer?.getData('application/x-lexical-drag');
  if (!dragData) {
    return null;
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { type, data } = JSON.parse(dragData);
  if (type !== 'video') {
    return null;
  }

  return data;
}

declare global {
  interface DragEvent {
    rangeOffset?: number;
    rangeParent?: Node;
  }
}

function canDropVideo(event: DragEvent): boolean {
  const target = event.target;
  return !!(target && target instanceof HTMLElement && target.parentElement);
}

function getDragSelection(event: DragEvent): Range | null | undefined {
  let range;
  const target = event.target as null | Element | Document;
  const targetWindow =
    target == null
      ? null
      : target.nodeType === 9
        ? (target as Document).defaultView
        : (target as Element).ownerDocument.defaultView;
  const domSelection = getDOMSelection(targetWindow);
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (document.caretRangeFromPoint) {
    range = document.caretRangeFromPoint(event.clientX, event.clientY);
  } else if (event.rangeParent && domSelection !== null) {
    domSelection.collapse(event.rangeParent, event.rangeOffset ?? 0);
    range = domSelection.getRangeAt(0);
  } else {
    throw Error(`Cannot get the selection when dragging`);
  }

  return range;
}
