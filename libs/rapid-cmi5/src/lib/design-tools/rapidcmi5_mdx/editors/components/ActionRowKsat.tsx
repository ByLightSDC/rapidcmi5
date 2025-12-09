import {
  ActionRow,
  actionRowHeaderColor,
  ActionRowProps,
  iListItemType,
  listStyles,
  OverflowTypography,
} from '@rangeos-nx/ui/branded';

export default function ActionRowKsat(props: ActionRowProps) {
  const { data } = props;
  const childProps = {
    showTitle: false,
    showAuthor: false,
    showDate: false,
  };

  const getRowChildren = (rowData: Element, index?: number): JSX.Element => {
    const titleText = data.title || data.text || '';
    return (
      <>
        <div style={{ ...listStyles.xxs }}>
          <OverflowTypography
            //@ts-ignore
            title={rowData.element_identifier || ''}
            sxProps={{
              marginLeft: '8px',
              fontWeight: 'bold',
              textTransform: 'none',
            }}
          />
        </div>
        <div style={listStyles.md}>
          <OverflowTypography
            title={titleText}
            sxProps={{ fontWeight: 'normal', textTransform: 'none' }}
          />
        </div>
        {/* <div style={{ ...listStyles.xs }}>
          <OverflowTypography
            title={rowData.element_type || ''}
            sxProps={{ fontWeight: 'normal', textTransform: 'none' }}
          />
        </div> */}
      </>
    );
  };

  const getRowChildrenTitle = (instance: iListItemType): JSX.Element => {
    return (
      <>
        <div style={{ ...listStyles.xxs }}>
          <OverflowTypography
            title="Element ID"
            variant="caption"
            color={actionRowHeaderColor}
            sxProps={{ cursor: 'default' }}
          />
        </div>
        <div style={listStyles.md}>
          <OverflowTypography
            title="Title"
            variant="caption"
            color={actionRowHeaderColor}
            sxProps={{ cursor: 'default' }}
          />
        </div>
        {/* <div style={{ ...listStyles.xs }}>
          <OverflowTypography
            title="Type"
            variant="caption"
            color={actionRowHeaderColor}
          />
        </div> */}
      </>
    );
  };

  return (
    <ActionRow
      {...props}
      {...childProps}
      rowActions={[]}
      rowChildren={getRowChildren(data)}
      rowChildrenTitle={getRowChildrenTitle(data)}
    />
  );
}
