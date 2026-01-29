/*
        table,tr style sets vert lines
        
        td:first-child fixes a padding issue where left padding is lost on first table data column
        
        paragraph-mimicis used in certain circumstances where replacing p with
        a div tag is required in order to avoid browser errors when nesting
        divs inside a paragraph. The div that uses the paragraph-mimic style
        will act like a paragraph.
*/
export const markDownSlideStyle = (
  <style>
    {`
      table,tr {
        border: 1px solid;
        border-radius:6px;
        border-color:#374151;

      }
   `}
    {`
      th:first-child, td:first-child {
        padding-left: .8rem;
        padding-top: .8rem
      }
      th:last-child, td:last-child {
        padding-right: .8rem; 
      }
   `}
    {`
      .paragraph-mimic {
        display: block;
        margin-top: 1em;
        margin-bottom: 1em;
        line-height: 1.5;
        text-align: left;
      }
  `}
  </style>
);
