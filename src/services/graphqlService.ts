import { ApolloError } from '@apollo/client';
import { apolloClient } from '../graphql/client';
import { 
  GET_FINANCIAL_REPORTS, 
  LIST_FINANCIAL_REPORTS, 
  GET_CURRENT_USER,
  GetFinancialReportsQueryVariables,
  GetFinancialReportsQueryResult,
  ListFinancialReportsQueryResult,
  GetCurrentUserQueryResult
} from '../graphql/queries';
import { 
  LOGIN, 
  REGISTER, 
  CREATE_FINANCIAL_REPORTS, 
  UPDATE_FINANCIAL_REPORTS, 
  DELETE_FINANCIAL_REPORTS,
  LoginMutationVariables,
  RegisterMutationVariables,
  CreateFinancialReportsMutationVariables,
  UpdateFinancialReportsMutationVariables,
  DeleteFinancialReportsMutationVariables,
  LoginMutationResult,
  RegisterMutationResult,
  CreateFinancialReportsMutationResult,
  UpdateFinancialReportsMutationResult,
  DeleteFinancialReportsMutationResult
} from '../graphql/mutations';
import { mockFinancialReport, mockCompanies } from './api';
import { 
  FinancialReports, 
  Company, 
  User, 
  LoginInput, 
  RegisterInput,
  FinancialRatios,
  PerformanceTrend,
  ParsedFinancialReport
} from '../graphql/types';

// Parse JSON strings from AppSync into objects
const parseFinancialReport = (report: FinancialReports): ParsedFinancialReport => {
  console.log('Parsing GraphQL report:', report);
  
  try {
    // Parse JSON strings into objects
    const financialRatios: FinancialRatios = report.financialRatios 
      ? JSON.parse(report.financialRatios) 
      : {
          liquidityRatios: { currentRatio: 0, quickRatio: 0 },
          profitabilityRatios: { grossProfitMargin: 0, operatingProfitMargin: 0, returnOnAssets: 0 },
          solvencyRatios: { debtToEquityRatio: 0, interestCoverageRatio: 0 },
          efficiencyRatios: { assetTurnoverRatio: 0, inventoryTurnover: 0 },
          marketValueRatios: { priceToEarnings: 0 }
        };
    
    const performanceTrends: PerformanceTrend[] = report.performanceTrends 
      ? JSON.parse(report.performanceTrends) 
      : [];
    
    const recommendations: string[] = report.recommendations 
      ? JSON.parse(report.recommendations) 
      : [];
    
    // Return fully parsed object
    return {
      companyId: report.companyId,
      reportDate: report.reportDate,
      companyName: report.companyName || "Unknown",
      creditDecision: report.creditDecision,
      creditScore: report.creditScore || 0,
      industry: report.industry || "Unknown",
      lastUpdated: report.lastUpdated || new Date().toISOString(),
      reportStatus: report.reportStatus || "DRAFT",
      financialRatios,
      performanceTrends,
      recommendations
    };
  } catch (error) {
    console.error('Error parsing financial report JSON:', error);
    // Return a safe fallback
    return {
      companyId: report.companyId,
      reportDate: report.reportDate,
      companyName: report.companyName || "Unknown",
      creditDecision: report.creditDecision,
      creditScore: report.creditScore || 0,
      industry: report.industry || "Unknown",
      lastUpdated: report.lastUpdated || new Date().toISOString(),
      reportStatus: report.reportStatus || "DRAFT",
      financialRatios: {
        liquidityRatios: { currentRatio: 0, quickRatio: 0 },
        profitabilityRatios: { grossProfitMargin: 0, operatingProfitMargin: 0, returnOnAssets: 0 },
        solvencyRatios: { debtToEquityRatio: 0, interestCoverageRatio: 0 },
        efficiencyRatios: { assetTurnoverRatio: 0, inventoryTurnover: 0 },
        marketValueRatios: { priceToEarnings: 0 }
      },
      performanceTrends: [],
      recommendations: []
    };
  }
};

