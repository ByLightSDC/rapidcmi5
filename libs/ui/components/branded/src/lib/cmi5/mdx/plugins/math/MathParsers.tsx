import { Tooltip } from '@mui/material';

/* Icons */
import EditIcon from '@mui/icons-material/Edit';
//<EditIcon />

/**
 * Replace paragraphs with spans
 */
export const inlineMathParser = () => {
  const filter = {
    p: (props: any) => {
      return <span {...props}>{props.children}</span>;
    },
    span: (props: any) => {
      const { node, className, children } = props;
      //FUTURE editor root of math span tags
      if (className === 'katex') {
        return <span {...props}>{props.children}</span>;

        // return (
        //   <Tooltip title="Edit">
        //     <span {...props}>{props.children}</span>
        //   </Tooltip>
        // );
      }
      return <span {...props}>{props.children}</span>;
    },
  };

  return filter;
};
