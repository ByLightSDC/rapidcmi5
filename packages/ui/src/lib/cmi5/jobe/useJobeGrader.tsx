import { JobeContent, JobeSubmitResponse } from '@rapid-cmi5/cmi5-build-common';
import axios from 'axios';
import { debugLog } from '../../utility/logger';

export default function useJobeGrader(jobeContent: JobeContent) {
  // api
  const apiUrl =
    'https://rangeos-jobe.prod-cp.rangeos.engineering/jobe/index.php/restapi/runs/';

  const safelyCombineCode = (studentCode: string, testFile: string): string => {
    // Add the student's code and properly indent the test logic inside the main block
    const indentedTestLogic = indent(testFile, 4); // Indent the test file by 4 spaces
    return `
# Student Code
${studentCode}
        
# Test Logic
if __name__ == "__main__":
${indentedTestLogic}`;
  };

  const indent = (code: string, spaces: number): string => {
    return code
      .split('\n')
      .map((line) => ' '.repeat(spaces) + line)
      .join('\n');
  };

  const submitCode = async (
    submissionStr: string,
    evaluator: string,
  ): Promise<JobeSubmitResponse> => {
    debugLog('[JB] Submit Python Code');

    // Safely combine student code and test file
    const combinedCode = safelyCombineCode(submissionStr, evaluator);

    const runSpec = {
      language_id: 'python3',
      sourcefilename: 'main.py',
      sourcecode: combinedCode,
      parameters: {
        cputime_limit: 5, // Limit CPU time in seconds
        memory_limit: 65536, // Limit memory in kilobytes
      },
    };

    try {
      const response = await axios.post(apiUrl, { run_spec: runSpec });
      const { outcome, stdout, stderr, cmpinfo } = response.data;

      if (outcome === 15) {
        return { isSuccess: true, message: stdout };
      } else {
        return { isSuccess: false, message: stderr || cmpinfo };
      }
    } catch (error) {
      return {
        isSuccess: false,
        message: `Error communicating with Jobe server:${error}`,
      };
    }
  };

  const resetGrader = () => {};

  return { resetGrader, submitCode };
}
