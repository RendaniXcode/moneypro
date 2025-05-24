import { NormalizedFinancialReport } from '../../types/financialReport';

interface FinancialSummaryCardProps {
  report: NormalizedFinancialReport;
}

const FinancialSummaryCard = ({ report }: FinancialSummaryCardProps) => {
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PUBLISHED': return 'bg-green-100 text-green-800';
      case 'DRAFT': return 'bg-yellow-100 text-yellow-800';
      case 'PENDING': return 'bg-blue-100 text-blue-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };
  
  // Get decision badge color
  const getDecisionColor = (decision: string) => {
    switch (decision.toUpperCase()) {
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'DECLINED': return 'bg-red-100 text-red-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };
  
  return (
    <div className="card">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800">{report.companyName}</h3>
          <p className="text-sm text-slate-500">{report.industry}</p>
        </div>
        <div className="flex gap-2">
          <span className={`badge ${getStatusColor(report.reportStatus)}`}>
            {report.reportStatus}
          </span>
          <span className={`badge ${getDecisionColor(report.creditDecision)}`}>
            {report.creditDecision}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="p-3 bg-slate-50 rounded-lg">
          <div className="text-sm text-slate-500">Report Date</div>
          <div className="font-medium">{formatDate(report.reportDate)}</div>
        </div>
        <div className="p-3 bg-slate-50 rounded-lg">
          <div className="text-sm text-slate-500">Last Updated</div>
          <div className="font-medium">{formatDate(report.lastUpdated)}</div>
        </div>
        <div className="p-3 bg-slate-50 rounded-lg">
          <div className="text-sm text-slate-500">Company ID</div>
          <div className="font-medium">{report.companyId}</div>
        </div>
      </div>
      
      <div>
        <h4 className="text-sm font-medium text-slate-500 uppercase mb-2">Key Ratios</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {report.ratios.slice(0, 4).map((ratio, index) => (
            <div key={index} className="p-3 border border-slate-200 rounded-lg">
              <div className="text-xs text-slate-500">{ratio.name}</div>
              <div className="text-lg font-semibold">{ratio.value.toFixed(2)}</div>
              <div className="text-xs text-slate-400">{ratio.category}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FinancialSummaryCard;
