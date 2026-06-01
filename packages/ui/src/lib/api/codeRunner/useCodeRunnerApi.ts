import { CodeRunnerContent } from '@rapid-cmi5/cmi5-build-common';
import { useCodeRunnerClient } from '../../contexts/ApiContext';
import { languages } from './queryKeys';

export function useCodeRunnerApi() {
  const { enabled, client } = useCodeRunnerClient();

  /**
   * Lists the languages and versions the Code Runner service supports.
   * Used to populate language pickers in authoring UIs. The underlying
   * query is gated on `enabled`, so it stays idle when no `codeRunnerUrl`
   * was configured on `ApiProviders`.
   */
  const getLanguages = () => {
    return client.listLanguages.useQuery({
      queryKey: [languages],
      enabled,
    });
  };

  /**
   * Compiles and executes a learner submission against the evaluator
   * defined on a code-runner question, and returns the runner's output.
   *
   * The submission and evaluator are concatenated before being sent so the
   * evaluator runs in the same process as the learner code. Throws on a
   * non-200 response so callers can distinguish a runner/transport failure
   * from a successful run where `success` is `false` (failed evaluation).
   */
  const executeCode = async (
    submissionStr: string,
    content: CodeRunnerContent,
  ) => {
    const { status, body } = await client.execute.mutate({
      body: {
        submissionContent: `${submissionStr}\n${content.evaluator}`,
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