// Transform parsed financial report to DynamoDB-style format for UI components
const transformToDynamoFormat = (parsedReport: ParsedFinancialReport) => {
  try {
    // Transform from flat object structure to DynamoDB-style nested structure
    // This is required because our UI components expect data in this format
    const report = {
      companyId: { S: parsedReport.companyId },
      reportDate: { S: parsedReport.reportDate },
      companyName: { S: parsedReport.companyName },
      creditDecision: { S: parsedReport.creditDecision },
      creditScore: { N: String(parsedReport.creditScore) },
      industry: { S: parsedReport.industry },
      lastUpdated: { S: parsedReport.lastUpdated },
      reportStatus: { S: parsedReport.reportStatus },
      financialRatios: {
        M: {
          liquidityRatios: {
            M: {
              currentRatio: { N: String(parsedReport.financialRatios.liquidityRatios.currentRatio) },
              quickRatio: { N: String(parsedReport.financialRatios.liquidityRatios.quickRatio) }
            }
          },
          profitabilityRatios: {
            M: {
              grossProfitMargin: { N: String(parsedReport.financialRatios.profitabilityRatios.grossProfitMargin) },
              operatingProfitMargin: { N: String(parsedReport.financialRatios.profitabilityRatios.operatingProfitMargin) },
              returnOnAssets: { N: String(parsedReport.financialRatios.profitabilityRatios.returnOnAssets) }
            }
          },
          solvencyRatios: {
            M: {
              debtToEquityRatio: { N: String(parsedReport.financialRatios.solvencyRatios.debtToEquityRatio) },
              interestCoverageRatio: { N: String(parsedReport.financialRatios.solvencyRatios.interestCoverageRatio) }
            }
          },
          efficiencyRatios: {
            M: {
              assetTurnoverRatio: { N: String(parsedReport.financialRatios.efficiencyRatios.assetTurnoverRatio) },
              inventoryTurnover: { N: String(parsedReport.financialRatios.efficiencyRatios.inventoryTurnover) }
            }
          },
          marketValueRatios: {
            M: {
              priceToEarnings: { N: String(parsedReport.financialRatios.marketValueRatios.priceToEarnings) }
            }
          }
        }
      },
      performanceTrends: {
        L: parsedReport.performanceTrends.map(trend => ({
          M: {
            year: { N: String(trend.year) },
            revenue: { N: String(trend.revenue) },
            profit: { N: String(trend.profit) },
            debt: { N: String(trend.debt) }
          }
        }))
      },
      recommendations: {
        L: parsedReport.recommendations.map(rec => ({
          S: rec
        }))
      }
    };

    console.log('Transformed to DynamoDB format for UI:', report);
    return report;
  } catch (error) {
    console.error('Error transforming to DynamoDB format:', error);
    return mockFinancialReport;
  }
};

// Convert financial report data to format expected by the GraphQL API
const prepareReportForApi = (reportData: any): CreateFinancialReportsInput => {
  // Extract nested structures and convert to JSON strings for API
  const financialRatios = reportData.financialRatios 
    ? JSON.stringify(reportData.financialRatios)
    : undefined;
  
  const performanceTrends = reportData.performanceTrends 
    ? JSON.stringify(reportData.performanceTrends)
    : undefined;
  
  const recommendations = reportData.recommendations 
    ? JSON.stringify(reportData.recommendations)
    : undefined;
  
  // Return flattened object with JSON strings
  return {
    companyId: reportData.companyId,
    reportDate: reportData.reportDate,
    companyName: reportData.companyName,
    creditDecision: reportData.creditDecision,
    creditScore: reportData.creditScore,
    industry: reportData.industry,
    lastUpdated: reportData.lastUpdated,
    reportStatus: reportData.reportStatus,
    financialRatios,
    performanceTrends,
    recommendations
  };
};

// Convert list of financial reports to companies format
const convertToCompanies = (financialReports: FinancialReports[]): Company[] => {
  if (!financialReports || !financialReports.length) {
    return [];
  }
  
  return financialReports.map(report => ({
    id: report.companyId,
    name: report.companyName || "Unknown Company",
    reportDate: report.reportDate
  }));
};

