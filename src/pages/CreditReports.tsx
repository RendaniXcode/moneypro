import DashboardHeader from '../components/dashboard/DashboardHeader'

const CreditReports = () => {
  return (
    <div className="flex-1 overflow-auto">
      <DashboardHeader title="Credit Reports" subtitle="View and analyze credit-related financial data" />
      
      <div className="px-6 py-6">
        <div className="card mb-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Credit Reports</h3>
          <p className="text-slate-500">
            This section will display credit-related financial data and reports.
            Feature under development.
          </p>
        </div>
        
        <div className="card p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
          </div>
          <h3 className="text-xl font-semibold text-slate-800 mb-2">Coming Soon</h3>
          <p className="text-slate-500 max-w-md mx-auto">
            We're working on bringing you detailed credit reports and analytics.
            This feature will be available in the next update.
          </p>
        </div>
      </div>
    </div>
  )
}

export default CreditReports
