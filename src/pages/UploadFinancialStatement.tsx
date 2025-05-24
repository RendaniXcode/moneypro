import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import { graphqlService } from '../services/graphqlService';
import { v4 as uuidv4 } from 'uuid';

// Supported file types
const ACCEPTED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/vnd.ms-excel': ['.xls'],
  'text/csv': ['.csv'],
  'application/json': ['.json'],
};

// Company input for the form
interface CompanyInput {
  id: string;
  name: string;
  industry: string;
}

const UploadFinancialStatement = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // File state
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileError, setFileError] = useState<string | null>(null);

  // Company and report metadata
  const [company, setCompany] = useState<CompanyInput>({
    id: '',
    name: '',
    industry: '',
  });
  const [useExistingCompany, setUseExistingCompany] = useState(false);
  const [existingCompanies, setExistingCompanies] = useState<{ id: string; name: string }[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');

  // Report data
  const [reportDate, setReportDate] = useState(
    new Date().toISOString().split('T')[0] // Default to today
  );
  const [notes, setNotes] = useState('');

  // Load existing companies when toggling to existing company selection
  const loadExistingCompanies = useCallback(async () => {
    try {
      const companies = await graphqlService.getAvailableCompanies();
      setExistingCompanies(companies);
      if (companies.length > 0) {
        setSelectedCompanyId(companies[0].id);
      }
    } catch (error) {
      console.error('Error loading companies:', error);
      setExistingCompanies([
        { id: 'DEMO-001', name: 'Demo Company 1' },
        { id: 'DEMO-002', name: 'Demo Company 2' },
      ]);
    }
  }, []);

  // Handle toggling between new and existing company
  const handleToggleCompanyType = (useExisting: boolean) => {
    setUseExistingCompany(useExisting);
    if (useExisting) {
      loadExistingCompanies();
    }
  };

  // File dropzone configuration
  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Reset error state
    setFileError(null);

    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const { errors } = rejectedFiles[0];
      if (errors[0]?.code === 'file-too-large') {
        setFileError('File is too large. Maximum size is 10MB.');
      } else if (errors[0]?.code === 'file-invalid-type') {
        setFileError('Invalid file type. Please upload PDF, Excel, CSV, or JSON files.');
      } else {
        setFileError('Error uploading file. Please try again.');
      }
      return;
    }

    // Handle accepted files
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      setFile(selectedFile);

      // Create a preview for supported file types
      if (selectedFile.type.includes('image')) {
        const reader = new FileReader();
        reader.onload = () => {
          setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
      } else if (selectedFile.type === 'application/pdf') {
        setFilePreview('/icons/pdf-icon.svg');
      } else if (selectedFile.type.includes('excel') || selectedFile.type.includes('spreadsheet')) {
        setFilePreview('/icons/excel-icon.svg');
      } else if (selectedFile.type === 'text/csv') {
        setFilePreview('/icons/csv-icon.svg');
      } else if (selectedFile.type === 'application/json') {
        setFilePreview('/icons/json-icon.svg');
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxSize: 10485760, // 10MB
    maxFiles: 1,
  });

  // Go to next step if validation passes
  const handleNextStep = () => {
    if (currentStep === 1) {
      // Validate file selection
      if (!file) {
        setFileError('Please select a file to upload');
        return;
      }
      setFileError(null);
    } else if (currentStep === 2) {
      // Validate company information
      if (useExistingCompany) {
        if (!selectedCompanyId) {
          setSubmitError('Please select a company');
          return;
        }
      } else {
        if (!company.name || !company.industry) {
          setSubmitError('Please fill in all required company information');
          return;
        }
      }
      setSubmitError(null);
    }

    setCurrentStep(currentStep + 1);
  };

  // Go to previous step
  const handlePreviousStep = () => {
    setCurrentStep(currentStep - 1);
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      // Simulate file upload progress
      const uploadInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + 10;
          if (newProgress >= 100) {
            clearInterval(uploadInterval);
            return 100;
          }
          return newProgress;
        });
      }, 300);

      // Prepare data for submission
      const companyId = useExistingCompany ? selectedCompanyId : `NEW-${uuidv4().slice(0, 8)}`;
      const companyName = useExistingCompany
        ? existingCompanies.find((c) => c.id === selectedCompanyId)?.name || ''
        : company.name;

      // In a real app, you would:
      // 1. Upload the file to S3 or similar storage
      // 2. Create or update a financial report with metadata
      // 3. Trigger processing on the backend

      // Mock API call delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Sample financial data (simplified)
      const financialRatiosData = {
        liquidityRatios: {
          currentRatio: 1.85,
          quickRatio: 1.42
        },
        profitabilityRatios: {
          grossProfitMargin: 35.2,
          operatingProfitMargin: 18.4,
          returnOnAssets: 12.7
        },
        solvencyRatios: {
          debtToEquityRatio: 0.68,
          interestCoverageRatio: 8.5
        },
        efficiencyRatios: {
          assetTurnoverRatio: 0.74,
          inventoryTurnover: 5.2
        },
        marketValueRatios: {
          priceToEarnings: 14.8
        }
      };

      const performanceTrendsData = [
        { year: 1, revenue: 45, profit: 30, debt: 25 },
        { year: 2, revenue: 48, profit: 29, debt: 26 },
        { year: 3, revenue: 52, profit: 28, debt: 27 },
        { year: 4, revenue: 56, profit: 27, debt: 28 },
        { year: 5, revenue: 62, profit: 26, debt: 29 }
      ];

      // Create financial report in the system
      const reportData = {
        companyId: companyId,
        reportDate: reportDate,
        companyName: companyName,
        industry: useExistingCompany ? existingCompanies.find((c) => c.id === selectedCompanyId)?.industry || 'Technology' : company.industry,
        creditDecision: 'PENDING', // Initial state
        creditScore: 0, // Will be calculated
        reportStatus: 'PROCESSING',
        lastUpdated: new Date().toISOString(),
        financialRatios: JSON.stringify(financialRatiosData),
        performanceTrends: JSON.stringify(performanceTrendsData),
        recommendations: JSON.stringify([
          "Financial statement is being processed. Recommendations will be available soon."
        ])
      };

      // Call the API to create the report
      await graphqlService.createReport(reportData);

      clearInterval(uploadInterval);
      setUploadProgress(100);
      setSubmitSuccess(true);

      // Wait a moment before redirecting
      setTimeout(() => {
        navigate('/dashboard/analytics');
      }, 2000);
    } catch (error) {
      console.error('Error submitting financial statement:', error);
      setSubmitError('Failed to upload financial statement. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Render the appropriate step
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-800">Step 1: Upload Financial Statement</h3>
            
            <div className="border-2 border-dashed rounded-lg p-6 border-slate-300 bg-slate-50">
              <div
                {...getRootProps()}
                className={`flex flex-col items-center justify-center cursor-pointer py-6 ${
                  isDragActive ? 'bg-blue-50' : ''
                }`}
              >
                <input {...getInputProps()} />
                
                {file ? (
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-4">
                      {filePreview ? (
                        <img
                          src={filePreview}
                          alt="File Preview"
                          className="w-16 h-16 object-contain"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                          <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <p className="font-medium text-slate-700">{file.name}</p>
                    <p className="text-sm text-slate-500 mt-1">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                        setFilePreview(null);
                      }}
                      className="mt-3 text-sm text-red-500 hover:text-red-700 focus:outline-none"
                    >
                      Remove File
                    </button>
                  </div>
                ) : (
                  <>
                    <svg className="w-12 h-12 text-blue-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-lg font-medium text-slate-700">
                      {isDragActive ? 'Drop the file here' : 'Drag & drop your financial statement here'}
                    </p>
                    <p className="text-sm text-slate-500 mt-1">or click to browse files</p>
                    <p className="text-xs text-slate-400 mt-2">
                      Supported formats: PDF, Excel (.xlsx, .xls), CSV, JSON (Max: 10MB)
                    </p>
                  </>
                )}
              </div>
            </div>

            {fileError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md">
                <p className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {fileError}
                </p>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-800">Step 2: Company Information</h3>

            <div className="bg-slate-50 p-4 rounded-lg mb-6">
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={() => handleToggleCompanyType(false)}
                  className={`px-4 py-2 rounded-lg text-sm ${
                    !useExistingCompany
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  New Company
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleCompanyType(true)}
                  className={`px-4 py-2 rounded-lg text-sm ${
                    useExistingCompany
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  Existing Company
                </button>
              </div>
            </div>

            {useExistingCompany ? (
              <div className="space-y-4">
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-slate-700 mb-1">
                    Select Company
                  </label>
                  <select
                    id="company"
                    value={selectedCompanyId}
                    onChange={(e) => setSelectedCompanyId(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-md"
                  >
                    {existingCompanies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-slate-700 mb-1">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="companyName"
                    value={company.name}
                    onChange={(e) => setCompany({ ...company, name: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-md"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="industry" className="block text-sm font-medium text-slate-700 mb-1">
                    Industry <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="industry"
                    value={company.industry}
                    onChange={(e) => setCompany({ ...company, industry: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-md"
                    required
                  >
                    <option value="">Select Industry</option>
                    <option value="Technology">Technology</option>
                    <option value="Finance">Finance</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Retail">Retail</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Energy">Energy</option>
                    <option value="Media & Entertainment">Media & Entertainment</option>
                    <option value="Telecommunications">Telecommunications</option>
                    <option value="Consumer Goods">Consumer Goods</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="reportDate" className="block text-sm font-medium text-slate-700 mb-1">
                Report Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="reportDate"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-md"
                required
              />
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-md h-24 resize-none"
                placeholder="Add any additional information about this financial statement"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-800">Step 3: Review & Submit</h3>

            <div className="bg-slate-50 p-4 rounded-lg">
              <h4 className="font-medium text-slate-700 mb-3">Financial Statement</h4>
              <div className="flex items-center space-x-3 p-3 bg-white rounded border border-slate-200">
                {filePreview ? (
                  <img src={filePreview} alt="File Preview" className="w-10 h-10 object-contain" />
                ) : (
                  <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                )}
                <div>
                  <p className="font-medium text-slate-700">{file?.name}</p>
                  <p className="text-xs text-slate-500">
                    {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : ''}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg">
              <h4 className="font-medium text-slate-700 mb-3">Company Information</h4>
              <div className="space-y-2">
                <div className="flex">
                  <span className="text-slate-500 w-32">Company:</span>
                  <span className="font-medium text-slate-700">
                    {useExistingCompany
                      ? existingCompanies.find((c) => c.id === selectedCompanyId)?.name
                      : company.name}
                  </span>
                </div>
                <div className="flex">
                  <span className="text-slate-500 w-32">Industry:</span>
                  <span className="text-slate-700">
                    {useExistingCompany
                      ? existingCompanies.find((c) => c.id === selectedCompanyId)?.industry || 'Technology'
                      : company.industry}
                  </span>
                </div>
                <div className="flex">
                  <span className="text-slate-500 w-32">Report Date:</span>
                  <span className="text-slate-700">{reportDate}</span>
                </div>
                {notes && (
                  <div className="flex">
                    <span className="text-slate-500 w-32">Notes:</span>
                    <span className="text-slate-700">{notes}</span>
                  </div>
                )}
              </div>
            </div>

            {submitError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md">
                <p className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {submitError}
                </p>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6 text-center">
            {submitSuccess ? (
              <div className="py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">Upload Successful!</h3>
                <p className="text-slate-600 mb-6">
                  Your financial statement has been uploaded and is being processed.
                  You will be redirected to the analytics dashboard shortly.
                </p>
              </div>
            ) : (
              <div className="py-8">
                <h3 className="text-lg font-semibold text-slate-800 mb-6">Uploading Financial Statement</h3>
                <div className="w-full bg-slate-200 rounded-full h-2.5 mb-6 max-w-md mx-auto">
                  <div
                    className="bg-blue-500 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-slate-600">
                  {uploadProgress < 100
                    ? 'Please wait while we upload and process your financial statement...'
                    : 'Processing complete! Finalizing...'}
                </p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      <DashboardHeader title="Upload Financial Statement" subtitle="Upload and process financial statements for analysis" />

      <div className="px-6 py-6">
        <div className="card p-6">
          {/* Step indicators */}
          <div className="mb-8">
            <div className="flex items-center justify-between w-full max-w-3xl mx-auto">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                      step === currentStep
                        ? 'bg-blue-500 text-white'
                        : step < currentStep
                        ? 'bg-green-500 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {step < currentStep ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      step
                    )}
                  </div>
                  <span className={`text-xs mt-1 ${step === currentStep ? 'text-blue-500 font-medium' : 'text-slate-500'}`}>
                    {step === 1
                      ? 'Upload'
                      : step === 2
                      ? 'Details'
                      : step === 3
                      ? 'Review'
                      : 'Confirm'}
                  </span>
                </div>
              ))}
            </div>
            <div className="relative flex items-center justify-between w-full max-w-3xl mx-auto mt-2">
              <div className="absolute left-4 right-4 h-0.5 bg-slate-200"></div>
              {[1, 2, 3].map((step) => (
                <div
                  key={`line-${step}`}
                  className={`w-full h-0.5 ${step < currentStep ? 'bg-green-500' : 'bg-slate-200'}`}
                ></div>
              ))}
            </div>
          </div>

          {/* Step content */}
          <div className="max-w-3xl mx-auto">{renderStep()}</div>

          {/* Navigation buttons */}
          <div className="flex justify-between mt-8 max-w-3xl mx-auto">
            {currentStep > 1 && currentStep < 4 && (
              <button
                type="button"
                onClick={handlePreviousStep}
                className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Back
              </button>
            )}
            {currentStep < 3 && (
              <button
                type="button"
                onClick={handleNextStep}
                className="ml-auto px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Next
              </button>
            )}
            {currentStep === 3 && (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="ml-auto px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            )}
          </div>
        </div>

        {/* Information Panel */}
        <div className="card mt-6 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Upload Guidelines</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-slate-700 mb-2">Supported File Types</h4>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <span className="w-8 h-8 bg-red-100 rounded flex items-center justify-center mr-2">
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <span>PDF: Financial statements, annual reports</span>
                </li>
                <li className="flex items-center">
                  <span className="w-8 h-8 bg-green-100 rounded flex items-center justify-center mr-2">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <span>Excel (.xlsx, .xls): Financial data, ratio calculations</span>
                </li>
                <li className="flex items-center">
                  <span className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center mr-2">
                    <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <span>CSV: Tabular financial data</span>
                </li>
                <li className="flex items-center">
                  <span className="w-8 h-8 bg-yellow-100 rounded flex items-center justify-center mr-2">
                    <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <span>JSON: Structured financial data</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-slate-700 mb-2">Processing Steps</h4>
              <ol className="space-y-2">
                <li className="flex items-center">
                  <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2 text-sm font-medium text-blue-600">1</span>
                  <span>File validation and virus scanning</span>
                </li>
                <li className="flex items-center">
                  <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2 text-sm font-medium text-blue-600">2</span>
                  <span>Data extraction and processing</span>
                </li>
                <li className="flex items-center">
                  <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2 text-sm font-medium text-blue-600">3</span>
                  <span>Financial metrics calculation</span>
                </li>
                <li className="flex items-center">
                  <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2 text-sm font-medium text-blue-600">4</span>
                  <span>Credit score generation</span>
                </li>
                <li className="flex items-center">
                  <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2 text-sm font-medium text-blue-600">5</span>
                  <span>Recommendation generation</span>
                </li>
              </ol>
            </div>
          </div>
          
          <div className="mt-6 bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-blue-700">
                After uploading, your financial statement will be automatically processed. This can take 1-2 minutes depending on the file size and complexity. Once processed, you will be able to view the analysis in the Analytics dashboard.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadFinancialStatement;
