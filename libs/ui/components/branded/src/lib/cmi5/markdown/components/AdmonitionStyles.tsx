import ExpandCircleDownIcon from '@mui/icons-material/ExpandCircleDown';

//https://squidfunk.github.io/mkdocs-material/reference/admonitions/#+type:info
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import AssignmentIcon from '@mui/icons-material/Assignment';
import InfoIcon from '@mui/icons-material/Info';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import DoneIcon from '@mui/icons-material/Done';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import BoltIcon from '@mui/icons-material/Bolt';
import BugReportIcon from '@mui/icons-material/BugReport';
import NotesIcon from '@mui/icons-material/Notes';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import { AdmonitionTypeEnum } from '@rapid-cmi5/types/cmi5';

/**
 * Admonition Color
 * @param admonitionType
 * @returns
 */
export const getAdmonitionColor = (admonitionType: AdmonitionTypeEnum) => {
  switch (admonitionType) {
    case AdmonitionTypeEnum.note:
      return 'info';
    case AdmonitionTypeEnum.abstract:
      return 'info';
    case AdmonitionTypeEnum.info:
      return 'info';
    case AdmonitionTypeEnum.tip:
      return 'info';
    case AdmonitionTypeEnum.success:
      return 'success';
    case AdmonitionTypeEnum.question:
      return 'info';
    case AdmonitionTypeEnum.warning:
      return 'warning';
    case AdmonitionTypeEnum.failure:
      return 'error';
    case AdmonitionTypeEnum.danger:
      return 'error';
    case AdmonitionTypeEnum.bug:
      return 'error';
    case AdmonitionTypeEnum.example:
      return 'inherit';
    case AdmonitionTypeEnum.quote:
      return 'inherit';
  }
};

export const getAdmonitionHexColor = (admonitionType: AdmonitionTypeEnum) => {
  switch (admonitionType) {
    case AdmonitionTypeEnum.example:
      return '#CBB8FE';
    case AdmonitionTypeEnum.quote:
      return '#808080BF';
    default:
      return '';
  }
};

export const getSeverityHexColor = (
  severity:
    | 'info'
    | 'disabled'
    | 'action'
    | 'inherit'
    | 'success'
    | 'warning'
    | 'error'
    | 'primary'
    | 'secondary',
) => {
  switch (severity) {
    case 'info':
      return '#03a9f41A';
    case 'success':
      return '#4caf501A';
    case 'warning':
      return '#ff98001A';
    case 'error':
      return '#EF53501A';
    default:
      return '';
  }
};

export const getSeverityHexBorderColor = (
  severity:
    | 'info'
    | 'disabled'
    | 'action'
    | 'inherit'
    | 'success'
    | 'warning'
    | 'error'
    | 'primary'
    | 'secondary',
) => {
  switch (severity) {
    case 'info':
      return '#03a9f4';
    case 'success':
      return '#4caf50';
    case 'warning':
      return '#ff9800';
    case 'error':
      return '#EF5350';
    default:
      return '';
  }
};

/**
 * Admonition Icons
 * @param admonitionType
 * @returns
 */
export const getAdmonitionIcon = (admonitionType: AdmonitionTypeEnum) => {
  switch (admonitionType) {
    case AdmonitionTypeEnum.note:
      return <ModeEditIcon color="info" />;
    case AdmonitionTypeEnum.abstract:
      return <AssignmentIcon color="info" />;
    case AdmonitionTypeEnum.info:
      return <InfoIcon color="info" />;
    case AdmonitionTypeEnum.tip:
      return <WhatshotIcon color="info" />;
    case AdmonitionTypeEnum.success:
      return <DoneIcon color="success" />;
    case AdmonitionTypeEnum.question:
      return <QuestionMarkIcon color="info" />;
    case AdmonitionTypeEnum.warning:
      return <ReportProblemIcon color="warning" />;
    case AdmonitionTypeEnum.failure:
      return <ErrorOutlineIcon color="error" />;
    case AdmonitionTypeEnum.danger:
      return <BoltIcon color="error" />;
    case AdmonitionTypeEnum.bug:
      return <BugReportIcon color="error" />;
    case AdmonitionTypeEnum.example:
      return (
        <div style={{ color: '#9873FE' }}>
          <NotesIcon color="inherit" />
        </div>
      );
    case AdmonitionTypeEnum.quote:
      return (
        <div style={{ color: 'grey' }}>
          <FormatQuoteIcon color="inherit" />
        </div>
      );
  }
};
