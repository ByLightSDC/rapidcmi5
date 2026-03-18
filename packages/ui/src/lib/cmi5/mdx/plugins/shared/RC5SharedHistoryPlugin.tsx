import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import React from 'react'
import { historyState$ } } from '@mdxeditor/editor';
import { useCellValue } from '@mdxeditor/gurx'

export const RC5SharedHistoryPlugin = () => {
  return <HistoryPlugin externalHistoryState={useCellValue(historyState$)} />
}
