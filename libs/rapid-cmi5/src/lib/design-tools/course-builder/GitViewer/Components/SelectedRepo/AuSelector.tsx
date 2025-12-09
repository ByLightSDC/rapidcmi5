import React, { useState } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';

import { useSelector } from 'react-redux';
import { RootState } from '../../../../../redux/store';
import { RepoState } from '../../../../../redux/repoManagerReducer';

interface AuSelectorProps {
  setSlideBlockName: (blockIndex: string | null) => void;
  setSlideAuName: (auIndex: string | null) => void;
}

const AuSelector: React.FC<AuSelectorProps> = ({
  setSlideBlockName,
  setSlideAuName,
}) => {
  const { fileState }: RepoState = useSelector(
    (state: RootState) => state.repoManager,
  );

  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [selectedAu, setSelectedAu] = useState<string | null>(null);

  // Get the selected block object
  const selectedBlockObj = fileState.selectedCourse?.courseData?.blocks.find(
    (block) => block.blockName === selectedBlock,
  );

  return (
    <Box sx={{ minWidth: '320px', minHeight: '240px' }}>
      <p>Test</p>

      {/* Block Dropdown */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Select Block</InputLabel>
        <Select
          value={selectedBlock}
          onChange={(e) => {
            setSelectedBlock(e.target.value);
            setSlideBlockName(e.target.value);
            setSlideAuName(null);

            setSelectedAu(''); // Reset AU when block changes
          }}
        >
          {fileState.selectedCourse?.courseData?.blocks.map((block) => (
            <MenuItem key={block.blockName} value={block.blockName}>
              {block.blockName}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* AU Dropdown (only shows if a block is selected) */}
      {selectedBlock && (
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Select AU</InputLabel>
          <Select
            value={selectedAu}
            onChange={(e) => {
              setSelectedAu(e.target.value);
              setSlideAuName(e.target.value);
            }}
          >
            {selectedBlockObj?.aus.map((au) => (
              <MenuItem key={au.auName} value={au.auName}>
                {au.auName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
    </Box>
  );
};

export default AuSelector;
