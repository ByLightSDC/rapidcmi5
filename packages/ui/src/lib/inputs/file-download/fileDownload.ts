/*
 * Common functions for exporting a file to the user's filesystem
 */

export const jsonFileType = 'application/json';
export const fileTypeText = 'text/plain';
export const fileTypeCSV = 'text/comma-separated-values';
export const fileTypeTSV = 'text/tab-separated-values';

/**
 * Verifies whether file chosen has CSV file type
 * @param {string} fileType Text to be verified
 * @return {boolean} Whether file is CSV
 */
export const getIsCSVFile = (fileType: string) => {
  return (
    fileType.indexOf('csv') >= 0 ||
    fileType.indexOf('comma-separated-values') >= 0
  );
};

/**
 * Verifies whether file chosen has TSV file type
 * @param {string} fileType Text to be verified
 * @return {boolean} Whether file is TSV
 */
export const getIsTSVFile = (fileType: string) => {
  return (
    fileType.indexOf('tsv') >= 0 ||
    fileType.indexOf('tab-separated-values') >= 0
  );
};

/**
 * Downloads the file specified
 * @param {any} fileData File to download
 * @param {string} fileName File name to use
 * @param {string} fileType File type to use
 */
export function downloadFile(
  fileData: any,
  fileName: string,
  fileType: string,
) {
  let exportData;
  if (fileType === jsonFileType) {
    exportData = `data:${fileType};charset=utf-8, ${encodeURIComponent(
      JSON.stringify(fileData, null, 2),
    )}`;
  } else {
    exportData = `data:${fileType};charset=utf-8, ${encodeURIComponent(
      fileData,
    )}`;
  }

  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute('href', exportData);
  downloadAnchorNode.setAttribute('download', fileName);
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

export function formatFileName(fileName: string) {
  return fileName.replace(/\s/g, '-').replace(/'/g, '');
}
