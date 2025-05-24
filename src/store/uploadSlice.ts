import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface FileItem {
  id: string;
  name: string;
  type: string;
  size: number;
  progress: number;
  status: 'pending' | 'uploading' | 'processing' | 'success' | 'error';
  error?: string;
  url?: string;
  data?: any; // Parsed data from the file
  fileKey?: string; // S3 key
}

export interface FinancialStatementData {
  companyId?: string;
  companyName?: string;
  reportDate?: string;
  industry?: string;
  creditScore?: number;
  creditDecision?: 'APPROVED' | 'PENDING' | 'DECLINED';
}

interface UploadState {
  files: FileItem[];
  isUploading: boolean;
  financialData: FinancialStatementData;
  formSubmitted: boolean;
}

const initialState: UploadState = {
  files: [],
  isUploading: false,
  financialData: {
    creditDecision: 'PENDING'
  },
  formSubmitted: false
}

const uploadSlice = createSlice({
  name: 'upload',
  initialState,
  reducers: {
    addFiles(state, action: PayloadAction<FileItem[]>) {
      state.files = [...state.files, ...action.payload]
    },
    removeFile(state, action: PayloadAction<string>) {
      state.files = state.files.filter(file => file.id !== action.payload)
    },
    updateFileProgress(state, action: PayloadAction<{ id: string; progress: number }>) {
      const { id, progress } = action.payload
      const fileIndex = state.files.findIndex(file => file.id === id)
      if (fileIndex !== -1) {
        state.files[fileIndex].progress = progress
      }
    },
    updateFileStatus(state, action: PayloadAction<{ id: string; status: FileItem['status']; error?: string; url?: string; fileKey?: string }>) {
      const { id, status, error, url, fileKey } = action.payload
      const fileIndex = state.files.findIndex(file => file.id === id)
      if (fileIndex !== -1) {
        state.files[fileIndex].status = status
        if (error) state.files[fileIndex].error = error
        if (url) state.files[fileIndex].url = url
        if (fileKey) state.files[fileIndex].fileKey = fileKey
      }
    },
    updateFileData(state, action: PayloadAction<{ id: string; data: any }>) {
      const { id, data } = action.payload
      const fileIndex = state.files.findIndex(file => file.id === id)
      if (fileIndex !== -1) {
        state.files[fileIndex].data = data
      }
    },
    setIsUploading(state, action: PayloadAction<boolean>) {
      state.isUploading = action.payload
    },
    updateFinancialData(state, action: PayloadAction<Partial<FinancialStatementData>>) {
      state.financialData = {
        ...state.financialData,
        ...action.payload
      }
    },
    setFormSubmitted(state, action: PayloadAction<boolean>) {
      state.formSubmitted = action.payload
    },
    resetUpload(state) {
      state.files = []
      state.isUploading = false
      state.financialData = {
        creditDecision: 'PENDING'
      }
      state.formSubmitted = false
    }
  },
})

export const { 
  addFiles, 
  removeFile, 
  updateFileProgress, 
  updateFileStatus,
  updateFileData,
  setIsUploading,
  updateFinancialData,
  setFormSubmitted,
  resetUpload,
} = uploadSlice.actions

export default uploadSlice.reducer