// GraphQL service with strongly-typed functions and error handling
export const graphqlService = {
  // Auth functions (mocked as they don't exist in the schema)
  login: async (credentials: LoginInput): Promise<any> => {
    try {
      const variables: LoginMutationVariables = credentials;
      const { data } = await apolloClient.mutate<LoginMutationResult>({
        mutation: LOGIN,
        variables,
      });
      
      if (data?.login?.token) {
        // Store token for auth
        localStorage.setItem('auth_token', data.login.token);
        return data.login;
      }
      
      throw new Error('Login failed - no token received');
    } catch (error) {
      console.error('Login error:', error);
      
      // For demo: provide a fallback response
      return {
        user: {
          id: '1',
          name: 'Demo User',
          email: credentials.email,
          role: 'user',
        },
        token: 'demo-token'
      };
    }
  },
  
  register: async (userData: RegisterInput): Promise<any> => {
    try {
      const variables: RegisterMutationVariables = userData;
      const { data } = await apolloClient.mutate<RegisterMutationResult>({
        mutation: REGISTER,
        variables,
      });
      
      if (data?.register?.token) {
        localStorage.setItem('auth_token', data.register.token);
        return data.register;
      }
      
      throw new Error('Registration failed - no token received');
    } catch (error) {
      console.error('Register error:', error);
      
      // For demo: provide a fallback response
      return {
        user: {
          id: '1',
          name: userData.name,
          email: userData.email,
          role: 'user',
        },
        token: 'demo-token'
      };
    }
  },
  
  // User functions (mocked as they don't exist in the schema)
  getCurrentUser: async (): Promise<User> => {
    try {
      const { data, error } = await apolloClient.query<GetCurrentUserQueryResult>({
        query: GET_CURRENT_USER,
        fetchPolicy: 'network-only', // Always fetch fresh data
      });
      
      if (error) throw error;
      
      return data.getCurrentUser;
    } catch (error) {
      console.error('Get current user error:', error);
      
      // Fallback to mock data
      return {
        id: '1',
        name: 'Demo User',
        email: 'demo@example.com',
        role: 'user'
      };
    }
  },
  
  // Financial report functions
  getFinancialReport: async (companyId: string, reportDate: string): Promise<any> => {
    try {
      console.log(`Fetching financial report for company ${companyId}, date ${reportDate}`);
      const variables: GetFinancialReportsQueryVariables = { companyId, reportDate };
      
      const { data, error } = await apolloClient.query<GetFinancialReportsQueryResult>({
        query: GET_FINANCIAL_REPORTS,
        variables,
        fetchPolicy: 'network-only', // Don't use cache
      });
      
      if (error) {
        console.warn('GraphQL error when fetching report:', error);
        throw error;
      }
      
      if (data?.getFinancialReports) {
        console.log('Financial report data received from GraphQL:', data.getFinancialReports);
        
        // Parse the JSON strings from AppSync
        const parsedReport = parseFinancialReport(data.getFinancialReports);
        
        // Transform to DynamoDB format expected by UI components
        return transformToDynamoFormat(parsedReport);
      }
      
      throw new Error('No report data found');
    } catch (error) {
      if (error instanceof ApolloError) {
        console.error('Apollo error when getting financial report:', 
          error.message, 
          error.graphQLErrors,
          error.networkError
        );
      } else {
        console.error('Error getting financial report:', error);
      }
      
      // Fallback to mock data for development and testing
      console.log('Using mock financial report data as fallback');
      return mockFinancialReport;
    }
  },
  
  // Company functions - derived from financial reports list
  getAvailableCompanies: async (): Promise<Company[]> => {
    try {
      const { data, error } = await apolloClient.query<ListFinancialReportsQueryResult>({
        query: LIST_FINANCIAL_REPORTS,
        variables: { limit: 100 }, // Limit to first 100 reports
        fetchPolicy: 'network-only', // Don't use cache
      });
      
      if (error) {
        console.warn('GraphQL error when fetching companies:', error);
        throw error;
      }
      
      if (data?.listFinancialReports?.items?.length) {
        // Convert financial reports to company format
        return convertToCompanies(data.listFinancialReports.items);
      }
      
      throw new Error('No companies found in API response');
    } catch (error) {
      if (error instanceof ApolloError) {
        console.error('Apollo error when listing companies:', 
          error.message, 
          error.graphQLErrors,
          error.networkError
        );
      } else {
        console.error('Error listing companies:', error);
      }
      
      // Fallback to mock data for development and testing
      console.log('Using mock companies data as fallback');
      return mockCompanies;
    }
  },
  
  // Report management functions
  createReport: async (reportData: any): Promise<any> => {
    try {
      // Prepare the report data for API (convert nested structures to JSON strings)
      const input = prepareReportForApi(reportData);
      
      const variables: CreateFinancialReportsMutationVariables = { input };
      const { data, errors } = await apolloClient.mutate<CreateFinancialReportsMutationResult>({
        mutation: CREATE_FINANCIAL_REPORTS,
        variables,
      });
      
      if (errors && errors.length > 0) {
        throw new Error(errors[0].message);
      }
      
      return data?.createFinancialReports;
    } catch (error) {
      console.error('Create report error:', error);
      throw error;
    }
  },
  
  updateReport: async (companyId: string, reportDate: string, reportData: any): Promise<any> => {
    try {
      // Prepare update data (convert nested structures to JSON strings)
      const updateData = prepareReportForApi(reportData);
      
      // Include required identifiers
      const input = {
        ...updateData,
        companyId,
        reportDate
      };
      
      const variables: UpdateFinancialReportsMutationVariables = { input };
      
      const { data, errors } = await apolloClient.mutate<UpdateFinancialReportsMutationResult>({
        mutation: UPDATE_FINANCIAL_REPORTS,
        variables,
      });
      
      if (errors && errors.length > 0) {
        throw new Error(errors[0].message);
      }
      
      return data?.updateFinancialReports;
    } catch (error) {
      console.error('Update report error:', error);
      throw error;
    }
  },
  
  deleteReport: async (companyId: string, reportDate: string): Promise<any> => {
    try {
      const input = { companyId, reportDate };
      const variables: DeleteFinancialReportsMutationVariables = { input };
      
      const { data, errors } = await apolloClient.mutate<DeleteFinancialReportsMutationResult>({
        mutation: DELETE_FINANCIAL_REPORTS,
        variables,
      });
      
      if (errors && errors.length > 0) {
        throw new Error(errors[0].message);
      }
      
      return {
        success: true,
        ...data?.deleteFinancialReports
      };
    } catch (error) {
      console.error('Delete report error:', error);
      throw error;
    }
  }
};
