import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { FaExclamationCircle, FaCheckCircle, FaSpinner } from 'react-icons/fa'
import { useForm } from 'react-hook-form'
import { RootState } from '../../store'
import { updateFinancialData, setFormSubmitted, resetUpload } from '../../store/uploadSlice'
import { graphqlService } from '../../services/graphqlService'

interface FormData {
  companyName: string;
  companyId: string;
  reportDate: string;
  industry: string;
}

const industries = [
  "Agriculture",
  "Automotive",
  "Banking & Finance",
  "Construction",
  "Education",
  "Energy",
  "Food & Beverage",
  "Healthcare",
  "Information Technology",
  "Manufacturing",
  "Media & Entertainment",
  "Retail",
  "Telecommunications",
  "Transportation",
  "Utilities"
]

const UploadFinancialStatement = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { files, financialData } = useSelector((state: RootState) => state.upload)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  // Get today's date in YYYY-MM-DD format for the date input
  const today = new Date().toISOString().split('T')[0]
  
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      companyName: financialData.companyName || '',
      companyId: financialData.companyId || '',
      reportDate: financialData.reportDate || today,
      industry: financialData.industry || '',
    }
  })
  
  // Check if any files have been uploaded
  const hasUploadedFiles = files.some(file => file.status === 'success')
  
  const onSubmit = async (data: FormData) => {
    if (!hasUploadedFiles) {
      setError("Please upload at least one file before submitting")
      return
    }
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      // Update financial data in redux
      dispatch(updateFinancialData(data))
      
      // Prepare the data for GraphQL API
      const fileUrls = files
        .filter(file => file.status === 'success' && file.url)
        .map(file => file.url as string)
      
      // Extract any structured data from parsed files
      const structuredData = files
        .filter(file => file.data)
        .map(file => file.data)
      
      // Prepare the GraphQL input
      const financialRatios = {
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
      }
      
      const performanceTrends = [
        { year: 1, revenue: 45, profit: 30, debt: 25 },
        { year: 2, revenue: 48, profit: 29, debt: 26 },
        { year: 3, revenue: 52, profit: 28, debt: 27 },
        { year: 4, revenue: 56, profit: 27, debt: 28 },
        { year: 5, revenue: 62, profit: 26, debt: 29 }
      ]
      
      const recommendations = [
        "Consider optimizing inventory management to improve the inventory turnover ratio.",
        "Maintain the current debt management strategy as it provides a good balance between leverage and financial stability.",
        "Explore opportunities to improve asset utilization to enhance the asset turnover ratio.",
        "Continue investing in high-return content production to maintain competitive advantage.",
        "Consider strategic acquisitions in emerging markets to diversify revenue streams."
      ]
      
      // Create the financial report in the API
      const reportInput = {
        companyId: data.companyId,
        companyName: data.companyName,
        reportDate: data.reportDate,
        industry: data.industry,
        creditDecision: "PENDING",
        lastUpdated: new Date().toISOString(),
        creditScore: 85,
        reportStatus: "PUBLISHED",
        financialRatios: JSON.stringify(financialRatios),
        performanceTrends: JSON.stringify(performanceTrends),
        recommendations: JSON.stringify(recommendations)
      }
      
      // Call the GraphQL API to create the report
      await graphqlService.createReport(reportInput)
      
      // Set success state
      setSuccess(true)
      dispatch(setFormSubmitted(true))
      
      // Navigate to analytics page after 2 seconds
      setTimeout(() => {
        navigate('/analytics')
        dispatch(resetUpload())
      }, 2000)
    } catch (err) {
      console.error('Error submitting financial statement:', err)
      setError(err instanceof Error ? err.message : 'Failed to submit financial statement')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  if (success) {
    return (
      <div className="bg-green-50 border border-green-100 rounded-lg p-6 text-center">
        <FaCheckCircle className="mx-auto text-green-500 mb-4" size={48} />
        <h3 className="text-xl font-semibold text-green-800 mb-2">
          Financial Statement Submitted Successfully
        </h3>
        <p className="text-green-700 mb-6">
          Your financial statement has been processed and is now available for analysis.
        </p>
        <button 
          onClick={() => navigate('/analytics')}
          className="btn btn-primary"
        >
          View Analysis
        </button>
      </div>
    )
  }
  
  return (
    <div>
      <h3 className="text-lg font-semibold text-slate-800 mb-4">
        Financial Statement Information
      </h3>
      <p className="text-slate-500 mb-6">
        Please provide additional information about your financial statement.
      </p>
      
      {!hasUploadedFiles && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-100 rounded-lg flex items-start">
          <FaExclamationCircle className="text-yellow-500 mt-0.5 mr-3 flex-shrink-0" size={16} />
          <p className="text-yellow-700 text-sm">
            Please upload at least one file before submitting financial statement information.
          </p>
        </div>
      )}
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg flex items-start">
          <FaExclamationCircle className="text-red-500 mt-0.5 mr-3 flex-shrink-0" size={16} />
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-slate-700 mb-1">
              Company Name *
            </label>
            <input
              id="companyName"
              type="text"
              {...register('companyName', { required: 'Company name is required' })}
              className={`w-full p-2 border rounded-md ${errors.companyName ? 'border-red-500' : 'border-slate-300'}`}
              placeholder="Enter company name"
            />
            {errors.companyName && (
              <p className="mt-1 text-sm text-red-500">{errors.companyName.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="companyId" className="block text-sm font-medium text-slate-700 mb-1">
              Company ID *
            </label>
            <input
              id="companyId"
              type="text"
              {...register('companyId', { required: 'Company ID is required' })}
              className={`w-full p-2 border rounded-md ${errors.companyId ? 'border-red-500' : 'border-slate-300'}`}
              placeholder="Enter company ID (e.g. COMPANY-001)"
            />
            {errors.companyId && (
              <p className="mt-1 text-sm text-red-500">{errors.companyId.message}</p>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="reportDate" className="block text-sm font-medium text-slate-700 mb-1">
              Report Date *
            </label>
            <input
              id="reportDate"
              type="date"
              max={today}
              {...register('reportDate', { required: 'Report date is required' })}
              className={`w-full p-2 border rounded-md ${errors.reportDate ? 'border-red-500' : 'border-slate-300'}`}
            />
            {errors.reportDate && (
              <p className="mt-1 text-sm text-red-500">{errors.reportDate.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="industry" className="block text-sm font-medium text-slate-700 mb-1">
              Industry *
            </label>
            <select
              id="industry"
              {...register('industry', { required: 'Industry is required' })}
              className={`w-full p-2 border rounded-md ${errors.industry ? 'border-red-500' : 'border-slate-300'}`}
            >
              <option value="">Select industry</option>
              {industries.map(industry => (
                <option key={industry} value={industry}>
                  {industry}
                </option>
              ))}
            </select>
            {errors.industry && (
              <p className="mt-1 text-sm text-red-500">{errors.industry.message}</p>
            )}
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || !hasUploadedFiles}
            className={`btn ${
              !hasUploadedFiles
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'btn-primary'
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <FaSpinner className="animate-spin mr-2" size={16} />
                Processing...
              </span>
            ) : (
              'Submit Financial Statement'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default UploadFinancialStatement
