/* eslint-disable react-hooks/exhaustive-deps */
import TreeView, {
  INode,
  ITreeViewOnNodeSelectProps,
  ITreeViewOnExpandProps,
} from 'react-accessible-treeview';
import { IFlatMetadata } from 'react-accessible-treeview/dist/TreeView/utils';
import { useContext, useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  currentAuPath,
  expandedFileTreeNodes,
  isFileTreeOpen,
  updateExpandedFileTreeNodes,
} from 'apps/rapid-cmi5-electron-frontend/src/app/redux/courseBuilderReducer';

import { TreeFolderIcon } from '../icons/TreeFolderIcon';
import { TreeFileIcon } from '../icons/TreeFileIcon';
import { AppDispatch } from 'apps/rapid-cmi5-electron-frontend/src/app/redux/store';

import './tree-view.css';
import {
  setLastSelectedPath,
  setCurrentWorkingDir,
  setSelectedFile,
  setFileContent,
} from 'apps/rapid-cmi5-electron-frontend/src/app/redux/repoManagerReducer';
import { GitContext } from '../../session/GitContext';

const textColor = 'text.hint';

interface DirectoryTreeViewProps {
  currentRepo: string;
  directoryTree: INode<IFlatMetadata>[];
  isReadOnly?: boolean;
  paddingBase?: number;
}

function DirectoryTree({
  isReadOnly = false,
  paddingBase = 12,
  currentRepo,
  directoryTree,
}: DirectoryTreeViewProps) {
  const dispatch = useDispatch<AppDispatch>();
  const isTreeOpen = useSelector(isFileTreeOpen);

  const currentAuPathSel = useSelector(currentAuPath);

  const expandedFileTreeNodesSel = useSelector(expandedFileTreeNodes) || {};
  const currentExpandedFileTreeNodes = useRef<string[]>([]);
  const { handleGetFileContents } = useContext(GitContext);

  const handleFileClick = async (
    element: INode<IFlatMetadata>,
    isBranch: boolean | undefined,
  ) => {
    const filePath = element.id.toString();
    const parentPath = element.parent?.toString() || '/';

    if (isBranch || element.isBranch) {
      dispatch(setLastSelectedPath(filePath));
      dispatch(setCurrentWorkingDir(filePath));
      return;
    } else {
      dispatch(setCurrentWorkingDir(parentPath));
    }

    dispatch(setSelectedFile(filePath));
    dispatch(setLastSelectedPath(filePath));

    const fileContent = await handleGetFileContents(filePath);
    if (fileContent) {
      dispatch(setFileContent(fileContent));
    }
  };

  const handleNodeSelect = ({
    element,
    isSelected,
    isBranch,
  }: ITreeViewOnNodeSelectProps) => {
    handleFileClick(element, isBranch);
  };

  /**
   * Keeps track of which node(s) are currently expanded for the current repo
   * @param {ITreeViewOnExpandProps} props props from OnExpand callback of TreeView
   */
  const handleNodeExpand = ({
    element,
    isExpanded,
    isSelected,
    isHalfSelected,
    isDisabled,
    treeState,
  }: ITreeViewOnExpandProps) => {
    let currentlyExpanded: string[] = [...currentExpandedFileTreeNodes.current];

    const id = element.id as string;
    if (isExpanded) {
      if (!currentlyExpanded.includes(id)) {
        currentlyExpanded.push(id);
      }
    } else {
      currentlyExpanded = currentlyExpanded.filter(
        (node: string) => !node.startsWith(element.id.toString()),
      );
    }
    currentExpandedFileTreeNodes.current = currentlyExpanded;
    dispatch(
      updateExpandedFileTreeNodes({
        repoName: currentRepo || '',
        nodeList: currentlyExpanded,
      }),
    );
  };

  /**
   * UE to rerender when the top-level repo information line is toggled - open/closed
   */
  useEffect(() => {
    // rerender when tree open is toggled
  }, [isTreeOpen]);

  /**
   * UE to update currentExpanded nodes when repo is changed
   */
  useEffect(() => {
    currentExpandedFileTreeNodes.current = currentRepo
      ? expandedFileTreeNodesSel[currentRepo] || []
      : [];
  }, [expandedFileTreeNodesSel, currentRepo]);

  useEffect(() => {
    const validIds = new Set(directoryTree.map((node) => node.id));
    currentExpandedFileTreeNodes.current =
      currentExpandedFileTreeNodes.current.filter((id) => validIds.has(id));
  }, []);

  return (
    <>
      {/* repo root folder */}
      {/* <Box
        sx={{
          paddingX: '12px',
          paddingY: '6px',
          //this caused oddity height: '100%',
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: 'rgba(165, 165, 165, 0.2)',
          },
        }}
        onClick={() => dispatch(setIsFileTreeOpen(!isTreeOpen))}
      >
        {currentRepo && (
          <TreeFolderIcon
            isOpen={isTreeOpen}
            isReadOnly={true} // don't want to be able to change name / delete from here
            element={{
              name: currentRepo as string,
              id: '/',
              children: [],
              parent: 'none',
            }}
            currentRepo={currentRepo}
            currentCourse={fileState.selectedCourse?.docsDir}
            currentLesson={currentAuPathSel}
          />
        )}
        {!currentRepo && <div>No Repo Connected</div>}
      </Box> */}

      {/* only show the tree when there is data to show to prevent errors while in process of switching repos - tree not yet filled in */}
      {directoryTree.length > 1 && (
        <div
          className="directory"
          style={{
            color: textColor,
            paddingLeft: `${paddingBase}px`,
          }}
        >
          <TreeView
            data={directoryTree}
            aria-label="directory tree"
            onNodeSelect={handleNodeSelect}
            togglableSelect
            onExpand={handleNodeExpand}
            // defaultExpandedIds={[]}
            expandedIds={currentExpandedFileTreeNodes.current}
            nodeRenderer={({
              element,
              isBranch,
              isExpanded,
              getNodeProps,
              level,
            }) => (
              <div
                {...getNodeProps()}
                style={{
                  marginTop: '2px',
                  paddingLeft: paddingBase * (level - 1),
                }}
              >
                {isBranch ? (
                  <TreeFolderIcon
                    isOpen={isExpanded}
                    element={element}
                    isReadOnly={isReadOnly}
                    currentRepo={currentRepo}
                    currentLesson={currentAuPathSel}
                  />
                ) : (
                  <TreeFileIcon element={element} />
                )}
              </div>
            )}
          />
        </div>
      )}
    </>
  );
}

export default DirectoryTree;
