import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { useCellValue } from '@mdxeditor/gurx'
import { historyState$ } from './vars'

export const RC5SharedHistoryPlugin = () => {
  return <HistoryPlugin externalHistoryState={useCellValue(historyState$)} />
}
