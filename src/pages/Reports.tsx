import { useState } from 'react'
import DashboardHeader from '../components/dashboard/DashboardHeader'
import FileUploader from '../components/upload/FileUploader'
import UploadFinancialStatement from '../components/upload/UploadFinancialStatement'
import { useSelector } from 'react-redux'
import { RootState } from '../store'

const Run_Analysis = () => {
  const [activeTab, setActiveTab] = useState<'upload'>('upload')
  const { files } = useSelector((state: RootState) => state.upload)

  return (
      <div className="flex-1 overflow-auto">
        <DashboardHeader
            title="Upload Financial Statement"
            subtitle="Upload and process company financial data"
        />

        <div className="px-6 py-6 space-y-6">
          <div className="card">
            <div className="border-b border-slate-200">
              <nav className="flex -mb-px">
                <button
                    onClick={() => setActiveTab('upload')}
                    className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors border-primary text-primary`}
                >
                  Upload Files
                </button>
              </nav>
            </div>

            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Upload Financial Statements</h3>
              <p className="text-slate-500 mb-6">
                Upload your company financial statements for analysis.
              </p>
              <FileUploader onUploadSuccess={() => {}} />
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-base font-semibold text-slate-800 mb-3">About Financial Statement Processing</h3>

            <div className="flex flex-row space-x-4">
              <div className="w-1/2">
                <h4 className="text-sm font-medium text-slate-700 mb-1">Supported File Types</h4>
                <ul className="list-disc list-inside text-xs text-slate-500 space-y-0.5">
                  <li><span className="font-medium">Excel (.xlsx, .xls):</span> Balance sheets, income statements, cash flow statements</li>
                  <li><span className="font-medium">CSV:</span> Structured financial data in tabular format</li>
                  <li><span className="font-medium">JSON:</span> Pre-formatted financial data</li>
                  <li><span className="font-medium">PDF:</span> Annual reports and financial statements (text extraction)</li>
                </ul>
              </div>

              <div className="w-1/2">
                <h4 className="text-sm font-medium text-slate-700 mb-1">What Happens After Upload</h4>
                <ol className="list-decimal list-inside text-xs text-slate-500 space-y-0.5">
                  <li>Your files are securely stored and processed</li>
                  <li>Our system extracts key financial metrics</li>
                  <li>Financial ratios are calculated automatically</li>
                  <li>Credit scores are generated based on financial health</li>
                  <li>Recommendations are provided for improving financial performance</li>
                </ol>
              </div>
            </div>

            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 mt-3">
              <h4 className="text-sm font-medium text-blue-700 mb-1 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Data Privacy & Security
              </h4>
              <p className="text-xs text-blue-600">
                All uploaded financial data is encrypted and securely stored. We do not share your
                financial information with third parties without your explicit consent.
              </p>
            </div>
          </div>
        </div>
      </div>
  )
}

export default Run_Analysis