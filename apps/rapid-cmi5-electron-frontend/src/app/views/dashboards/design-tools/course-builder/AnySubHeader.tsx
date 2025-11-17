import { ListSubheader, ListSubheaderProps } from "@mui/material";

export default function AnySubheader(
    props: ListSubheaderProps & { muiSkipListHighlight: boolean },
  ) {
    const { muiSkipListHighlight, ...other } = props;
    return <ListSubheader {...other} />;
  }