import { useForm, Controller } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { config, authToken} from '@rapid-cmi5/ui/branded';
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

/* MUI */
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  CircularProgress,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Typography,
  Stack,
  Divider,
  Box,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface ApiResponse {
  offset: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  data: Scenario[];
}

interface ScenarioFormData {
  selectedScenarioId: string;
}

export function MyScenariosForm({ submitForm }: ScenarioFormProps) {
  const [open, setOpen] = useState(false);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const token = useSelector(authToken);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ScenarioFormData>({
    defaultValues: { selectedScenarioId: '' },
  });

  const getScenarios = async (token?: string) => {
    try {
      setIsLoading(true);
      const response = await axios.get<ApiResponse>(
        `${config.DEVOPS_API_URL}/v1/content/range/scenarios`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            offset: 0,
            limit: 20,
            sortBy: 'dateEdited',
            sort: 'desc',
          },
        },
      );

      setScenarios(response.data?.data ?? []);
    } catch (e) {
      console.error('Could not retrieve available projects from PCTE', e);
      setScenarios([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open && token) {
      getScenarios(token);
    }
    if (!open) {
      // clear selection when closing so it feels like a fresh modal each time
      reset({ selectedScenarioId: '' });
    }
  }, [open, token, reset]);

  const onSubmit = async (data: ScenarioFormData) => {
    const selectedScenario = scenarios.find(
      (s) => s.uuid === data.selectedScenarioId,
    );
    if (!selectedScenario) return;

    submitForm(selectedScenario);
    setOpen(false);
  };

  return (
    <>
      <Button variant="outlined" onClick={() => setOpen(true)}>
        Select Scenario
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{ pr: 6 }}>
          Select a Scenario
          <IconButton
            aria-label="close"
            onClick={() => setOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {isLoading ? (
            <Stack direction="row" spacing={2} alignItems="center">
              <CircularProgress size={20} />
              <Typography>Loading scenarios...</Typography>
            </Stack>
          ) : scenarios.length === 0 ? (
            <Typography color="text.secondary">
              No scenarios available
            </Typography>
          ) : (
            <FormControl error={!!errors.selectedScenarioId} fullWidth>
              <FormLabel sx={{ mb: 1 }}>Available scenarios</FormLabel>

              <Controller
                name="selectedScenarioId"
                control={control}
                rules={{ required: 'Please select a scenario' }}
                render={({ field }) => (
                  <RadioGroup {...field}>
                    <Stack spacing={1}>
                      {scenarios.map((scenario) => (
                        <Box
                          key={scenario.uuid}
                          sx={{
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 2,
                            p: 1.5,
                          }}
                        >
                          <FormControlLabel
                            value={scenario.uuid}
                            control={<Radio />}
                            label={
                              <Stack spacing={0.5}>
                                <Typography fontWeight={600}>
                                  {scenario.name}
                                </Typography>

                                <Stack direction="row" spacing={2}>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    By {scenario.author}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    {new Date(
                                      scenario.dateEdited,
                                    ).toLocaleDateString()}
                                  </Typography>
                                </Stack>

                                {!!scenario.description && (
                                  <>
                                    <Divider sx={{ my: 0.5 }} />
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      {scenario.description}
                                    </Typography>
                                  </>
                                )}
                              </Stack>
                            }
                          />
                        </Box>
                      ))}
                    </Stack>
                  </RadioGroup>
                )}
              />

              {!!errors.selectedScenarioId?.message && (
                <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                  {errors.selectedScenarioId.message}
                </Typography>
              )}
            </FormControl>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit(onSubmit)}
            disabled={isLoading || scenarios.length === 0}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
