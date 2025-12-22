import { AudioPlaceholder } from './AudioPlaceholder';
import { $wrapNodeInElement } from '@lexical/utils';
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
  $getNodeByKey,
  $insertNodes,
  $isRootOrShadowRoot,
  COMMAND_PRIORITY_EDITOR,
  LexicalCommand,
  createCommand,
} from 'lexical';

import {
  realmPlugin,
  activeEditor$,
  addComposerChild$,
  addExportVisitor$,
  addImportVisitor$,
  addLexicalNode$,
} from '@mdxeditor/editor';

import { EditAudioToolbar, EditAudioToolbarProps } from './EditAudioToolbar';
import { AudioDialog } from './AudioDialog';
import {
  $createAudioNode,
  CreateAudioNodeParameters,
  AudioNode,
} from './AudioNode';
import { LexicalAudioVisitor } from './LexicalAudioVisitor';
import {
  MdastHtmlAudioVisitor,
  MdastJsxAudioVisitor,
} from './MdastAudioVisitor';
import { MdxJsxAttribute, MdxJsxExpressionAttribute } from 'mdast-util-mdx-jsx';

export * from './AudioNode';

/**
 * @group Audio
 */
export type AudioUploadHandler = ((audio: File) => Promise<string>) | null;

/**
 * @group Audio
 */
export type AudioPreviewHandler =
  | ((audioSource: string) => Promise<string>)
  | null;

interface BaseAudioParameters {
  title?: string;
}

/**
 * @group Audio
 */
export interface FileAudioParameters extends BaseAudioParameters {
  file: File;
}

/**
 * @group Audio
 */
export interface SrcAudioParameters extends BaseAudioParameters {
  src: string;
  rest?: (MdxJsxAttribute | MdxJsxExpressionAttribute)[];
}

/**
 * @group Audio
 */
export type InsertAudioParameters = FileAudioParameters | SrcAudioParameters;

/**
 * @group Audio
 */
export interface SaveAudioParameters extends BaseAudioParameters {
  src?: string;
  file?: FileList;
  rest?: (MdxJsxAttribute | MdxJsxExpressionAttribute)[];
}

/**
 * The state of the audio dialog when it is inactive.
 * @group Audio
 */
export interface InactiveAudioDialogState {
  type: 'inactive';
}

/**
 * The state of the audio dialog when it is in new mode.
 * @group Audio
 */
export interface NewAudioDialogState {
  type: 'new';
}

/**
 * The state of the audio dialog when it is editing an existing node.
 * @group Audio
 */
export interface EditingAudioDialogState {
  type: 'editing';
  nodeKey: string;
  initialValues: Omit<SaveAudioParameters, 'file'>;
}

const internalInsertAudio$ = Signal<SrcAudioParameters>((r) => {
  r.sub(
    r.pipe(internalInsertAudio$, withLatestFrom(activeEditor$)),
    ([values, theEditor]) => {
      theEditor?.update(() => {
        const audioNode = $createAudioNode({
          src: values.src,
          title: values.title ?? '',
          rest: values.rest ?? [],
        });
        $insertNodes([audioNode]);
        if ($isRootOrShadowRoot(audioNode.getParentOrThrow())) {
          $wrapNodeInElement(audioNode, $createParagraphNode).selectEnd();
        }
      });
    },
  );
});

/**
 * A signal that inserts a new audio node with the published payload.
 * @group Audio
 */
