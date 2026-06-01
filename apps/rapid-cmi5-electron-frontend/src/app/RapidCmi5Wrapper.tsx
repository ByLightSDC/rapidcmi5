import { Credentials, GitUserConfig } from '@rapid-cmi5/cmi5-build-common';
import { RapidCmi5 } from '@rapid-cmi5/react-editor';
import { useContext } from 'react';
import { UserConfigContext } from './contexts/UserConfigContext';
import { AuthContext } from './contexts/AuthContext';
import { detectIsElectron } from './utils/appType';
import { useAppUi } from './contexts/AppUiContext';

export function RapidCmi5Wrapper() {
  const isElectron = detectIsElectron();

  const { token, parsedUserToken } = useContext(AuthContext);
  const { gitUser, gitCredentials, ssoConfig, setGitCredentials, setGitUser } =
    useContext(UserConfigContext);
  const { openAiPanel, aiThinking } = useAppUi();

  const quizBankURL = ssoConfig?.quizBankApiUrl;
  const rangeURL = ssoConfig?.rangeRestApiUrl;

  const handleOverrideGlobalGitConfig = (
    config?: GitUserConfig,
    creds?: Credentials,
  ) => {
    if (config) {
      setGitUser(config);
    }
    if (setGitCredentials && creds) {
      setGitCredentials(creds);
    }
  };

  // Git global config overrides the keycloak name and email
  const userFullName =
    gitUser?.authorName || parsedUserToken?.name?.toLowerCase() || '';
  const userEmail =
    gitUser?.authorEmail || parsedUserToken?.email?.toLowerCase() || '';

  return (
    <RapidCmi5
      handleOverrideGlobalGitConfig={handleOverrideGlobalGitConfig}
      userAuth={{
        token,
        userEmail: userEmail,
        userName: userFullName,
        gitCredentials,
        apiUser: parsedUserToken?.email?.toLowerCase(),
      }}
      downloadCmi5Player={async () => {
        const response = await fetch('/assets/cc-cmi5-player.zip');
        return response;
      }}
      apiUrls={{
        rangeUrl: rangeURL,
        codeRunnerUrl: rangeURL,
        quizBankUrl: quizBankURL,
      }}
      onAiClick={isElectron ? openAiPanel : undefined}
      aiThinking={isElectron ? aiThinking : false}
    />
  );
}
