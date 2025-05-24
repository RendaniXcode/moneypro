import { Link } from 'react-router-dom'
import { FaChartBar, FaCloudUploadAlt, FaChartLine, FaFileAlt } from 'react-icons/fa'
import DashboardHeader from '../components/dashboard/DashboardHeader'

const FeatureCard = ({ 
  title, 
  description, 
  icon, 
  to 
}: { 
  title: string; 
  description: string; 
  icon: React.ReactNode; 
  to: string 
}) => {
  return (
    <Link to={to} className="group">
      <div className="card h-full transition-all hover:shadow-lg group-hover:border-primary/50">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            {icon}
          </div>
        </div>
        <h3 className="text-lg font-semibold text-slate-800 mb-2 group-hover:text-primary">
          {title}
        </h3>
        <p className="text-slate-500">
          {description}
        </p>
      </div>
    </Link>
  )
}

const Home = () => {
  return (
    <div className="flex-1 overflow-auto">
      <DashboardHeader title="MoneyMind Pro" subtitle="Financial Reports Dashboard" />
      
      <div className="px-6 py-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Welcome to MoneyMind Pro</h2>
          <p className="text-slate-500">
            Your comprehensive financial reports dashboard application. Upload, analyze, and visualize 
            financial data to gain valuable insights.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard
            title="Financial Dashboard"
            description="View and analyze key financial ratios and metrics."
            icon={<FaChartBar size={20} />}
            to="/dashboard"
          />
          
          <FeatureCard
            title="Upload Reports"
            description="Upload financial data files for processing."
            icon={<FaCloudUploadAlt size={20} />}
            to="/reports"
          />
          
          <FeatureCard
            title="Analytics"
            description="Visualize financial data with interactive charts."
            icon={<FaChartLine size={20} />}
            to="/analytics"
          />
          
          <FeatureCard
            title="Credit Reports"
            description="View and analyze credit-related financial data."
            icon={<FaFileAlt size={20} />}
            to="/credit-reports"
          />
        </div>
        
        <div className="mt-10 card">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Getting Started</h3>
          <ol className="list-decimal list-inside space-y-2 text-slate-600">
            <li>
              <span className="font-medium text-primary">Upload Reports:</span> Start by uploading 
              your financial data files in the Reports section.
            </li>
            <li>
              <span className="font-medium text-primary">View Dashboard:</span> Once processed, 
              view your financial metrics in the Dashboard section.
            </li>
            <li>
              <span className="font-medium text-primary">Analyze Data:</span> Use the Analytics 
              section for in-depth analysis with charts and visualizations.
            </li>
            <li>
              <span className="font-medium text-primary">Export Results:</span> Export your results 
              to CSV for further analysis or reporting.
            </li>
          </ol>
        </div>
      </div>
    </div>
  )
}

export default Home
