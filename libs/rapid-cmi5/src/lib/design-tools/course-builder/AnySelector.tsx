import { useEffect, useState } from 'react';

import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { IconButton, InputLabel, MenuItem, Tooltip } from '@mui/material';

import AddBoxIcon from '@mui/icons-material/AddBox';
import { tooltipStyle } from '../rapidcmi5_mdx/styles/styles';

/* Layout */
const fontSizeLabel = '12px';
const inputHeight = '30px';

/**
 * Selector Component for displaying children passed in
 * @returns React Component
 */
export default function AnySelector({
  id,
  children,
  theValue,
  disabled,
  hasNoOptions,
  noOptionsPlaceholder,
  optionsPlaceholder,
  iconButton = <AddBoxIcon color="inherit" />,
  iconButtonDisabled = false,
  iconButtonTooltip = 'Add',
  iconButtonHandler,
  topicLabel,
  styleProps = {},
  selectorStyleProps = { minWidth: '100px' },
}: {
  id?: string;
  topicLabel?: string;
  theValue?: string;
  children?: JSX.Element[] | null;
  disabled?: boolean;
  hasNoOptions?: boolean;
  noOptionsPlaceholder?: string;
  optionsPlaceholder?: string;
  iconButton?: JSX.Element;
  iconButtonDisabled?: boolean;
  iconButtonTooltip?: string;
  iconButtonHandler?: (event: any) => void;
  styleProps?: any;
  selectorStyleProps?: any;
  onChange?: (theSelection: string) => void;
}) {
  const [open, setOpen] = useState(false);

  /**
   * Handle Selection
   * @param {*} e
   */
  const handleSelect = (e: any) => {
    setOpen(false);
  };

  return (
    <div style={{ ...styleProps }}>
      <FormControl
        size="small"
        sx={{ height: inputHeight, fontSize: fontSizeLabel }}
      >
        {/* for label, but this doesnt play nice with placeholder */}
        {topicLabel && (
          <InputLabel
            shrink={true}
            id={`${id}-label`}
            sx={{
              backgroundColor: 'background.default',
              color: 'text.hint',
            }}
          >
            {topicLabel}
          </InputLabel>
        )}
        {children && (
          <Select
            open={open}
            onOpen={() => setOpen(true)}
            onClose={() => setOpen(false)}
            notched={topicLabel ? true : false}
            labelId={`${id}-label`}
            id={id}
            displayEmpty
            renderValue={(selected) => {
              if (selected?.length === 0) {
                if (noOptionsPlaceholder && hasNoOptions) {
                  return <em>{noOptionsPlaceholder}</em>;
                } else if (optionsPlaceholder && !hasNoOptions) {
                  return <em>{optionsPlaceholder}</em>;
                }
              }
              return selected;
            }}
            defaultValue={theValue || ''}
            value={theValue || ''}
            onChange={handleSelect}
            // sx={{ width: '180px', height: '32px' }}
            sx={{
              height: '36px',
              ...selectorStyleProps,
              //REF
              // width: selectorStyleProps?.width || '180px',
              // '& .MuiOutlinedInput-notchedOutline': {
              //   border: `5px solid red`,
              // },
              // '&.Mui-focused': {
              //   '& .MuiOutlinedInput-notchedOutline': {
              //     border: `5px dotted red`,
              //   },
              // },
            }}
          >
            {/* displays disabled entry in the drop down */}
            {(hasNoOptions || !children) && noOptionsPlaceholder && (
              <MenuItem key="None" value="None" disabled={true}>
                {noOptionsPlaceholder}
              </MenuItem>
            )}
            {!hasNoOptions && children && optionsPlaceholder && (
              <MenuItem key="None" value="None" disabled={true}>
                {optionsPlaceholder}
              </MenuItem>
            )}
            {/* have to do this in order for children click to handle in this component  */}
            {children &&
              children.map((item) => {
                // console.log('item', item);
                if (typeof item.props.children === 'string') {
                  return item;
                } else {
                  return item.props.children;
                }
              })}
            {/* otherwise, just... */}
            {/* {children} */}
            {/* {testList.map((branch) => (
            <MenuItem key={branch} value={branch}>
              {branch}
            </MenuItem>
          ))} */}
          </Select>
        )}
      </FormControl>
      {/*ALT <ButtonMainUi startIcon={<AddIcon/>}>Lesson</ButtonMainUi> */}
      {iconButtonHandler && (
        <IconButton
          disabled={iconButtonDisabled}
          color="inherit"
          onClick={iconButtonHandler}
        >
          <Tooltip arrow title={iconButtonTooltip} {...tooltipStyle}>
            {iconButton}
          </Tooltip>
        </IconButton>
      )}
    </div>
  );
}
