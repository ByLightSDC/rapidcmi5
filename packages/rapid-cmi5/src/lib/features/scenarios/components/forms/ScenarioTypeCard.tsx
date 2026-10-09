/*
  One selectable deployment type panel in the scenario activity form
*/
import { Box, Paper, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { ButtonMainUi, ButtonMinorUi } from '@rapid-cmi5/ui';

interface ScenarioTypeCardProps {
  id: string;
  icon: JSX.Element;
  title: string;
  description: string;
  deployedBy: string;
  signIn: string;
  isSelected: boolean;
  isDisabled?: boolean;
  onSelect: () => void;
}

export const ScenarioTypeCard = ({
  id,
  icon,
  title,
  description,
  deployedBy,
  signIn,
  isSelected,
  isDisabled = false,
  onSelect,
}: ScenarioTypeCardProps) => {
  return (
    <Paper
      data-testid={`scenario-type-${id}`}
      data-selected={isSelected}
      variant="outlined"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        padding: 2.5,
        borderRadius: '10px',
        borderWidth: '2px',
        borderColor: isSelected ? 'primary.main' : 'divider',
        backgroundColor: (theme) =>
          isSelected ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
      }}
    >
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'primary.main',
          backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.15),
        }}
      >
        {icon}
      </Box>
      <Typography
        component="h3"
        variant="subtitle1"
        sx={{ fontWeight: 600, lineHeight: 1.3 }}
      >
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
      <Box
        component="dl"
        sx={{
          margin: 0,
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          columnGap: 1.5,
          rowGap: 0.5,
        }}
      >
        <Typography component="dt" variant="caption" color="text.secondary">
          Deployed by
        </Typography>
        <Typography component="dd" variant="caption" sx={{ margin: 0 }}>
          {deployedBy}
        </Typography>
        <Typography component="dt" variant="caption" color="text.secondary">
          Sign-in
        </Typography>
        <Typography component="dd" variant="caption" sx={{ margin: 0 }}>
          {signIn}
        </Typography>
      </Box>
      <Box sx={{ flexGrow: 1 }} />
      {isSelected ? (
        <ButtonMainUi
          id={`scenario-type-${id}-selected`}
          aria-pressed={true}
          fullWidth
          sxProps={{ height: 42 }}
        >
          Selected
        </ButtonMainUi>
      ) : (
        <ButtonMinorUi
          id={`scenario-type-${id}-select`}
          aria-pressed={false}
          aria-label={`Select ${title}`}
          disabled={isDisabled}
          fullWidth
          sx={{ height: 42 }}
          onClick={onSelect}
        >
          Select
        </ButtonMinorUi>
      )}
    </Paper>
  );
};
