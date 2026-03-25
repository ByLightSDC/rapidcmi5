import { createEmptyHistoryState } from '@lexical/react/LexicalHistoryPlugin.js'
import { Cell } from '@mdxeditor/editor'

export const historyState$ = Cell(createEmptyHistoryState())