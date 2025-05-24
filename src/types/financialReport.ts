// Types for financial report data from DynamoDB

export interface FinancialRatio {
  N: string; // DynamoDB number format
}

export interface RatioCategory {
  M: Record<string, FinancialRatio>;
}

export interface FinancialRatios {
  M: {
    liquidityRatios?: RatioCategory;
    profitabilityRatios?: RatioCategory;
    solvencyRatios?: RatioCategory;
    efficiencyRatios?: RatioCategory;
    marketValueRatios?: RatioCategory;
  };
}

export interface PerformanceTrendItem {
  M: {
    year: { N: string };
    revenue: { N: string };
    profit: { N: string };
    debt: { N: string };
  };
}

export interface FinancialReport {
  companyId: { S: string };
  reportDate: { S: string };
  companyName: { S: string };
  creditDecision: { S: string };
  creditScore: { N: string };
  industry: { S: string };
  lastUpdated: { S: string };
  reportStatus: { S: string };
  financialRatios: FinancialRatios;
  performanceTrends: { L: PerformanceTrendItem[] };
  recommendations: { L: { S: string }[] };
}

// Normalized types for use in the application
export interface NormalizedRatio {
  name: string;
  value: number;
  category: string;
}

export interface NormalizedPerformanceTrend {
  year: number;
  revenue: number;
  profit: number;
  debt: number;
}

export interface NormalizedFinancialReport {
  companyId: string;
  reportDate: string;
  companyName: string;
  creditDecision: string;
  creditScore: number;
  industry: string;
  lastUpdated: string;
  reportStatus: string;
  ratios: NormalizedRatio[];
  performanceTrends: NormalizedPerformanceTrend[];
  recommendations: string[];
}

// Function to normalize DynamoDB financial report data
export function normalizeFinancialReport(report: any): NormalizedFinancialReport {
  // Extract and flatten all ratios
  const ratios: NormalizedRatio[] = [];
  
  // Process each ratio category
  const ratioCategories = report.financialRatios.M;
  
  Object.entries(ratioCategories).forEach(([categoryKey, category]) => {
    // Format category name (e.g., "liquidityRatios" -> "Liquidity Ratios")
    const categoryName = categoryKey
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace(/Ratios$/, 'Ratios');
    
    // Process each ratio in the category
    Object.entries(category.M).forEach(([ratioKey, ratio]) => {
      // Format ratio name (e.g., "currentRatio" -> "Current Ratio")
      const ratioName = ratioKey
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase());
      
      ratios.push({
        name: ratioName,
        value: parseFloat(ratio.N),
        category: categoryName
      });
    });
  });
  
  // Normalize performance trends
  const performanceTrends = report.performanceTrends.L.map(trend => ({
    year: parseInt(trend.M.year.N),
    revenue: parseFloat(trend.M.revenue.N),
    profit: parseFloat(trend.M.profit.N),
    debt: parseFloat(trend.M.debt.N)
  }));
  
  // Sort performance trends by year
  performanceTrends.sort((a, b) => a.year - b.year);
  
  // Normalize recommendations
  const recommendations = report.recommendations.L.map(rec => rec.S);
  
  return {
    companyId: report.companyId.S,
    reportDate: report.reportDate.S,
    companyName: report.companyName.S,
    creditDecision: report.creditDecision.S,
    creditScore: parseInt(report.creditScore.N),
    industry: report.industry.S,
    lastUpdated: report.lastUpdated.S,
    reportStatus: report.reportStatus.S,
    ratios,
    performanceTrends,
    recommendations
  };
}
