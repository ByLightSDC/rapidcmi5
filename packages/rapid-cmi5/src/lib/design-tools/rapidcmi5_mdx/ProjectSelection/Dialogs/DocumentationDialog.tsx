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
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
            }}
          >
            <Typography
              sx={{
                fontSize: '1.2rem',
                fontWeight: 700,
                color: 'white',
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
          // Markdown styling
          '& h1, & h2, & h3, & h4, & h5, & h6': {
            color: 'text.primary',
            fontWeight: 600,
            mt: 2,
            mb: 1,
          },
          '& h1': { fontSize: '1.5rem' },
          '& h2': { fontSize: '1.25rem' },
          '& h3': { fontSize: '1.1rem' },
          '& p': {
            color: 'text.primary',
            fontSize: '0.875rem',
            lineHeight: 1.7,
            mb: 2,
          },
          '& ul, & ol': {
            color: 'text.primary',
            fontSize: '0.875rem',
            lineHeight: 1.7,
            pl: 3,
            mb: 2,
          },
          '& li': {
            mb: 0.5,
          },
          '& code': {
            fontFamily: 'monospace',
            fontSize: '0.85em',
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
            color: 'primary.main',
            px: 0.75,
            py: 0.25,
            borderRadius: 0.5,
          },
          '& pre': {
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),
            border: (theme) =>
              `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            borderRadius: 1,
            p: 2,
            mb: 2,
            overflow: 'auto',
            '& code': {
              bgcolor: 'transparent',
              p: 0,
              fontSize: '0.8rem',
            },
          },
          '& strong': {
            fontWeight: 600,
            color: 'text.primary',
          },
          '& em': {
            fontStyle: 'italic',
          },
          '& a': {
            color: 'primary.main',
            textDecoration: 'none',
            '&:hover': {
              textDecoration: 'underline',
            },
          },
        }}
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {content}
        </ReactMarkdown>
      </DialogContent>
    </Dialog>
  );
}