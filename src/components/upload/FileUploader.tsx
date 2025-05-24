import { useCallback, useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { useDispatch, useSelector } from 'react-redux'
import { FaCloudUploadAlt, FaFile, FaFileExcel, FaFilePdf, FaFileCode, FaFileCsv, FaTimes, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa'
import { 
  addFiles, 
  removeFile, 
  updateFileProgress, 
  updateFileStatus, 
  setIsUploading,
  updateFileData,
  FileItem
} from '../../store/uploadSlice'
import { validateFile, createFileItem, parseFile } from '../../services/fileProcessor'
import { uploadApi } from '../../services/api'
import { RootState } from '../../store'

interface FileUploaderProps {
  onUploadSuccess?: () => void;
}

const FileUploader = ({ onUploadSuccess }: FileUploaderProps) => {
  const dispatch = useDispatch()
  const { files, isUploading } = useSelector((state: RootState) => state.upload)
  const [uploadError, setUploadError] = useState<string | null>(null)
  
  // Process uploads whenever files array changes
  useEffect(() => {
    const uploadPendingFiles = async () => {
      const pendingFiles = files.filter(file => file.status === 'pending')
      if (pendingFiles.length === 0) return
      
      setUploadError(null)
      dispatch(setIsUploading(true))
      
      for (const fileItem of pendingFiles) {
        try {
          // Find the real File object from uploaded files
          const realFile = document.getElementById('fileInput') as HTMLInputElement
          if (!realFile?.files?.length) {
            throw new Error('No file found for upload')
          }
          
          const fileToUpload = Array.from(realFile.files).find(f => f.name === fileItem.name)
          if (!fileToUpload) {
            throw new Error('File not found for upload')
          }
          
          // Update status to uploading
          dispatch(updateFileStatus({ id: fileItem.id, status: 'uploading' }))
          
          // Try to parse the file if it's a parsable format (Excel, CSV, JSON)
          if (fileItem.type !== 'application/pdf') {
            try {
              const parsedData = await parseFile(fileToUpload)
              dispatch(updateFileData({ id: fileItem.id, data: parsedData }))
            } catch (parseError) {
              console.warn('Could not parse file:', parseError)
              // Continue with upload even if parsing fails
            }
          }
          
          // Get presigned URL from API
          const { presignedUrl, fileKey } = await uploadApi.getPresignedUrl(
            fileToUpload.name, 
            fileToUpload.type
          )
          
          // Upload file to S3
          await uploadApi.uploadToS3(
            presignedUrl, 
            fileToUpload, 
            (progress) => {
              dispatch(updateFileProgress({ id: fileItem.id, progress }))
            }
          )
          
          // Notify backend that upload is complete
          await uploadApi.notifyUploadComplete(fileKey)
          
          // Update status to processing (this would normally be updated by a websocket or polling)
          dispatch(updateFileStatus({ id: fileItem.id, status: 'processing' }))
          
          // Simulate processing completion after 2 seconds
          setTimeout(() => {
            dispatch(updateFileStatus({ 
              id: fileItem.id, 
              status: 'success',
              url: `https://example.com/files/${fileKey}` 
            }))
            
            // Call onUploadSuccess callback when at least one file is successfully uploaded
            if (onUploadSuccess) {
              onUploadSuccess()
            }
          }, 2000)
        } catch (error) {
          console.error('Upload error:', error)
          setUploadError(error instanceof Error ? error.message : 'Unknown error occurred')
          dispatch(updateFileStatus({ 
            id: fileItem.id, 
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error occurred'
          }))
        }
      }
      
      dispatch(setIsUploading(false))
    }
    
    uploadPendingFiles()
  }, [files, dispatch, onUploadSuccess])
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setUploadError(null)
    const newFiles: FileItem[] = []
    
    acceptedFiles.forEach(file => {
      const validation = validateFile(file)
      
      if (validation.valid) {
        newFiles.push(createFileItem(file))
      } else {
        setUploadError(validation.error)
        console.error(`File validation failed: ${validation.error}`)
      }
    })
    
    if (newFiles.length > 0) {
      dispatch(addFiles(newFiles))
    }
  }, [dispatch])
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/json': ['.json'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true
  })
  
  const handleRemoveFile = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    dispatch(removeFile(id))
  }
  
  const getFileIcon = (fileType: string) => {
    if (fileType === 'application/pdf') return <FaFilePdf className="text-red-500" size={20} />
    if (fileType === 'application/json') return <FaFileCode className="text-yellow-500" size={20} />
    if (fileType.includes('spreadsheet') || fileType.includes('excel')) return <FaFileExcel className="text-green-500" size={20} />
    if (fileType === 'text/csv') return <FaFileCsv className="text-blue-500" size={20} />
    return <FaFile className="text-slate-500" size={20} />
  }
  
  const getStatusColor = (status: FileItem['status']) => {
    switch (status) {
      case 'pending': return 'text-slate-500'
      case 'uploading': return 'text-blue-500'
      case 'processing': return 'text-yellow-500'
      case 'success': return 'text-green-500'
      case 'error': return 'text-red-500'
      default: return 'text-slate-500'
    }
  }
  
  const getStatusText = (status: FileItem['status']) => {
    switch (status) {
      case 'pending': return 'Pending'
      case 'uploading': return 'Uploading'
      case 'processing': return 'Processing'
      case 'success': return 'Completed'
      case 'error': return 'Failed'
      default: return 'Unknown'
    }
  }
  
  // Check if any file was successfully uploaded
  const hasSuccessfulUpload = files.some(file => file.status === 'success')
  
  return (
    <div className="w-full">
      {hasSuccessfulUpload ? (
        <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-lg flex items-start">
          <FaCheckCircle className="text-green-500 mt-0.5 mr-3 flex-shrink-0" size={20} />
          <div>
            <h4 className="font-medium text-green-700 mb-1">Files Successfully Uploaded</h4>
            <p className="text-green-600 text-sm">
              Your files have been uploaded. Please provide company information in the next step.
            </p>
          </div>
        </div>
      ) : (
        <div 
          {...getRootProps()} 
          className={`border-2 border-dashed rounded-lg p-8 transition-colors ${
            isDragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-slate-300 hover:border-primary/50 hover:bg-slate-50'
          }`}
        >
          <input {...getInputProps()} id="fileInput" />
          <div className="flex flex-col items-center justify-center text-center">
            <FaCloudUploadAlt size={48} className="text-primary mb-4" />
            <h3 className="text-lg font-medium text-slate-700 mb-2">
              {isDragActive ? 'Drop files here' : 'Drag & drop financial files here'}
            </h3>
            <p className="text-slate-500 mb-4">
              or <span className="text-primary cursor-pointer">browse files</span>
            </p>
            <p className="text-sm text-slate-400">
              Supported formats: Excel (.xlsx, .xls), CSV, JSON, PDF
            </p>
            <p className="text-sm text-slate-400">
              Max file size: 10MB
            </p>
            
            <button className="btn btn-primary mt-5">
              Upload Financial Statements
            </button>
          </div>
        </div>
      )}
      
      {uploadError && (
        <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-start">
          <FaExclamationTriangle className="text-red-500 mt-0.5 mr-3 flex-shrink-0" size={16} />
          <p className="text-red-600 text-sm">{uploadError}</p>
        </div>
      )}
      
      {files.length > 0 && (
        <div className="mt-6">
          <h4 className="font-medium text-slate-700 mb-3">Files</h4>
          <div className="space-y-3">
            {files.map(file => (
              <div 
                key={file.id} 
                className={`flex items-center justify-between p-3 bg-white border rounded-lg ${
                  file.status === 'success' ? 'border-green-200 bg-green-50' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  {getFileIcon(file.type)}
                  <div>
                    <p className="font-medium text-slate-700">{file.name}</p>
                    <p className="text-xs text-slate-500">
                      {(file.size / 1024).toFixed(1)} KB • 
                      <span className={`ml-1 ${getStatusColor(file.status)}`}>
                        {getStatusText(file.status)}
                      </span>
                      {file.error && (
                        <span className="ml-1 text-red-500">- {file.error}</span>
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  {(file.status === 'uploading' || file.status === 'processing') && (
                    <div className="w-32 h-2 bg-slate-200 rounded-full mr-3 overflow-hidden">
                      <div 
                        className="h-full bg-primary"
                        style={{ width: `${file.progress}%` }}
                      ></div>
                    </div>
                  )}
                  
                  {file.status === 'success' && (
                    <FaCheckCircle className="text-green-500 mr-3" size={16} />
                  )}
                  
                  {file.status !== 'uploading' && file.status !== 'processing' && (
                    <button 
                      onClick={(e) => handleRemoveFile(file.id, e)}
                      className="p-1 text-slate-400 hover:text-red-500"
                    >
                      <FaTimes size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default FileUploader
