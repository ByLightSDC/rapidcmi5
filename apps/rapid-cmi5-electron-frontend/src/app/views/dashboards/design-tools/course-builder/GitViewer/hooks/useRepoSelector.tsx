// import { useDispatch, useSelector } from 'react-redux';

// import {
//   RepoState,
//   setCurrentRepo,
//   setCurrentWorkingDir,
// } from 'apps/rapid-cmi5-electron-frontend/src/app/redux/repoManagerReducer';
// import {
//   AppDispatch,
//   RootState,
// } from 'apps/rapid-cmi5-electron-frontend/src/app/redux/store';

// export const useRepoSelector = () => {
//   const dispatch = useDispatch<AppDispatch>();



//   const handleChangeRepo = async (name: string) => {
//     const cleanedName = `${name.replace(/[^a-zA-Z0-9-_]/g, '_')}`;

//     dispatch(setCurrentRepo(cleanedName));
//     dispatch(setCurrentWorkingDir('/'));
//   };

//   return {
//     handleChangeRepo,
//   };
// };
