
import { useCellValue, usePublisher } from '@mdxeditor/gurx'
import { MUIButtonWithTooltip } from './MUIButtonWithTooltip'
import { iconComponentFor$, openLinkEditDialog$, useTranslation } from '@mdxeditor/editor'

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
      aria-label={t('toolbar.link', 'Create link')}
      title={t('toolbar.link', 'Create link')}
      onClick={(_) => {
        openLinkDialog()
      }}
    >
      {iconComponentFor('link')}
    </MUIButtonWithTooltip>
  )
}
