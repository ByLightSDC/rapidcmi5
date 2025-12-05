// import { debugLog } from '@rangeos-nx/ui/branded';
// import { RepoAccessObject } from '../../../../redux/repoManagerReducer';
// import { getFsInstance } from '../utils/gitFsInstance';

// export type FileContent = {
//   content: string;
//   type: string;
// };

// export const getFileContent = async (
//   r: RepoAccessObject,
//   filePath: string,
// ): Promise<FileContent | null> => {
//   const gitFs = getFsInstance();

//   try {
//     const res = await gitFs.readFileContent(r, filePath);
//     if (res === null) {
//       return null;
//     }
//     const content = res.content;

//     let fileType: string;
//     let fileContent: string | Uint8Array = '';

//     // Detect file type
//     if (filePath.endsWith('.json')) {
//       fileType = 'json';
//     } else if (/\.(png|jpg|jpeg|gif)$/i.test(filePath)) {
//       fileType = 'image';
//     } else {
//       fileType = 'plaintext';
//     }

//     if (fileType === 'image') {
//       if (content instanceof Uint8Array) {
//         const blob = new Blob([new Uint8Array(content)], { type: 'image/png' });
//         const imageUrl = URL.createObjectURL(blob);
//         fileContent = imageUrl;
//       }
//     } else {
//       // Ensure content is in the right format for text
//       if (content instanceof Uint8Array) {
//         fileContent = new TextDecoder().decode(content);
//       } else if (typeof content === 'string') {
//         fileContent = content; // Already a string, no decoding needed
//       } else if (content && typeof content === 'object') {
//         fileContent = JSON.stringify(content, null, 2); // Pretty-print JSON objects
//       } else {
//         debugLog('Unexpected content type:', typeof content);
//         fileContent = 'Error: Unable to read file content';
//       }
//     }
//     const file: FileContent = { content: fileContent, type: fileType };

//     return file;
//   } catch (error) {
//     debugLog('Error reading file:', error);
//     return { content: '', type: 'plaintext' };
//   }
// };
