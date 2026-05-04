
import { useCellValue, usePublisher } from '@mdxeditor/gurx'
import { MUIButtonWithTooltip } from './MUIButtonWithTooltip'
import { iconComponentFor$, useTranslation } from '@mdxeditor/editor'
import { openLinkEditDialog$ } from '../../plugins/link-dialog'

/**
 * A toolbar component that opens the link edit dialog.
 * For this component to work, you must include the `linkDialogPlugin`.
 * @group Toolbar Components
 */
export const InsertLink = () => {
  const openLinkDialog = usePublisher(openLinkEditDialog$)
  const iconComponentFor = useCellValue(iconComponentFor$)
  const t = useTranslation()
  return (
    <MUIButtonWithTooltip
      aria-label={t('toolbar.link', 'Insert Hyperlink')}
      title={t('toolbar.link', 'Insert Hyperlink')}
      onClick={(_) => {
        openLinkDialog()
      }}
    >
      {iconComponentFor('link')}
    </MUIButtonWithTooltip>
  )
}
