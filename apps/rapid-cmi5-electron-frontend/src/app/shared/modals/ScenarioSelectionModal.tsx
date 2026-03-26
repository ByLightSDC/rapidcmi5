import { useCallback } from 'react';
import axios from 'axios';
import { Typography, Stack, Box, alpha, useTheme } from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import { DynamicModal } from '@rapid-cmi5/ui';
import type { ScenarioFormProps } from '@rapid-cmi5/react-editor';

export interface Scenario {
  uuid: string;
  name: string;
  author: string;
  dateEdited: string;
  description: string;
  dateCreated: string;
  packages?: string[];
  drafts?: string[];
  metadata_tags?: string[];
}

interface ApiResponse {
  offset: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  data: Scenario[];
}

const ITEMS_PER_PAGE = 50;

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor(
    Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

function ScenarioCard({
  scenario,
  isSelected,
}: {
  scenario: Scenario;
  isSelected: boolean;
}) {
  const theme = useTheme();
  const textPrimary = theme.palette.text.primary;
  const textSecondary = theme.palette.text.secondary;
  const textTertiary = alpha(theme.palette.text.secondary, 0.7);

  return (
    <Box sx={{ p: 2, pl: isSelected ? 2.5 : 2 }}>
      <Stack spacing={1.25}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Typography
            variant="body1"
            fontWeight={600}
            sx={{
              color: textPrimary,
              lineHeight: 1.4,
              letterSpacing: '-0.01em',
            }}
          >
            {scenario.name}
          </Typography>
          {isSelected && (
            <CheckCircleIcon
              sx={{
                fontSize: 20,
                color: theme.palette.primary.main,
                flexShrink: 0,
              }}
            />
          )}
        </Box>

        <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 1 }}>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <PersonOutlineIcon sx={{ fontSize: 15, color: textTertiary }} />
            <Typography
              variant="caption"
              sx={{ color: textSecondary, fontWeight: 500 }}
            >
              {scenario.author}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <AccessTimeIcon sx={{ fontSize: 15, color: textTertiary }} />
            <Typography
              variant="caption"
              sx={{ color: textSecondary, fontWeight: 500 }}
            >
              {formatDate(scenario.dateEdited)}
            </Typography>
          </Stack>
        </Stack>

        {scenario.description && (
          <Typography
            variant="body2"
            sx={{
              color: textSecondary,
              lineHeight: 1.5,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {scenario.description}
          </Typography>
        )}
      </Stack>
    </Box>
  );
}

export function ScenarioSelectionForm({
  submitForm,
  token,
  url,
}: ScenarioFormProps) {
  const fetchItems = useCallback(
    async (page: number, search: string) => {
      const offset = (page - 1) * ITEMS_PER_PAGE;
      const params: Record<string, string | number> = {
        offset,
        limit: ITEMS_PER_PAGE,
        sortBy: 'dateEdited',
        sort: 'desc',
      };
      if (search.trim()) params.search = search.trim();

      const response = await axios.get<ApiResponse>(
        `${url}/v1/content/range/scenarios`,
        { headers: { Authorization: `Bearer ${token}` }, params },
      );

      return {
        data: response.data?.data ?? [],
        totalCount: response.data?.totalCount ?? 0,
        totalPages: response.data?.totalPages ?? 0,
      };
    },
    [token, url],
  );

  return (
    <DynamicModal<Scenario>
      title="Select Scenario"
      itemLabel="scenario"
      searchPlaceholder="Search scenarios..."
      emptyTitle="No scenarios"
      emptyDescription="Create your first scenario to get started"
      itemsPerPage={ITEMS_PER_PAGE}
      fetchItems={fetchItems}
      getItemId={(s) => s.uuid}
      renderItem={(s, isSelected) => (
        <ScenarioCard scenario={s} isSelected={isSelected} />
      )}
      onSelect={submitForm}
    />
  );
}