export const insertAudio$ = Signal<InsertAudioParameters>((r) => {
  r.sub(
    r.pipe(insertAudio$, withLatestFrom(audioUploadHandler$)),
    ([values, audioUploadHandler]) => {
      const handler = (src: string) => {
        r.pub(internalInsertAudio$, { ...values, src });
      };

      if ('file' in values) {
        audioUploadHandler?.(values.file)
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
export const audioFilePath$ = Cell<string>('');

/**
 * Holds the audio upload handler callback.
 * @group Audio
 */
export const audioUploadHandler$ = Cell<AudioUploadHandler>(null);

/**
 * Holds the audio preview handler callback.
 * @group Audio
 */
export const audioPreviewHandler$ = Cell<AudioPreviewHandler>(null);

/**
 * Holds the audio placeholder.
 * @group Audio
 */
export const audioPlaceholder$ = Cell<typeof AudioPlaceholder | null>(null);

/**
 * Holds the current state of the audio dialog.
 * @group Audio
 */
export const audioDialogState$ = Cell<
  InactiveAudioDialogState | NewAudioDialogState | EditingAudioDialogState
>({ type: 'inactive' }, (r) => {
  r.sub(
    r.pipe(
      saveAudio$,
      withLatestFrom(activeEditor$, audioUploadHandler$, audioDialogState$),
    ),
    ([values, theEditor, audioUploadHandler, dialogState]) => {
      const handler =
        dialogState.type === 'editing'
          ? (src: string) => {
              theEditor?.update(() => {
                const { nodeKey } = dialogState;
                const audioNode = $getNodeByKey(nodeKey)! as AudioNode;

                audioNode.setTitle(values.title);
                audioNode.setSrc(src);
                audioNode.setRest(values.rest);
              });
              r.pub(audioDialogState$, { type: 'inactive' });
            }
          : (src: string) => {
              r.pub(internalInsertAudio$, { ...values, src });
              r.pub(audioDialogState$, { type: 'inactive' });
            };

      if (values.file && values.file.length > 0) {
        audioUploadHandler?.(values.file.item(0)!)
          .then(handler)
          .catch((e: unknown) => {
            throw e;
          });
      } else if (values.src) {
        handler(values.src);
      }
    },
  );
});

/**
 * Opens the new audio dialog.
 * @group Audio
 */
export const openNewAudioDialog$ = Action((r) => {
  r.link(
    r.pipe(openNewAudioDialog$, mapTo({ type: 'new' })),
    audioDialogState$,
  );
});

/**
 * Opens the edit audio dialog with the published parameters.
 * @group Audio
 */
export const openEditAudioDialog$ = Signal<
  Omit<EditingAudioDialogState, 'type'>
>((r) => {
  r.link(
    r.pipe(
      openEditAudioDialog$,
      map((payload) => ({ type: 'editing' as const, ...payload })),
    ),
    audioDialogState$,
  );
});

/**
 * Close the audio dialog.
 * @group Audio
 */
export const closeAudioDialog$ = Action((r) => {
  r.link(
    r.pipe(closeAudioDialog$, mapTo({ type: 'inactive' })),
    audioDialogState$,
  );
});

export const disableAudioSettingsButton$ = Cell<boolean>(false);

/**
 * Saves the data from the audio dialog
 * @group Audio
 */
export const saveAudio$ = Signal<SaveAudioParameters>();

/**
 * Holds the custom EditAudioToolbar component.
 * @group Audio
 */
export const editAudioToolbarComponent$ =
  Cell<React.FC<EditAudioToolbarProps>>(EditAudioToolbar);

/**
 * A plugin that adds support for audio.
 * @group Audio
 */
export const audioPlugin = realmPlugin<{
  audioUploadHandler?: AudioUploadHandler;
  disableAudioSettingsButton?: boolean;
  audioPreviewHandler?: AudioPreviewHandler;
  AudioDialog?: (() => JSX.Element) | React.FC;
  audioPlaceholder?: (() => JSX.Element) | null;
  audioFilePath?: string;
}>({
  init(realm, params) {
    realm.pubIn({
      [addImportVisitor$]: [MdastHtmlAudioVisitor, MdastJsxAudioVisitor],
      [addLexicalNode$]: AudioNode,
      [addExportVisitor$]: LexicalAudioVisitor,
      [addComposerChild$]: params?.AudioDialog ?? AudioDialog,
      [audioUploadHandler$]: params?.audioUploadHandler ?? null,
      [disableAudioSettingsButton$]: Boolean(
        params?.disableAudioSettingsButton,
      ),
      [audioPreviewHandler$]: params?.audioPreviewHandler ?? null,
      [audioPlaceholder$]: params?.audioPlaceholder ?? AudioPlaceholder,
      [audioFilePath$]: params?.audioFilePath,
    });
  },

  update(realm, params) {
    realm.pubIn({
      [audioUploadHandler$]: params?.audioUploadHandler ?? null,
      [audioPreviewHandler$]: params?.audioPreviewHandler ?? null,
      [audioPlaceholder$]: params?.audioPlaceholder ?? AudioPlaceholder,
      [audioFilePath$]: params?.audioFilePath,
    });
  },
});

/** @internal */
export type InsertAudioPayload = Readonly<CreateAudioNodeParameters>;

/**
 * @internal
 */
export const INSERT_AUDIO_COMMAND: LexicalCommand<InsertAudioPayload> =
  createCommand('INSERT_AUDIO_COMMAND');
