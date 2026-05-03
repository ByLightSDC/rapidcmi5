
/* Icons */
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
      const { className } = props;
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
