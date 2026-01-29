// import { MenuItem, SxProps } from '@mui/material';

// import AnySelector from '../AnySelector';
// import {
//   fsType,
//   fsTypeLabels,
// } from '../../../redux/repoManagerReducer';

// export default function FileSystemSelector({
//   currentFs,
//   disabled,
//   onAction,
//   onSelect,
//   styleProps = {},
// }: {
//   currentFs?: fsType;
//   disabled?: boolean;
//   styleProps?: SxProps;
//   onAction?: () => void;
//   onSelect?: (fsType: fsType) => void;
// }) {
//   const handleSelectFs = (fs: string) => {
//     const enumValues = Object.values(fsType).map((value) => value.toString());
//     if (onSelect) {
//       if (enumValues.includes(fs)) {
//         onSelect(fs as fsType);
//       }
//     }
//   };

//   return (
//     <AnySelector
//       id="filesystems"
//       theValue={fsTypeLabels[currentFs || fsType.inBrowser]}
//       onChange={handleSelectFs}
//       topicLabel="FileSystem"
//       optionsPlaceholder="Select a File System"
//       selectorStyleProps={{ minWidth: '100px', flexGrow: 1, maxWidth: '320px' }} //why wont this grow?
//       iconButtonHandler={onAction}
//       iconButtonTooltip="Select a File System"
//       iconButtonDisabled={false}
//     >
//       {Object.entries(fsType).map(([fsTypeStr, fsType]) => (
//         <MenuItem
//           key={fsTypeStr}
//           value={fsTypeLabels[fsType]}
//           onClick={() => handleSelectFs(fsType)}
//         >
//           {fsTypeLabels[fsType]}
//         </MenuItem>
//       ))}
//     </AnySelector>
//   );
// }
