import React, { useEffect, useState } from 'react';
import { Stack } from '@mui/material';
import { insertDirective$ } from '@mdxeditor/editor';
import { usePublisher } from '@mdxeditor/gurx';
import { ModalDialog, TextFieldMainUi } from '@rapid-cmi5/ui';

interface YoutubeDialogProps {
  open: boolean;
  onClose: () => void;
}

function extractVideoId(input: string): string {
  const trimmed = input.trim();

  // Full URL forms: youtu.be/<id> or youtube.com/watch?v=<id> or /embed/<id>
  const urlPatterns = [
    /youtu\.be\/([A-Za-z0-9_-]{11})/,
    /[?&]v=([A-Za-z0-9_-]{11})/,
    /\/embed\/([A-Za-z0-9_-]{11})/,
  ];
  for (const pattern of urlPatterns) {
    const match = trimmed.match(pattern);
    if (match) return match[1];
  }

  // Bare 11-char video ID
  if (/^[A-Za-z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  return trimmed;
}

export const YoutubeDialog: React.FC<YoutubeDialogProps> = ({
  open,
  onClose,
}) => {
  const [input, setInput] = useState('');
  const insertDirective = usePublisher(insertDirective$);

  useEffect(() => {
    if (open) setInput('');
  }, [open]);

  if (!open) return null;

  const handleSubmit = () => {
    const id = extractVideoId(input);
    if (!id) return;
    insertDirective({
      type: 'leafDirective',
      name: 'youtube',
      attributes: { id },
    });
    onClose();
  };

  return (
    <ModalDialog
      title="Insert YouTube Video"
      buttons={['Cancel', 'Insert']}
      dialogProps={{ open: true }}
      handleAction={(index: number) => {
        if (index === 0) {
          onClose();
        } else {
          handleSubmit();
        }
      }}
    >
      <Stack spacing={2} sx={{ minWidth: 360 }}>
        <TextFieldMainUi
          autoFocus
          margin="dense"
          label="YouTube URL or Video ID"
          name="youtube-url"
          type="text"
          fullWidth
          value={input}
          onChange={(value: string) => setInput(value)}
          infoText="Paste a YouTube URL (e.g. https://youtu.be/dQw4w9WgXcQ) or just the video ID"
        />
      </Stack>
    </ModalDialog>
  );
};
