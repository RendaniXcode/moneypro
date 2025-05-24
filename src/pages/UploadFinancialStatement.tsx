import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaUpload, FaFile, FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';
import { uploadToS3 } from '../services/s3Service';

// Supported file types
const ACCEPTED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/vnd.ms-excel': ['.xls'],
  'text/csv': ['.csv'],
  'application/json': ['.json'],
};

const UploadFinancialStatement = () => {
  // File state
  const [files, setFiles] = useState<File[]>([]);
  const [uploadStatus, setUploadStatus] = useState<{[key: string]: {
      progress: number;
      status: 'pending' | 'uploading' | 'success' | 'error';
      url?: string;
      error?: string;
    }}>({});
  const [isUploading, setIsUploading] = useState(false);

  // File dropzone configuration
  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Add new files to the state
    setFiles(prev => [...prev, ...acceptedFiles]);

    // Initialize upload status for new files
    const newUploadStatus = {...uploadStatus};
    acceptedFiles.forEach(file => {
      if (!newUploadStatus[file.name]) {
        newUploadStatus[file.name] = {
          progress: 0,
          status: 'pending'
        };
      }
    });
    setUploadStatus(newUploadStatus);
  }, [uploadStatus]);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  const removeFile = (fileName: string) => {
    setFiles(prev => prev.filter(file => file.name !== fileName));
    setUploadStatus(prev => {
      const newStatus = {...prev};
      delete newStatus[fileName];
      return newStatus;
    });
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);

    for (const file of files) {
      if (uploadStatus[file.name].status === 'success') continue;

      try {
        // Update status to uploading
        setUploadStatus(prev => ({
          ...prev,
          [file.name]: {
            ...prev[file.name],
            status: 'uploading'
          }
        }));

        // Upload the file to S3
        const fileUrl = await uploadToS3(file, (progress) => {
          setUploadStatus(prev => ({
            ...prev,
            [file.name]: {
              ...prev[file.name],
              progress
            }
          }));
        });

        // Update status to success
        setUploadStatus(prev => ({
          ...prev,
          [file.name]: {
            ...prev[file.name],
            status: 'success',
            progress: 100,
            url: fileUrl
          }
        }));

      } catch (error) {
        // Update status to error
        setUploadStatus(prev => ({
          ...prev,
          [file.name]: {
            ...prev[file.name],
            status: 'error',
            error: error instanceof Error ? error.message : 'Upload failed'
          }
        }));
      }
    }

    setIsUploading(false);
  };

  return (
      <div className="container mx-auto py-6 px-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Upload Financial Documents
        </h2>

        {/* Drop zone */}
        <div
            {...getRootProps()}
            className={`border-2 border-dashed p-8 rounded-lg text-center cursor-pointer mb-6 
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}
        >
          <input {...getInputProps()} />
          <FaUpload className={`mx-auto h-12 w-12 mb-4 ${isDragActive ? 'text-blue-500' : 'text-gray-400'}`} />
          <p className="text-lg font-medium text-gray-700 mb-2">
            {isDragActive ? 'Drop files here...' : 'Drag & drop files here, or click to select'}
          </p>
          <p className="text-sm text-gray-500">
            Supports PDF, Excel, CSV, and JSON files (max 50MB each)
          </p>
        </div>

        {/* File rejection errors */}
        {fileRejections.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h3 className="text-red-700 font-medium mb-2">File upload errors:</h3>
              <ul className="list-disc pl-5 text-red-600 text-sm">
                {fileRejections.map(({ file, errors }, index) => (
                    <li key={index} className="mb-1">
                      <strong>{file.name}</strong>: {errors.map(e => e.message).join(', ')}
                    </li>
                ))}
              </ul>
            </div>
        )}

        {/* File list */}
        {files.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  {files.length} {files.length === 1 ? 'File' : 'Files'} Selected
                </h3>

                <button
                    onClick={handleUpload}
                    disabled={isUploading || files.every(file => uploadStatus[file.name]?.status === 'success')}
                    className={`px-4 py-2 rounded-md font-medium ${
                        isUploading || files.every(file => uploadStatus[file.name]?.status === 'success')
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                >
                  {isUploading ? (
                      <span className="flex items-center">
                  <FaSpinner className="animate-spin mr-2" />
                  Uploading...
                </span>
                  ) : (
                      'Upload to S3'
                  )}
                </button>
              </div>

              <div className="space-y-3">
                {files.map((file, index) => {
                  const status = uploadStatus[file.name] || { progress: 0, status: 'pending' };

                  return (
                      <div key={index} className="flex items-center p-3 border rounded-lg hover:bg-gray-50">
                        {/* Status icon */}
                        <div className="mr-3">
                          {status.status === 'uploading' && <FaSpinner className="text-blue-500 animate-spin" />}
                          {status.status === 'success' && <FaCheckCircle className="text-green-500" />}
                          {status.status === 'error' && <FaTimesCircle className="text-red-500" />}
                          {status.status === 'pending' && <FaFile className="text-gray-400" />}
                        </div>

                        {/* File info */}
                        <div className="flex-1">
                          <p className="font-medium text-gray-800 truncate">{file.name}</p>
                          <p className="text-sm text-gray-500">
                            {typeof file.size === 'number' && file.size > 0
                                ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
                                : file.type || 'Document'}
                          </p>

                          {/* Progress bar */}
                          {status.status === 'uploading' && (
                              <div className="mt-2 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                <div
                                    className="bg-blue-600 h-full"
                                    style={{ width: `${status.progress || 0}%` }}
                                ></div>
                              </div>
                          )}

                          {/* Error message */}
                          {status.status === 'error' && status.error && (
                              <p className="text-sm text-red-500 mt-1">{status.error}</p>
                          )}

                          {/* Success URL */}
                          {status.status === 'success' && status.url && (
                              <p className="text-sm text-green-600 mt-1">
                                Uploaded successfully
                              </p>
                          )}
                        </div>

                        {/* Remove button */}
                        {status.status !== 'uploading' && (
                            <button
                                onClick={() => removeFile(file.name)}
                                className="ml-2 text-gray-400 hover:text-red-500"
                                title="Remove file"
                            >
                              <FaTimesCircle />
                            </button>
                        )}
                      </div>
                  );
                })}
              </div>

              {/* Upload summary */}
              {files.some(file => uploadStatus[file.name]?.status === 'success') && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      <strong>{files.filter(file => uploadStatus[file.name]?.status === 'success').length}</strong> of {files.length} files uploaded successfully
                    </p>
                  </div>
              )}
            </div>
        )}
      </div>
  );
};

export default UploadFinancialStatement;