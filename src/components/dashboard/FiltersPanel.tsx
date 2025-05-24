import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FaSearch, FaFilter, FaFileExport } from 'react-icons/fa'
import { setFilters, resetFilters } from '../../store/dashboardSlice'
import { RootState } from '../../store'

const FiltersPanel = () => {
  const dispatch = useDispatch()
  const filters = useSelector((state: RootState) => state.dashboard.filters)
  const totalRecords = useSelector((state: RootState) => state.dashboard.totalRecords)
  const categoriesCount = useSelector((state: RootState) => state.dashboard.categoriesCount)
  
  const [localFilters, setLocalFilters] = useState({
    category: filters.category,
    search: filters.search,
    minValue: filters.minValue,
    maxValue: filters.maxValue,
  })
  
  const categories = [
    'All Categories',
    'Liquidity Ratios',
    'Profitability Ratios',
    'Solvency Ratios',
    'Efficiency Ratios',
    'Market Value Ratios',
  ]
  
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    
    if (name === 'minValue' || name === 'maxValue') {
      setLocalFilters({
        ...localFilters,
        [name]: value === '' ? null : Number(value),
      })
    } else {
      setLocalFilters({
        ...localFilters,
        [name]: value,
      })
    }
  }
  
  const handleApplyFilters = () => {
    dispatch(setFilters(localFilters))
  }
  
  const handleResetFilters = () => {
    const defaultFilters = {
      category: 'All Categories',
      search: '',
      minValue: null,
      maxValue: null,
    }
    
    setLocalFilters(defaultFilters)
    dispatch(resetFilters())
  }
  
  const handleExportCSV = () => {
    // Implement CSV export logic
    console.log('Exporting to CSV...')
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md p-5">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-1">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={localFilters.category}
            onChange={handleInputChange}
            className="w-full input"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-slate-700 mb-1">
            Search Metric
          </label>
          <div className="relative">
            <input
              id="search"
              name="search"
              type="text"
              value={localFilters.search}
              onChange={handleInputChange}
              placeholder="Search metrics..."
              className="w-full input pl-9"
            />
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </div>
        
        <div>
          <label htmlFor="minValue" className="block text-sm font-medium text-slate-700 mb-1">
            Min Value
          </label>
          <input
            id="minValue"
            name="minValue"
            type="number"
            value={localFilters.minValue === null ? '' : localFilters.minValue}
            onChange={handleInputChange}
            placeholder="Minimum"
            className="w-full input"
          />
        </div>
        
        <div>
          <label htmlFor="maxValue" className="block text-sm font-medium text-slate-700 mb-1">
            Max Value
          </label>
          <input
            id="maxValue"
            name="maxValue"
            type="number"
            value={localFilters.maxValue === null ? '' : localFilters.maxValue}
            onChange={handleInputChange}
            placeholder="Maximum"
            className="w-full input"
          />
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap gap-3">
          <button 
            className="btn btn-primary flex items-center gap-2"
            onClick={handleApplyFilters}
          >
            <FaFilter size={14} />
            <span>Apply Filters</span>
          </button>
          
          <button 
            className="btn btn-secondary flex items-center gap-2"
            onClick={handleResetFilters}
          >
            <span>Reset</span>
          </button>
          
          <button 
            className="btn btn-outlined flex items-center gap-2"
            onClick={handleExportCSV}
          >
            <FaFileExport size={14} />
            <span>Export to CSV</span>
          </button>
        </div>
        
        <div className="flex gap-4">
          <div className="text-center">
            <div className="text-xl font-bold text-primary">{totalRecords}</div>
            <div className="text-sm text-slate-500">Total Records</div>
          </div>
          
          <div className="text-center">
            <div className="text-xl font-bold text-primary">{categoriesCount}</div>
            <div className="text-sm text-slate-500">Categories</div>
          </div>
          
          <div className="text-center">
            <div className="text-xl font-bold text-primary">
              {filters.category !== 'All Categories' ? filters.category : 'All'}
            </div>
            <div className="text-sm text-slate-500">Current Filter</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FiltersPanel
