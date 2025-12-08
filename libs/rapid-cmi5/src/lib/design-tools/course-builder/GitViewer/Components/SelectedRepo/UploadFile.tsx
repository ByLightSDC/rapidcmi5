// // Import React FilePond
// import React, { useCallback, useEffect, useRef } from "react";
// import Dropzone, { useDropzone } from "react-dropzone";
// import CloudUploadIcon from "@mui/icons-material/CloudUpload";
// import CheckCircleIcon from "@mui/icons-material/CheckCircle";
// import ErrorIcon from "@mui/icons-material/Error";

// // Import FilePond styles
// import "filepond/dist/filepond.min.css";
// import { useState } from "react";
// import { createFile } from "../../utils/fileSystem";
// import { useSelector } from "react-redux";
// import { RepoState } from "../../slices/repoManagerSlice";
// import { RootState } from "../../store";

// export default function UploadFile() {
//   const { currentRepo, fileState }: RepoState = useSelector(
//     (state: RootState) => state.repoManager
//   );

//   const currentRepoRef = useRef(currentRepo);
//   const workingDirRef = useRef(fileState.currentWorkingDir);

//   useEffect(() => {
//     currentRepoRef.current = currentRepo;
//     workingDirRef.current = fileState.currentWorkingDir;
//   }, [currentRepo, fileState.currentWorkingDir]);

//   const [savedFile, setSavedFile] = useState<string | null>(null);
//   const [error, setError] = useState<string | null>(null);

//   const onDrop = useCallback((acceptedFiles: File[]) => {
//     console.log("Files dropped:", acceptedFiles);
//     // You can handle the file upload logic here (e.g., send to a server)
//     if (acceptedFiles.length === 0) return;

//     const file = acceptedFiles[0];
//     const currentRepo = currentRepoRef.current;
//     const currentWorkingDir = workingDirRef.current;

//     if (currentRepo === null) {
//       console.log("No repo selected");
//       return;
//     }
//     if (currentWorkingDir === null) {
//       console.log("No dir selected");
//       return;
//     }
//     let fileOutputPath = `${currentRepo}/${currentWorkingDir}/`;
//     if (currentWorkingDir === "/") {
//       fileOutputPath = currentRepo;
//     }
//     let customFileName = window.prompt(
//       `Enter a name for the file: ${fileOutputPath}`,
//       file.name
//     );
//     if (customFileName === null) {
//       customFileName = file.name;
//     }
//     customFileName = `${currentWorkingDir}/${customFileName}`;

//     const reader = new FileReader();
//     reader.readAsArrayBuffer(file);
//     reader.onload = async () => {
//       if (reader.result) {
//         try {
//           // Write file to Lightning FS
//           createFile(
//             currentRepo,
//             customFileName,
//             new Uint8Array(reader.result as ArrayBuffer)
//           );
//           setSavedFile(customFileName);
//           setError(null);
//         } catch (err) {
//           console.error("Error saving file:", err);
//           setError("Failed to save file.");
//         }
//       }
//     };
//   }, []);

//   const { getRootProps, getInputProps, isDragActive } = useDropzone({
//     onDrop,

//     multiple: true, // Allow multiple files
//   });

//   return (
//     <div className="max-w-md mx-auto">
//       <div
//         {...getRootProps()}
//         className={`border-2 rounded-xl p-6 text-center cursor-pointer transition-all 
//         ${
//           isDragActive
//             ? "border-blue-500 bg-blue-50"
//             : "border-gray-300 bg-gray-100 hover:bg-gray-200"
//         }`}
//       >
//         <input {...getInputProps()} />
//         <CloudUploadIcon className="text-blue-500 mb-2" fontSize="large" />
//         {isDragActive ? (
//           <p className="text-blue-500 font-semibold">Drop the file here...</p>
//         ) : (
//           <p className="text-gray-600 font-medium">
//             Drag & drop a file here, or{" "}
//             <span className="text-blue-600">click to upload</span>
//           </p>
//         )}
//       </div>

//       {savedFile && (
//         <div className="mt-4 flex items-center text-green-600">
//           <CheckCircleIcon className="mr-2" />
//           <p>
//             File saved: <strong>{savedFile}</strong>
//           </p>
//         </div>
//       )}

//       {error && (
//         <div className="mt-4 flex items-center text-red-600">
//           <ErrorIcon className="mr-2" />
//           <p>{error}</p>
//         </div>
//       )}
//     </div>
//   );
// }
