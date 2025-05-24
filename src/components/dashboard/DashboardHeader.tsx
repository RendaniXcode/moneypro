import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FaSync, FaDownload, FaCalendarAlt } from 'react-icons/fa'
import { setYear } from '../../store/dashboardSlice'
import { RootState } from '../../store'

interface BreadcrumbProps {
  items: { label: string; path?: string }[];
}

const Breadcrumb = ({ items }: BreadcrumbProps) => {
  return (
    <div className="flex items-center text-sm text-slate-500">
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && <span className="mx-2">/</span>}
          <span className={index === items.length - 1 ? 'font-medium text-slate-700' : ''}>
            {item.label}
          </span>
        </div>
      ))}
    </div>
  )
}

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
}

const DashboardHeader = ({ title, subtitle }: DashboardHeaderProps) => {
  const dispatch = useDispatch()
  const currentYear = useSelector((state: RootState) => state.dashboard.year)
  const [yearSelectorOpen, setYearSelectorOpen] = useState(false)
  
  const years = [2023, 2024, 2025, 2026, 2027]
  
  const handleYearChange = (year: number) => {
    dispatch(setYear(year))
    setYearSelectorOpen(false)
  }
  
  const handleRefresh = () => {
    // Implement refresh logic
    console.log('Refreshing data...')
  }
  
  const handleExport = () => {
    // Implement export logic
    console.log('Exporting data...')
  }
  
  return (
    <div className="px-6 py-4 bg-white border-b">
      <Breadcrumb 
        items={[
          { label: 'Home', path: '/' },
          { label: title }
        ]} 
      />
      
      <div className="flex justify-between items-center mt-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
          {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
        </div>
        
        <div className="flex gap-3">
          <div className="relative">
            <button 
              className="btn btn-outlined flex items-center gap-2"
              onClick={() => setYearSelectorOpen(!yearSelectorOpen)}
            >
              <FaCalendarAlt size={14} />
              <span>{currentYear}</span>
            </button>
            
            {yearSelectorOpen && (
              <div className="absolute right-0 mt-1 w-36 bg-white shadow-lg rounded-md z-10 py-1">
                {years.map(year => (
                  <button
                    key={year}
                    className={`w-full px-4 py-2 text-left hover:bg-slate-100 ${
                      year === currentYear ? 'bg-primary/10 text-primary' : ''
                    }`}
                    onClick={() => handleYearChange(year)}
                  >
                    {year}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <button 
            className="btn btn-secondary flex items-center gap-2"
            onClick={handleRefresh}
          >
            <FaSync size={14} />
            <span>Refresh</span>
          </button>
          
          <button 
            className="btn btn-primary flex items-center gap-2"
            onClick={handleExport}
          >
            <FaDownload size={14} />
            <span>Export</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default DashboardHeader
