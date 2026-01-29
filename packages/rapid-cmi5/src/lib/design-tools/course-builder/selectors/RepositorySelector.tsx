// import { MenuItem, SxProps } from '@mui/material';

// import AnySelector from '../AnySelector';

// /**
//  * Selector Component for displaying packages and L3s in a Package Group
//  * @param param0 Props
//  * @returns React Component
//  */
// export default function RepositorySelector({
//   currentRepo,
//   availableRepos,
//   disabled,
//   onAction,
//   onSelect,
//   styleProps = {},
// }: {
//   currentRepo?: string;
//   availableRepos?: string[];
//   disabled?: boolean;
//   styleProps?: SxProps;
//   onAction?: () => void;
//   onSelect?: (repoName: string) => void;
// }) {
//   const noReposFound = 'No Repositories Found';
//   const hasNoRepos = !availableRepos || availableRepos.length === 0;

//   const handleSelectRepo = (name: string) => {
//     if (onSelect) {
//       onSelect(name);
//     }
//   };

//   //REF console.log('data', data);

//   return (
//     <AnySelector
//       id="Repositories"
//       theValue={currentRepo || ''}
//       onChange={onSelect}
//       topicLabel="Repository"
//       hasNoOptions={hasNoRepos}
//       noOptionsPlaceholder={noReposFound}
//       optionsPlaceholder="Select Repository"
//       //selectorStyleProps={{ width: '240px' }}
//       selectorStyleProps={{ minWidth: '100px', flexGrow: 1, maxWidth: '320px' }} //why wont this grow?
//       iconButtonHandler={onAction}
//       iconButtonTooltip="Clone Repo"
//       iconButtonDisabled={false}
//     >
//       {availableRepos &&
//         availableRepos.map((name) => (
//           <MenuItem
//             key={name}
//             value={name}
//             onClick={() => handleSelectRepo(name)}
//           >
//             {name}
//           </MenuItem>
//         ))}
//     </AnySelector>
//   );
// }
