import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaUpload, FaFile, FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';
import { uploadToS3 } from '../../services/s3Service';

interface FileWithStatus extends File {
    preview?: string;
    uploadProgress?: number;
    status?: 'pending' | 'uploading' | 'success' | 'error';
    errorMessage?: string;
    url?: string;
}

const UploadFinancialStatement = () => {
    const [files, setFiles] = useState<FileWithStatus[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const newFiles = acceptedFiles.map(file => Object.assign(file, {
            preview: URL.createObjectURL(file),
            uploadProgress: 0,
            status: 'pending' as const
        }));

        setFiles(prev => [...prev, ...newFiles]);
    }, []);

    const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'application/vnd.ms-excel': ['.xls'],
            'text/csv': ['.csv']
        },
        maxSize: 50 * 1024 * 1024, // 50MB
    });

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleUpload = async () => {
        if (files.length === 0) return;

        setIsUploading(true);

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file.status === 'success') continue;

            try {
                // Update file status to uploading
                setFiles(prev => prev.map((f, idx) =>
                    idx === i ? { ...f, status: 'uploading' } : f
                ));

                // Upload the file to S3 using single-part upload
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
            }
        }

        setIsUploading(false);
    };

    return (
        <div className="container mx-auto py-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Upload Financial Statements
            </h2>
            <p className="text-gray-600 mb-6">
                Upload your financial documents securely to AWS S3 (max 50MB per file).
            </p>

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
                            disabled={isUploading || files.every(f => f.status === 'success')}
                            className={`px-4 py-2 rounded-md font-medium ${
                                isUploading || files.every(f => f.status === 'success')
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
                        {files.map((file, index) => (
                            <div key={index} className="flex items-center p-3 border rounded-lg hover:bg-gray-50">
                                {/* Status icon */}
                                <div className="mr-3">
                                    {file.status === 'uploading' && <FaSpinner className="text-blue-500 animate-spin" />}
                                    {file.status === 'success' && <FaCheckCircle className="text-green-500" />}
                                    {file.status === 'error' && <FaTimesCircle className="text-red-500" />}
                                    {file.status === 'pending' && <FaFile className="text-gray-400" />}
                                </div>

                                {/* File info */}
                                <div className="flex-1">
                                    <p className="font-medium text-gray-800 truncate">{file.name}</p>
                                    {typeof file.size === 'number' && file.size > 0 ? (
                                        <p className="text-sm text-gray-500">
                                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                                        </p>
                                    ) : (
                                        <p className="text-sm text-gray-500">
                                            {file.type || 'Document'}
                                        </p>
                                    )}

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
                                {file.status !== 'uploading' && (
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

                    {/* Summary */}
                    {files.some(f => f.status === 'success') && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <p className="text-sm text-gray-600">
                                <strong>{files.filter(f => f.status === 'success').length}</strong> of {files.length} files uploaded successfully
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default UploadFinancialStatement;