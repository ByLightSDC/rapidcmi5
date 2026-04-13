//Markdown Icon
export const MarkdownIconSvg = (aColor?: string) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="24px"
    viewBox="0 -960 960 960"
    width="24px"
    fill={aColor}
  >
    <path d="m640-360 120-120-42-43-48 48v-125h-60v125l-48-48-42 43 120 120ZM160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm0-80h640v-480H160v480Zm0 0v-480 480Zm60-120h60v-180h40v120h60v-120h40v180h60v-200q0-17-11.5-28.5T440-600H260q-17 0-28.5 11.5T220-560v200Z" />
  </svg>
);

export const insertSelectionInstructions =
  'Click an item below to add it to the slide. Expand topics for more options.';

export const insertNoSelectionMessage = `Block elements can't be inserted into selections. Click in the content area to insert a cursor.`;

export const insertNoCursorMessage =
  'Click in the content area to insert a cursor. Then click an item below to add it to the slide';
