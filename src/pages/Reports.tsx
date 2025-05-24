import { useState } from 'react'
import DashboardHeader from '../components/dashboard/DashboardHeader'
import FileUploader from '../components/upload/FileUploader'
import UploadFinancialStatement from '../components/upload/UploadFinancialStatement'
import { useSelector } from 'react-redux'
import { RootState } from '../store'

const Reports = () => {
  const [activeTab, setActiveTab] = useState<'upload' | 'form'>('upload')
  const { files } = useSelector((state: RootState) => state.upload)
  
  // Check if any file has been successfully uploaded
  const hasUploadedFile = files.some(file => file.status === 'success')
  
  return (
    <div className="flex-1 overflow-auto">
      <DashboardHeader 
        title="Financial Statements" 
        subtitle="Upload and process company financial data" 
      />
      
      <div className="px-6 py-6 space-y-6">
        <div className="card">
          <div className="border-b border-slate-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('upload')}
                className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'upload'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                1. Upload Files
              </button>
              <button
                onClick={() => setActiveTab('form')}
                disabled={!hasUploadedFile}
                className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors ${
                  !hasUploadedFile
                    ? 'border-transparent text-slate-300 cursor-not-allowed'
                    : activeTab === 'form'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                2. Add Company Information
              </button>
            </nav>
          </div>
          
          <div className="p-6">
            {activeTab === 'upload' ? (
              <>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Upload Financial Statements</h3>
                <p className="text-slate-500 mb-6">
                  Upload your company financial statements for analysis. After uploading, you'll need to provide 
                  additional company information.
                </p>
                <FileUploader onUploadSuccess={() => setActiveTab('form')} />
              </>
            ) : (
              <UploadFinancialStatement />
            )}
          </div>
        </div>
        
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">About Financial Statement Processing</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-slate-700 mb-2">Supported File Types</h4>
              <ul className="list-disc list-inside text-slate-500 space-y-1">
                <li><span className="font-medium">Excel (.xlsx, .xls):</span> Balance sheets, income statements, cash flow statements</li>
                <li><span className="font-medium">CSV:</span> Structured financial data in tabular format</li>
                <li><span className="font-medium">JSON:</span> Pre-formatted financial data</li>
                <li><span className="font-medium">PDF:</span> Annual reports and financial statements (text extraction)</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-slate-700 mb-2">What Happens After Upload</h4>
              <ol className="list-decimal list-inside text-slate-500 space-y-1">
                <li>Your files are securely stored and processed</li>
                <li>Our system extracts key financial metrics</li>
                <li>Financial ratios are calculated automatically</li>
                <li>Credit scores are generated based on financial health</li>
                <li>Recommendations are provided for improving financial performance</li>
              </ol>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h4 className="font-medium text-blue-700 mb-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Data Privacy & Security
              </h4>
              <p className="text-blue-600 text-sm">
                All uploaded financial data is encrypted and securely stored. We do not share your 
                financial information with third parties without your explicit consent.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Reports
