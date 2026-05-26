import { CodeRunnerContent } from '@rapid-cmi5/cmi5-build-common';
import { useCodeRunnerClient } from '../../contexts/ApiContext';

export function useCodeRunnerApi() {
  const { enabled, client } = useCodeRunnerClient();

  const getLanguages = () => {
    return client.listLanguages.useQuery({
      queryKey: ['codeRunnerLanguages'],
      enabled,
    });
  };

  const executeCode = async (
    submissionStr: string,
    content: CodeRunnerContent,
  ) => {
    const { status, body } = await client.execute.mutate({
      body: {
        submissionContent: `${submissionStr}${content.evaluator}`,
        language: content.programmingLanguage,
        languageVersion: content.languageVersion,
      },
    });

    if (status != 200) throw Error('failed code runner');
    const stdout = body.stdout?.trim() ?? '';
    const stderr = body.stderr?.trim() ?? '';
    const cmpinfo = body.cmpinfo?.trim() ?? '';
    const success = body.success ?? false;

    return { stdout, stderr, cmpinfo, success };
  };
  return {
    getLanguages,
    executeCode,
    isCodeRunnerEnabled: enabled,
  };
}
