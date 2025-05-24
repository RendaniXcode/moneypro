import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { FaSort, FaSortUp, FaSortDown, FaSearch } from 'react-icons/fa'
import { RootState } from '../../store'

// Category badge colors
const categoryColors: Record<string, string> = {
  'Liquidity Ratios': 'bg-blue-100 text-blue-800',
  'Profitability Ratios': 'bg-green-100 text-green-800',
  'Solvency Ratios': 'bg-purple-100 text-purple-800',
  'Efficiency Ratios': 'bg-orange-100 text-orange-800',
  'Market Value Ratios': 'bg-rose-100 text-rose-800',
}

// Mock financial ratio data
interface FinancialRatio {
  id: string;
  category: string;
  metric: string;
  value: number;
  explanation: string;
}

const mockRatios: FinancialRatio[] = [
  {
    id: '1',
    category: 'Liquidity Ratios',
    metric: 'Current Ratio',
    value: 2.5,
    explanation: 'Current Assets / Current Liabilities. Indicates ability to pay short-term obligations.',
  },
  {
    id: '2',
    category: 'Liquidity Ratios',
    metric: 'Quick Ratio',
    value: 1.8,
    explanation: '(Current Assets - Inventory) / Current Liabilities. More stringent measure of liquidity.',
  },
  {
    id: '3',
    category: 'Profitability Ratios',
    metric: 'Return on Assets (ROA)',
    value: 8.2,
    explanation: 'Net Income / Total Assets. Measures how efficiently assets are being used to generate profits.',
  },
  {
    id: '4',
    category: 'Profitability Ratios',
    metric: 'Return on Equity (ROE)',
    value: 15.7,
    explanation: 'Net Income / Shareholders Equity. Measures how effectively management is using equity financing.',
  },
  {
    id: '5',
    category: 'Solvency Ratios',
    metric: 'Debt to Equity',
    value: 0.8,
    explanation: 'Total Debt / Total Equity. Indicates proportion of equity and debt used to finance assets.',
  },
  {
    id: '6',
    category: 'Solvency Ratios',
    metric: 'Interest Coverage Ratio',
    value: 5.3,
    explanation: 'EBIT / Interest Expense. Ability to pay interest expenses on outstanding debt.',
  },
  {
    id: '7',
    category: 'Efficiency Ratios',
    metric: 'Asset Turnover',
    value: 1.2,
    explanation: 'Net Sales / Average Total Assets. Measures efficiency of asset use in generating sales.',
  },
  {
    id: '8',
    category: 'Efficiency Ratios',
    metric: 'Inventory Turnover',
    value: 6.5,
    explanation: 'Cost of Goods Sold / Average Inventory. How many times inventory is sold and replaced.',
  },
  {
    id: '9',
    category: 'Market Value Ratios',
    metric: 'Price to Earnings (P/E)',
    value: 18.2,
    explanation: 'Market Price per Share / Earnings per Share. Indicates market expectation of future growth.',
  },
  {
    id: '10',
    category: 'Market Value Ratios',
    metric: 'Dividend Yield',
    value: 2.7,
    explanation: 'Annual Dividend per Share / Price per Share. Shows return on investment for a share.',
  },
]

const FinancialRatiosTable = () => {
  const filters = useSelector((state: RootState) => state.dashboard.filters)
  const [ratios, setRatios] = useState<FinancialRatio[]>([])
  const [sortField, setSortField] = useState<keyof FinancialRatio>('category')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null)
  const [tableSearch, setTableSearch] = useState('')
  
  // Apply global filters
  useEffect(() => {
    let filteredData = [...mockRatios]
    
    // Filter by category
    if (filters.category !== 'All Categories') {
      filteredData = filteredData.filter(ratio => ratio.category === filters.category)
    }
    
    // Filter by search term
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filteredData = filteredData.filter(ratio => 
        ratio.metric.toLowerCase().includes(searchTerm) || 
        ratio.category.toLowerCase().includes(searchTerm) ||
        ratio.explanation.toLowerCase().includes(searchTerm)
      )
    }
    
    // Filter by min value
    if (filters.minValue !== null) {
      filteredData = filteredData.filter(ratio => ratio.value >= filters.minValue!)
    }
    
    // Filter by max value
    if (filters.maxValue !== null) {
      filteredData = filteredData.filter(ratio => ratio.value <= filters.maxValue!)
    }
    
    setRatios(filteredData)
  }, [filters])
  
  // Apply table-specific search
  const searchedRatios = tableSearch
    ? ratios.filter(ratio => 
        ratio.metric.toLowerCase().includes(tableSearch.toLowerCase()) ||
        ratio.category.toLowerCase().includes(tableSearch.toLowerCase())
      )
    : ratios
  
  // Sort data
  const sortedRatios = [...searchedRatios].sort((a, b) => {
    const fieldA = a[sortField]
    const fieldB = b[sortField]
    
    if (typeof fieldA === 'string' && typeof fieldB === 'string') {
      return sortDirection === 'asc' 
        ? fieldA.localeCompare(fieldB)
        : fieldB.localeCompare(fieldA)
    } else {
      return sortDirection === 'asc' 
        ? Number(fieldA) - Number(fieldB)
        : Number(fieldB) - Number(fieldA)
    }
  })
  
  const handleSort = (field: keyof FinancialRatio) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }
  
  const getSortIcon = (field: keyof FinancialRatio) => {
    if (sortField !== field) return <FaSort className="text-slate-400" />
    return sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />
  }
  
  const toggleRowExpand = (id: string) => {
    if (expandedRowId === id) {
      setExpandedRowId(null)
    } else {
      setExpandedRowId(id)
    }
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-5 py-4 border-b flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-800">Financial Ratios</h3>
        
        <div className="relative w-64">
          <input
            type="text"
            value={tableSearch}
            onChange={(e) => setTableSearch(e.target.value)}
            placeholder="Search table..."
            className="w-full input pl-9 py-1.5"
          />
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('category')}
              >
                <div className="flex items-center gap-2">
                  <span>Category</span>
                  {getSortIcon('category')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('metric')}
              >
                <div className="flex items-center gap-2">
                  <span>Metric</span>
                  {getSortIcon('metric')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('value')}
              >
                <div className="flex items-center gap-2">
                  <span>Value</span>
                  {getSortIcon('value')}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                <span>Explanation</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {sortedRatios.length > 0 ? (
              sortedRatios.map(ratio => (
                <tr 
                  key={ratio.id} 
                  className={`hover:bg-slate-50 cursor-pointer ${
                    expandedRowId === ratio.id ? 'bg-slate-50' : ''
                  }`}
                  onClick={() => toggleRowExpand(ratio.id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`badge ${categoryColors[ratio.category]}`}>
                      {ratio.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{ratio.metric}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-slate-900 font-medium">{ratio.value.toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`text-slate-500 ${
                      expandedRowId === ratio.id ? '' : 'line-clamp-1'
                    }`}>
                      {ratio.explanation}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-slate-500">
                  No financial ratios found matching the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default FinancialRatiosTable
