import { useContext, useState } from 'react';
import { INode } from 'react-accessible-treeview';
import { IFlatMetadata } from 'react-accessible-treeview/dist/TreeView/utils';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../../../redux/store';
import {
  repoFolderChange,
  toggleRepoFolderChange,
} from '../../../../redux/courseBuilderReducer';
import path from 'path-browserify';
import { GitContext } from '../session/GitContext';
import { currentRepoAccessObjectSel } from '../../../../redux/repoManagerReducer';
import { getRepoPath } from '../utils/fileSystem';

export const usePopup = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { handleCreateFile, handleGetUniqueDirPath, handleGetUniqueFilePath } =
    useContext(GitContext);

  const repoFolderChangeSel = useSelector(repoFolderChange);
  const repoAccessObject = useSelector(currentRepoAccessObjectSel);

  const [popupAnchorEl, setPopupAnchorEl] = useState<null | HTMLElement>(null);
  const [popupType, setPopupType] = useState<'file' | 'dir' | null>(null);

  const handleOpenPopup = (
    event: React.MouseEvent<HTMLElement>,
    type: 'file' | 'dir',
  ) => {
    setPopupAnchorEl(event.currentTarget);
    setPopupType(type);
  };

  const handleClosePopup = () => {
    setPopupAnchorEl(null);
    setPopupType(null);
  };

  const handleNewDir = async (
    element: INode<IFlatMetadata>,
    dirName: string,
  ) => {
    const parsedPath = path.parse(`${element.id}/${dirName}`);
    const basePath = parsedPath.dir;
    const name = parsedPath.name;
    if (!repoAccessObject) return;
    const uniquePath = await handleGetUniqueDirPath(
      repoAccessObject,
      name,
      basePath,
    );

    await handleCreateFile(uniquePath, true);
    // need to toggle to remember scrollbar
    dispatch(toggleRepoFolderChange(!repoFolderChangeSel));
  };

  const handleNewFile = async (
    element: INode<IFlatMetadata>,
    fileName: string,
    data?: string | Uint8Array,
  ) => {
    const parsedPath = path.parse(`${element.id}/${fileName}`);
    const basePath = parsedPath.dir;
    const name = parsedPath.name;
    const extension = parsedPath.ext;

    if (!repoAccessObject) return;
    const uniquePath = await handleGetUniqueFilePath(
      repoAccessObject,
      name,
      basePath,
      extension,
    );

    await handleCreateFile(uniquePath, false, data);
    // need to toggle to remember scrollbar
    dispatch(toggleRepoFolderChange(!repoFolderChangeSel));
  };

  return {
    popupAnchorEl,
    popupType,
    handleOpenPopup,
    handleClosePopup,
    handleNewDir,
    handleNewFile,
  };
};
