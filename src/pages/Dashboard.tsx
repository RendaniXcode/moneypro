import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import DashboardHeader from '../components/dashboard/DashboardHeader'
import FiltersPanel from '../components/dashboard/FiltersPanel'
import FinancialRatiosTable from '../components/dashboard/FinancialRatiosTable'
import { setTotalRecords, setCategoriesCount } from '../store/dashboardSlice'

const Dashboard = () => {
  const dispatch = useDispatch()
  
  // Set initial data counts - in a real app, this would come from an API
  useEffect(() => {
    dispatch(setTotalRecords(10))
    dispatch(setCategoriesCount(5))
  }, [dispatch])
  
  return (
    <div className="flex-1 overflow-auto">
      <DashboardHeader 
        title="Financial Dashboard" 
        subtitle="MultiChoice Financial Dashboard - 2024 Financial Ratios Analysis"
      />
      
      <div className="px-6 py-6 space-y-6">
        <FiltersPanel />
        <FinancialRatiosTable />
      </div>
    </div>
  )
}

export default Dashboard
