/**
 * Analytics Page Component - Updated to handle API errors without falling back to mock data
 * This component now shows proper error states when the backend is unavailable
 * Users will see clear error messages instead of fake data
 */

import { useState, useEffect } from 'react';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import RatiosRadarChart from '../components/analytics/RatiosRadarChart';
import PerformanceTrendsChart from '../components/analytics/PerformanceTrendsChart';
import RatiosByCategory from '../components/analytics/RatiosByCategory';
import CreditScoreGauge from '../components/analytics/CreditScoreGauge';
import FinancialSummaryCard from '../components/analytics/FinancialSummaryCard';
import RecommendationsList from '../components/analytics/RecommendationsList';
import CompanySelector from '../components/analytics/CompanySelector';
import { graphqlService } from '../services/graphqlService';
import { normalizeFinancialReport, NormalizedFinancialReport } from '../types/financialReport';
import { Company } from '../graphql/types';

const Analytics = () => {
  const [report, setReport] = useState<NormalizedFinancialReport | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);

  // Fetch available companies
  useEffect(() => {
    const fetchCompanies = async () => {
      setIsLoadingCompanies(true);
      setError(null);

      try {
        const availableCompanies = await graphqlService.getAvailableCompanies();
        console.log('Available companies:', availableCompanies);

        if (availableCompanies && availableCompanies.length > 0) {
          setCompanies(availableCompanies);

          // Select the first company by default
          setSelectedCompany(availableCompanies[0]);
        } else {
          setError('No companies found in the system.');
        }
      } catch (err) {
        console.error('Error fetching companies:', err);
        setError(`Failed to load companies: ${err.message || 'Please check your connection and try again.'}`);
        // Don't set any companies - leave the list empty
        setCompanies([]);
      } finally {
        setIsLoadingCompanies(false);
      }
    };

    fetchCompanies();
  }, []);

  // Fetch report data when selected company changes
  useEffect(() => {
    if (!selectedCompany) {
      setIsLoading(false);
      return;
    }

    const fetchReport = async () => {
      setIsLoading(true);
      setError(null);

      try {
        console.log(`Fetching report for ${selectedCompany.name} (ID: ${selectedCompany.id}, Date: ${selectedCompany.reportDate})`);

        // Fetch financial report from GraphQL API
        const reportData = await graphqlService.getFinancialReport(
            selectedCompany.id,
            selectedCompany.reportDate
        );

        // Process and normalize the data for UI components
        const normalizedReport = normalizeFinancialReport(reportData);
        console.log('Normalized report data:', normalizedReport);

        setReport(normalizedReport);

        // Set first category as selected by default
        if (normalizedReport.ratios.length > 0) {
          const categories = [...new Set(normalizedReport.ratios.map(r => r.category))];
          setSelectedCategory(categories[0]);
        }
      } catch (err: any) {
        console.error('Error fetching financial report:', err);
        setError(`Failed to load financial report: ${err.message || 'Please check your connection and try again.'}`);
        // Clear the report data so no stale data is shown
        setReport(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [selectedCompany]);

  // Handle company selection
  const handleCompanySelect = (company: Company) => {
    setSelectedCompany(company);
  };

  // Get unique categories from report
  const categories = report ? [...new Set(report.ratios.map(r => r.category))] : [];

  return (
      <div className="flex-1 overflow-auto">
        <DashboardHeader title="Analytics" subtitle="Interactive visualizations for financial data analysis" />

        <div className="px-6 py-6 space-y-6">
          {/* Company Selector */}
          <div className="card p-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Financial Report Analysis</h3>
                <p className="text-sm text-slate-500">
                  Select a company to view its financial analysis
                </p>
              </div>

              <div className="w-full md:w-64">
                <CompanySelector
                    companies={companies}
                    selectedCompany={selectedCompany}
                    onCompanySelect={handleCompanySelect}
                    isLoading={isLoadingCompanies}
                />
              </div>
            </div>

            {/* Error message display */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mt-4">
                  <div className="flex items-start gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <h4 className="font-semibold">Error Loading Data</h4>
                      <p className="text-sm mt-1">{error}</p>
                    </div>
                  </div>
                </div>
            )}
          </div>

          {/* Report Content */}
          {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
                  <p className="mt-4 text-slate-600">Loading financial report...</p>
                </div>
              </div>
          ) : report ? (
              <>
                {/* Financial Summary */}
                <FinancialSummaryCard report={report} />

                {/* Credit Score and Radar Chart */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="card flex items-center justify-center py-6">
                    <CreditScoreGauge score={report.creditScore} />
                  </div>

                  <div className="card p-4">
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">Financial Ratios Overview</h3>
                    <RatiosRadarChart ratios={report.ratios} />
                  </div>
                </div>

                {/* Performance Trends */}
                <div className="card p-4">
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">Performance Trends</h3>
                  <p className="text-sm text-slate-500 mb-4">
                    Track revenue, profit, and debt trends over time
                  </p>
                  <PerformanceTrendsChart trends={report.performanceTrends} />
                </div>

                {/* Category Selector and Detail Charts */}
                <div className="card">
                  <div className="p-4 border-b">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Ratio Categories</h3>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((category) => (
                          <button
                              key={category}
                              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                  selectedCategory === category
                                      ? 'bg-primary text-white'
                                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                              }`}
                              onClick={() => setSelectedCategory(category)}
                          >
                            {category}
                          </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-4">
                    {selectedCategory && (
                        <RatiosByCategory
                            ratios={report.ratios}
                            category={selectedCategory}
                        />
                    )}
                  </div>
                </div>

                {/* Recommendations */}
                <RecommendationsList recommendations={report.recommendations} />
              </>
          ) : !error ? (
              <div className="card p-8 text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">No Report Available</h3>
                <p className="text-slate-500 max-w-md mx-auto">
                  {companies.length === 0
                      ? "No companies are currently available in the system."
                      : "Please select a company from the dropdown menu to view its financial analysis report."}
                </p>
              </div>
          ) : null}
        </div>
      </div>
  );
};

export default Analytics;