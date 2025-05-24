import * as XLSX from 'xlsx'
import Papa from 'papaparse'
import { FileItem } from '../store/uploadSlice'

// Try to import uuid, but provide a fallback if the import fails
let uuidv4: () => string;
try {
  // Dynamic import for uuid
  const uuid = await import('uuid');
  uuidv4 = uuid.v4;
} catch (error) {
  // Fallback implementation if uuid package is not available
  uuidv4 = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };
}

// Allowed file types
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/json',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
  'application/vnd.ms-excel', // xls
  'text/csv',
]

// Max file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024

export const validateFile = (file: File): { valid: boolean; error?: string } => {
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return { 
      valid: false, 
      error: 'Invalid file type. Please upload PDF, JSON, Excel, or CSV files.' 
    }
  }
  
  if (file.size > MAX_FILE_SIZE) {
    return { 
      valid: false, 
      error: 'File is too large. Maximum file size is 10MB.' 
    }
  }
  
  return { valid: true }
}

export const createFileItem = (file: File): FileItem => {
  return {
    id: uuidv4(),
    name: file.name,
    type: file.type,
    size: file.size,
    progress: 0,
    status: 'pending',
  }
}

// Parse Excel files
export const parseExcelFile = (file: File): Promise<any> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        if (!e.target?.result) {
          throw new Error('Failed to read file')
        }
        
        const data = new Uint8Array(e.target.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        
        // Get first sheet
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet)
        resolve(jsonData)
      } catch (error) {
        reject(error)
      }
    }
    
    reader.onerror = () => {
      reject(new Error('Failed to read Excel file'))
    }
    
    reader.readAsArrayBuffer(file)
  })
}

// Parse CSV files
export const parseCsvFile = (file: File): Promise<any> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        resolve(results.data)
      },
      error: (error) => {
        reject(error)
      }
    })
  })
}

// Parse JSON files
export const parseJsonFile = (file: File): Promise<any> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        if (!e.target?.result) {
          throw new Error('Failed to read file')
        }
        
        const jsonData = JSON.parse(e.target.result as string)
        resolve(jsonData)
      } catch (error) {
        reject(error)
      }
    }
    
    reader.onerror = () => {
      reject(new Error('Failed to read JSON file'))
    }
    
    reader.readAsText(file)
  })
}

// Determine parser based on file type
export const parseFile = async (file: File): Promise<any> => {
  const fileType = file.type
  
  if (fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
      fileType === 'application/vnd.ms-excel') {
    return parseExcelFile(file)
  } else if (fileType === 'text/csv') {
    return parseCsvFile(file)
  } else if (fileType === 'application/json') {
    return parseJsonFile(file)
  } else if (fileType === 'application/pdf') {
    throw new Error('PDF parsing is not implemented in the frontend. Upload to process on server.')
  } else {
    throw new Error('Unsupported file type')
  }
}
