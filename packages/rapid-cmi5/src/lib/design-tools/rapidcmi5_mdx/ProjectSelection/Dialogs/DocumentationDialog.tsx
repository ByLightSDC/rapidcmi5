import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { alpha } from '@mui/system';

interface DocumentationDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  content: string;
}

export default function DocumentationDialog({
  open,
  onClose,
  title,
  content,
}: DocumentationDialogProps) {
  // Split content into paragraphs and format code blocks
  const formatContent = (text: string) => {
    const paragraphs = text.split('\n\n');

    return paragraphs.map((paragraph, index) => {
      // Check if it's a code-like line (contains specific patterns)
      const isCodeBlock =
        paragraph.includes('→') ||
        paragraph.includes('•') ||
        paragraph.startsWith('-');

      return (
        <Typography
          key={index}
          sx={{
            color: 'text.primary',
            fontSize: '0.875rem',
            fontFamily: isCodeBlock ? 'monospace' : 'inherit',
            lineHeight: 1.7,
            mb: 2,
            whiteSpace: 'pre-line',
            bgcolor: isCodeBlock
              ? (theme) => alpha(theme.palette.primary.main, 0.05)
              : 'transparent',
            p: isCodeBlock ? 2 : 0,
            borderRadius: isCodeBlock ? 1 : 0,
            border: isCodeBlock
              ? (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
              : 'none',
          }}
        >
          {paragraph}
        </Typography>
      );
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          width: '600px',
          height: '500px',
          maxWidth: '90vw',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.paper',
          backgroundImage: (theme) =>
            `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
          backdropFilter: 'blur(20px)',
          border: (theme) =>
            `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          borderRadius: 3,
          boxShadow: (theme) =>
            `0 20px 60px ${alpha(theme.palette.common.black, 0.3)}`,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: 1,
          borderColor: 'divider',
          pb: 2,
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              background: (theme) =>
                `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 2,
              boxShadow: (theme) =>
                `0 4px 12px ${alpha(theme.palette.primary.main, 0.4)}`,
            }}
          >
            <Typography
              sx={{
                color: 'primary.contrastText',
                fontSize: '1.2rem',
                fontWeight: 700,
              }}
            >
              ?
            </Typography>
          </Box>
          <Typography
            variant="h6"
            sx={{
              fontFamily: 'monospace',
              fontWeight: 600,
              color: 'text.primary',
            }}
          >
            {title}
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: 'text.secondary',
            '&:hover': {
              color: 'text.primary',
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
            },
          }}
        >
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          pt: 3,
          pb: 3,
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            bgcolor: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.2),
            borderRadius: '4px',
            '&:hover': {
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.3),
            },
          },
        }}
      >
        {formatContent(content)}
      </DialogContent>
    </Dialog>
  );
}
