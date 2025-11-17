import { useContext, useState } from 'react';
import { INode } from 'react-accessible-treeview';
import { IFlatMetadata } from 'react-accessible-treeview/dist/TreeView/utils';

import { useDispatch, useSelector } from 'react-redux';
import {
  RepoState,
  setClipBoard,
} from 'apps/rapid-cmi5-electron-frontend/src/app/redux/repoManagerReducer';
import {
  AppDispatch,
  RootState,
} from 'apps/rapid-cmi5-electron-frontend/src/app/redux/store';
import {
  expandedFileTreeNodes,
  repoFolderChange,
  toggleRepoFolderChange,
  updateExpandedFileTreeNodes,
} from 'apps/rapid-cmi5-electron-frontend/src/app/redux/courseBuilderReducer';
import { GitContext } from '../session/GitContext';

export const useContextMenu = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { fileState }: RepoState = useSelector(
    (state: RootState) => state.repoManager,
  );
  const { handleRenameFile, handleDeleteFile, handleCopyFile, currentRepo } =
    useContext(GitContext);
  const expandedFileTreeNodesSel = useSelector(expandedFileTreeNodes);
  const clipBoard = fileState.clipBoard;

  const repoFolderChangeSel = useSelector(repoFolderChange);

  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [contextItem, setContextItem] = useState<INode<IFlatMetadata> | null>(
    null,
  );

  const handleOpenMenu = (
    event: React.MouseEvent<HTMLElement>,
    item: INode<IFlatMetadata>,
  ) => {
    event.preventDefault();
    setMenuAnchorEl(event.currentTarget);
    setContextItem(item);
  };

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
    setContextItem(null);
  };

  const onRename = async (newName: string, element: INode<IFlatMetadata>) => {
    if (newName.trim() && newName !== element.name) {
      // clean up currently expanded folders
      if (element.isBranch) {
        let currentlyExpanded =
          expandedFileTreeNodesSel[currentRepo || ''] || []; // || '' is to keep typescript happy
        currentlyExpanded = currentlyExpanded.filter(
          (node: string) => !node.startsWith(element.id.toString()),
        );
        dispatch(
          updateExpandedFileTreeNodes({
            repoName: currentRepo || '',
            nodeList: currentlyExpanded,
          }),
        );
      }

      await handleRenameFile(element.id.toString(), newName);
      // need to toggle to remember scrollbar
      dispatch(toggleRepoFolderChange(!repoFolderChangeSel));
    }
  };

  const onDelete = async (element: INode<IFlatMetadata>) => {
    if (currentRepo === null) {
      console.error('Current Repo is set to null, cannot delete');
      return;
    }
    if (element.isBranch) {
      // clean up currently expanded folders
      let currentlyExpanded = expandedFileTreeNodesSel[currentRepo] || [];
      currentlyExpanded = currentlyExpanded.filter(
        (node: string) => !node.startsWith(element.id.toString()),
      );
      dispatch(
        updateExpandedFileTreeNodes({
          repoName: currentRepo,
          nodeList: currentlyExpanded,
        }),
      );
      await handleDeleteFile(element.id.toString(), true);
    } else {
      await handleDeleteFile(element.id.toString(), false);
    }
    // need to toggle to rember scrollbar
    dispatch(toggleRepoFolderChange(!repoFolderChangeSel));
  };

  const onCopy = async (element: INode<IFlatMetadata>) => {
    dispatch(setClipBoard(element.id.toString()));
  };

  const onPaste = async (element: INode<IFlatMetadata>) => {
    if (currentRepo === null) {
      console.error('Current Repo is set to null, cannot paste');
      return;
    }
    if (!clipBoard) return;
    await handleCopyFile(clipBoard, element.id.toString());
  };

  return {
    menuAnchorEl,
    contextItem,
    handleOpenMenu,
    handleCloseMenu,
    onDelete,
    onRename,
    onCopy,
    onPaste,
  };
};
