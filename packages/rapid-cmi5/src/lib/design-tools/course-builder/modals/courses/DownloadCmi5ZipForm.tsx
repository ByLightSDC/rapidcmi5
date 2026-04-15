import {
  FormControlTextField,
  FormControlUIProvider,
  FormStateType,
  MiniForm,
  ModalDialog,
  CommonAppModalState,
} from '@rapid-cmi5/ui';
import * as yup from 'yup';

import Grid from '@mui/material/Grid2';
import { Alert, Box, Button, Stack, Typography } from '@mui/material';

import { UseFormReturn } from 'react-hook-form';
import { NAME_GROUP_OPT } from '@rapid-cmi5/ui';
import { DownloadCmi5Type } from '../../CourseBuilderApiTypes';
import { useContext, useEffect, useState } from 'react';
import { GitContext } from '../../GitViewer/session/GitContext';
import { downloadCmi5ZipModalId } from '../../../rapidcmi5_mdx/modals/constants';
import { RC5Context } from '../../../rapidcmi5_mdx/contexts/RC5Context';
import { useCourseData } from '../../../rapidcmi5_mdx/data-hooks/useCourseData';

export function DownloadCmi5ZipForm({
  defaultData,
  modalObj,
  handleCloseModal,
  handleModalAction,
}: {
  defaultData: DownloadCmi5Type;
  modalObj: CommonAppModalState;
  handleCloseModal: () => void;
  handleModalAction: (
    modalId: string,
    buttonAction: number,
    data?: any,
  ) => void;
}) {
  const { handleDownloadCmi5Zip } = useContext(GitContext);
  const { courseData } = useCourseData();

  const { changeCourseId } = useContext(RC5Context);

  const [currentCourseId, setCurrentCourseId] = useState<string>('');
  const [courseHasUUID, setCourseHasUUID] = useState(true);

  const validationSchema = yup.object().shape({
    username: NAME_GROUP_OPT,
  });

  const onCancel = () => {
    handleCloseModal();
  };

  const onClose = () => {
    handleCloseModal();
  };

  const containsUuid = (str: string): boolean => {
    const lastSegment = str.split('/').pop() ?? '';

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    return uuidRegex.test(lastSegment);
  };

  const generateNewCourseId = () => {
    const uuid = crypto.randomUUID();
    const courseId = courseData?.courseId ?? '';
    const newCourseId = `${courseId}/${uuid}`;
    changeCourseId(newCourseId);
  };

  const onResponse = (isSuccess: boolean, data: any, message: string) => {
    if (isSuccess) {
      handleModalAction(modalObj.type, 1, data);
    }
  };

  useEffect(() => {
    const courseId = courseData.courseId;
    setCurrentCourseId(courseId);
    setCourseHasUUID(containsUuid(courseId));
  }, [courseData.courseId]);

  /**
   * Returns form fields unique to this form
   * @param {UseFormReturn} formMethods React hook form methods
   * @param {FormStateType} formState React hook form state fields (ex. errors, isValid)
   * @return {JSX.Element} Render elements
   */
  const pullFormFields = (
    formMethods: UseFormReturn,
    formState: FormStateType,
  ): JSX.Element => {
    const { control } = formMethods;
    const { errors } = formState;

    return (
      <>
        {!courseHasUUID && (
          <Grid size={12}>
            <Stack spacing={2} sx={{ mt: 1, mb: 1 }}>
              <Alert severity="warning">
                This course ID does not have a valid UUID at the end. This means
                it was likely created with an older version of Rapid CMI5. It is
                recommended to use a UUID before downloading the CMI5 zip.
              </Alert>

              <Box>
                <Typography variant="subtitle2">Current Course ID</Typography>
                <Typography
                  variant="body2"
                  sx={{
                    wordBreak: 'break-word',
                    p: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    backgroundColor: 'background.paper',
                  }}
                >
                  {currentCourseId || 'No course ID found'}
                </Typography>
              </Box>

              <Box>
                <Button variant="contained" onClick={generateNewCourseId}>
                  Generate New UUID
                </Button>
              </Box>
            </Stack>
          </Grid>
        )}

        <Grid size={6} sx={{ marginTop: '8px' }}>
          <FormControlTextField
            control={control}
            error={Boolean(errors?.zipName)}
            helperText={errors?.zipName?.message}
            name="zipName"
            required
            label="Zip Name"
            readOnly={false}
          />
        </Grid>
      </>
    );
  };

  return (
    <ModalDialog
      testId={downloadCmi5ZipModalId}
      buttons={[]}
      dialogProps={{
        open: modalObj.type === downloadCmi5ZipModalId,
      }}
      maxWidth="sm"
    >
      <FormControlUIProvider>
        <MiniForm
          dataCache={defaultData}
          doAction={handleDownloadCmi5Zip}
          formTitle="Publish Course"
          getFormFields={pullFormFields}
          instructions="Download a CMI5 zip file containing all of the lessons in this course. The downloaded file can be uploaded to a RangeOS LMS course activity."
          submitButtonText="Download"
          successToasterMessage="Download Succeeded"
          onClose={onClose}
          onCancel={onCancel}
          onResponse={onResponse}
          validationSchema={validationSchema}
        />
      </FormControlUIProvider>
    </ModalDialog>
  );
}

export default DownloadCmi5ZipForm;
