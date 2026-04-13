import { DeleteForever, LocalActivity } from '@mui/icons-material';
import SettingsIcon from '@mui/icons-material/Settings';

export enum RapidIconKey {
  activity,
  delete,
  configure,
  scenario,
  codeRunner,
  ctf,
  quiz,
}

const icons = {
  [RapidIconKey.activity]: <LocalActivity color="primary" />,
  [RapidIconKey.ctf]: <LocalActivity color="primary" />,
  [RapidIconKey.codeRunner]: <LocalActivity color="primary" />,
  [RapidIconKey.quiz]: <LocalActivity color="primary" />,
  [RapidIconKey.scenario]: <LocalActivity color="primary" />,
  [RapidIconKey.delete]: <DeleteForever color="primary" />,
  [RapidIconKey.configure]: <SettingsIcon color="primary" />,
};

export const rapidIconFor = (iconKey: RapidIconKey) => {
  return icons[iconKey];
};
