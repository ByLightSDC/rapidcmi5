/**
 * Reads in the given file and parses to JSON format
 * @param {*} file The file to read (as returned from FileUpload)
 * @param {(formattedJson: string, fileError?: string) => void} callback Method to pass the formatted JSON string to upon completion
 */
export function readJsonFile(
  file: any,
  callback: (formattedJson: string, fileError?: string) => void,
) {
  let fileContents = '';
  const reader = new FileReader();
  reader.readAsText(file);
  reader.onload = (evt) => {
    fileContents = evt?.target?.result as string;
    if (fileContents) {
      try {
        // JSON parse expects NO multiline characters
        const parsed = JSON.parse(
          fileContents
            .replace(/\n/g, '') //'\\n')
            .replace(/\r/g, '') //'\\r')
            .replace(/\t/g, ''), //'\\t')
        );
        const formattedJson = JSON.stringify(parsed, null, 2);
        callback(formattedJson);
      } catch {
        callback('', 'Error parsing JSON file content');
      }
    } else {
      callback('', 'Error reading JSON file content');
    }
  };
  reader.onerror = () => {
    reader.onerror = () => {
      //REF throw reader.error // is there any info from this error that may be useful to display to user?
      callback('', 'Error reading JSON file');
    };
  };
}
