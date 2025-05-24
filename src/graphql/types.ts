// GraphQL API response types

// Financial report types for normalized data in the app
export interface FinancialRatios {
  liquidityRatios: {
    currentRatio: number;
    quickRatio: number;
  };
  profitabilityRatios: {
    grossProfitMargin: number;
    operatingProfitMargin: number;
    returnOnAssets: number;
  };
  solvencyRatios: {
    debtToEquityRatio: number;
    interestCoverageRatio: number;
  };
  efficiencyRatios: {
    assetTurnoverRatio: number;
    inventoryTurnover: number;
  };
  marketValueRatios: {
    priceToEarnings: number;
  };
}

export interface PerformanceTrend {
  year: number;
  revenue: number;
  profit: number;
  debt: number;
}

// GraphQL schema types
export interface FinancialReports {
  companyId: string;
  reportDate: string;
  companyName?: string;
  creditDecision: string;
  creditScore?: number;
  industry?: string;
  lastUpdated?: string;
  reportStatus?: string;
  financialRatios?: string; // AWSJSON type in GraphQL
  performanceTrends?: string; // AWSJSON type in GraphQL
  recommendations?: string; // AWSJSON type in GraphQL
}

export interface FinancialReportsConnection {
  items?: FinancialReports[];
  nextToken?: string;
}

// Company types (derived from financial reports)
export interface Company {
  id: string;
  name: string;
  reportDate: string;
}

// User types (not in actual schema, but used in our app)
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

// Auth types (not in actual schema, but used in our app)
export interface LoginResponse {
  user: User;
  token: string;
}

export interface RegisterResponse {
  user: User;
  token: string;
}

// Input types
export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

// Schema-defined input types
export interface CreateFinancialReportsInput {
  companyId: string;
  reportDate: string;
  companyName?: string;
  creditDecision: string;
  creditScore?: number;
  industry?: string;
  lastUpdated?: string;
  reportStatus?: string;
  financialRatios?: string; // AWSJSON
  performanceTrends?: string; // AWSJSON
  recommendations?: string; // AWSJSON
}

export interface UpdateFinancialReportsInput {
  companyId: string;
  reportDate: string;
  companyName?: string;
  creditDecision?: string;
  creditScore?: number;
  industry?: string;
  lastUpdated?: string;
  reportStatus?: string;
  financialRatios?: string; // AWSJSON
  performanceTrends?: string; // AWSJSON
  recommendations?: string; // AWSJSON
}

export interface DeleteFinancialReportsInput {
  companyId: string;
  reportDate: string;
}

// Internal app types for processed data
export interface ParsedFinancialReport {
  companyId: string;
  reportDate: string;
  companyName: string;
  creditDecision: string;
  creditScore: number;
  industry: string;
  lastUpdated: string;
  reportStatus: string;
  financialRatios: FinancialRatios;
  performanceTrends: PerformanceTrend[];
  recommendations: string[];
}
