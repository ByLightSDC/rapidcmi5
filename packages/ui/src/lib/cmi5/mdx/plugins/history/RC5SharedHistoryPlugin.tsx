import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import React from 'react'

import { useCellValue } from '@mdxeditor/gurx'
import { historyState$ } from './vars'

export const RC5SharedHistoryPlugin = () => {
  return <HistoryPlugin externalHistoryState={useCellValue(historyState$)} />
}
