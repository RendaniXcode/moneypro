import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaUpload, FaFile, FaCheckCircle, FaTimesCircle, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import { uploadToS3 } from '../../services/s3Service';

interface FileWithStatus extends File {
  preview?: string;
  uploadProgress?: number;
  status?: 'pending' | 'uploading' | 'success' | 'error' | 'validating';
  errorMessage?: string;
  url?: string;
}

// File validation constants
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const VALID_EXCEL_EXTENSIONS = ['.xlsx', '.xls'];
const VALID_EXTENSIONS = {
  'application/pdf': ['.pdf'],
  'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/vnd.ms-excel': ['.xls'],
  'text/csv': ['.csv']
};

const FileUploader = ({ onUploadSuccess = () => {} }) => {
  const [files, setFiles] = useState<FileWithStatus[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Validate file before accepting
  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`;
    }

    // Check file extension for Excel files (additional security for xlsx vulnerability)
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (file.type.includes('excel') && extension && !VALID_EXCEL_EXTENSIONS.includes(`.${extension}`)) {
      return "Invalid Excel file format. Only .xlsx and .xls files are allowed.";
    }

    return null; // No error
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => {
      const validationError = validateFile(file);

      return Object.assign(file, {
        preview: URL.createObjectURL(file),
        uploadProgress: 0,
        status: validationError ? 'error' : 'pending' as const,
        errorMessage: validationError || undefined
      });
    });

    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: VALID_EXTENSIONS,
    maxSize: MAX_FILE_SIZE,
  });

  const removeFile = (index: number) => {
    setFiles(prev => {
      const newFiles = [...prev];
      // Revoke object URL to avoid memory leaks
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview!);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    // Filter out files with errors
    const validFiles = files.filter(file => file.status !== 'error');
    if (validFiles.length === 0) return;

    setIsUploading(true);

    let allSuccessful = true;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.status === 'success' || file.status === 'error') continue;

      try {
        // Update file status to validating first
        setFiles(prev => prev.map((f, idx) =>
            idx === i ? { ...f, status: 'validating' } : f
        ));

        // Additional validation before upload
        const validationError = validateFile(file);
        if (validationError) {
          throw new Error(validationError);
        }

        // Update file status to uploading
        setFiles(prev => prev.map((f, idx) =>
            idx === i ? { ...f, status: 'uploading' } : f
        ));

        // Upload the file to S3
        const fileUrl = await uploadToS3(file, (progress) => {
          setFiles(prev => prev.map((f, idx) =>
              idx === i ? { ...f, uploadProgress: progress } : f
          ));
        });

        // Update file status to success
        setFiles(prev => prev.map((f, idx) =>
            idx === i ? {
              ...f,
              status: 'success',
              uploadProgress: 100,
              url: fileUrl
            } : f
        ));

      } catch (error) {
        // Update file status to error
        setFiles(prev => prev.map((f, idx) =>
            idx === i ? {
              ...f,
              status: 'error',
              errorMessage: error instanceof Error ? error.message : 'Upload failed'
            } : f
        ));

        allSuccessful = false;
      }
    }

    setIsUploading(false);

    // Call the success callback if all files were uploaded successfully
    if (allSuccessful && files.length > 0) {
      onUploadSuccess();
    }
  };

  // Clean up previews when component unmounts
  React.useEffect(() => {
    return () => {
      files.forEach(file => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, [files]);

  return (
      <div className="max-w-4xl mx-auto">
        {/* Drop zone */}
        <div
            {...getRootProps()}
            className={`border-2 border-dashed p-8 rounded-lg text-center cursor-pointer mb-6 transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}
        >
          <input {...getInputProps()} />
          <FaUpload className={`mx-auto h-12 w-12 mb-4 ${isDragActive ? 'text-blue-500' : 'text-gray-400'}`} />
          <p className="text-lg font-medium text-gray-700 mb-2">
            {isDragActive ? 'Drop files here...' : 'Drag & drop files here, or click to select'}
          </p>
          <p className="text-sm text-gray-500">
            Supports PDF, Images, Excel, and CSV files (max 50MB each)
          </p>
        </div>

        {/* File list */}
        {files.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  {files.length} {files.length === 1 ? 'File' : 'Files'} Selected
                </h3>

                <button
                    onClick={handleUpload}
                    disabled={isUploading || files.every(f => f.status === 'success' || f.status === 'error')}
                    className={`px-4 py-2 rounded-md font-medium ${
                        isUploading || files.every(f => f.status === 'success' || f.status === 'error')
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
                      'Upload Financial Statement'
                  )}
                </button>
              </div>

              <div className="space-y-3">
                {files.map((file, index) => (
                    <div key={index} className="flex items-center p-3 border rounded-lg hover:bg-gray-50">
                      {/* Status icon */}
                      <div className="mr-3">
                        {file.status === 'uploading' && <FaSpinner className="text-blue-500 animate-spin" />}
                        {file.status === 'validating' && <FaSpinner className="text-amber-500 animate-spin" />}
                        {file.status === 'success' && <FaCheckCircle className="text-green-500" />}
                        {file.status === 'error' && <FaExclamationTriangle className="text-red-500" />}
                        {file.status === 'pending' && <FaFile className="text-gray-400" />}
                      </div>

                      {/* File info */}
                      <div className="flex-1">
                        <p className="font-medium text-gray-800 truncate">{file.name}</p>
                        <p className="text-sm text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>

                        {/* Progress bar */}
                        {file.status === 'uploading' && (
                            <div className="mt-2 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                              <div
                                  className="bg-blue-600 h-full"
                                  style={{ width: `${file.uploadProgress || 0}%` }}
                              ></div>
                            </div>
                        )}

                        {/* Error message */}
                        {file.status === 'error' && file.errorMessage && (
                            <p className="text-sm text-red-500 mt-1">{file.errorMessage}</p>
                        )}

                        {/* Success URL */}
                        {file.status === 'success' && file.url && (
                            <p className="text-sm text-green-600 mt-1 truncate">
                              Uploaded successfully
                            </p>
                        )}
                      </div>

                      {/* Remove button */}
                      {file.status !== 'uploading' && file.status !== 'validating' && (
                          <button
                              onClick={() => removeFile(index)}
                              className="ml-2 text-gray-400 hover:text-red-500"
                              title="Remove file"
                          >
                            <FaTimesCircle />
                          </button>
                      )}
                    </div>
                ))}
              </div>
            </div>
        )}
      </div>
  );
};

export default FileUploader;