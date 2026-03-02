import React from 'react'
//import { ButtonWithTooltip } from '.././primitives/toolbar'
//import { insertCodeBlock$ } from '../../codeblock/'
import { useCellValue, usePublisher } from '@mdxeditor/gurx'
//import { iconComponentFor$, useTranslation } from '../../core'
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';
import { useTheme } from '@mui/material'
import { ButtonMinorUi } from '@rapid-cmi5/ui'

/**
 * Icons
 */
import AddIcon from '@mui/icons-material/Add';
import { ButtonWithTooltip, iconComponentFor$, insertCodeBlock$, useTranslation } from '@mdxeditor/editor';

/**
 * A toolbar button that allows the user to insert a fenced code block.
 * Once the code block is focused, you can construct a special code block toolbar for it, using the {@link ConditionalContents} primitive.
 * See the {@link ConditionalContents} documentation for an example.
 *
 * @group Toolbar Components
 */
export const InsertCodeBlock = ({ isDrawer }: { isDrawer?: boolean }) => {
  const insertCodeBlock = usePublisher(insertCodeBlock$)
  const iconComponentFor = useCellValue(iconComponentFor$)
  const t = useTranslation()
  const theme = useTheme();

  return (
      <>
          {isDrawer ? (
            <ButtonMinorUi
              title="Insert Code Block"
              aria-label="insert-code-block"
              startIcon={
                <>
                  <AddIcon
                    fontSize="large"
                    sx={{
                      color: theme.palette.primary.main,
                      fill: theme.palette.primary.main,
                    }}
                  />
                  <IntegrationInstructionsIcon
                    fontSize="small"
                    sx={{ fill: theme.palette.primary.main, marginRight: 1 }}
                  />
                </>
              }
              sx={{
                display: 'flex',
                justifyContent: 'flex-start',
                alignItems: 'center',
                padding: 1,
              }}
              onClick={() => {
                 insertCodeBlock({})
              }}
            >
              Code Block
            </ButtonMinorUi>
          ) : (
            <ButtonWithTooltip
              title="Insert Code Block"
              aria-label="insert-code-block"
              onClick={() => {
                 insertCodeBlock({})
              }}
            >
              <IntegrationInstructionsIcon fontSize="small" />
            </ButtonWithTooltip>
          )}
        </>
    // <ButtonWithTooltip
    //   title={t('toolbar.codeBlock', 'Insert Code Block')}
    //   onClick={() => {
    //     insertCodeBlock({})
    //   }}
    // >
    //   {iconComponentFor('frame_source')}
    // </ButtonWithTooltip>
  )
}
