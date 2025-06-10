/**
 * GraphQL Service - Fixed to handle lowercase field names from database
 * The database stores field names like "currentratio" but our code expects "currentRatio"
 */

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
  console.log('Raw report from GraphQL:', report);
  console.log('financialRatios raw string:', report.financialRatios);
  console.log('recommendations raw string:', report.recommendations);

  try {
    // Initialize default structure
    let parsedRatios = {
      liquidityRatios: { currentRatio: 0, quickRatio: 0 },
      profitabilityRatios: { grossProfitMargin: 0, operatingProfitMargin: 0, returnOnAssets: 0 },
      solvencyRatios: { debtToEquityRatio: 0, interestCoverageRatio: 0 },
      efficiencyRatios: { assetTurnoverRatio: 0, inventoryTurnover: 0 },
      marketValueRatios: { priceToEarnings: 0 }
    };

    let performanceTrends: PerformanceTrend[] = [];

    // Parse financialRatios if it exists
    if (report.financialRatios) {
      try {
        const ratiosData = JSON.parse(report.financialRatios);
        console.log('Parsed financialRatios object:', ratiosData);

        // Map the lowercase field names to our expected camelCase structure
        parsedRatios = {
          liquidityRatios: {
            currentRatio: ratiosData.liquidityRatios?.currentratio || 0,
            quickRatio: ratiosData.liquidityRatios?.quickratio || 0,
            // Also check for cashratio if it exists
            cashRatio: ratiosData.liquidityRatios?.cashratio
          },
          profitabilityRatios: {
            grossProfitMargin: ratiosData.profitabilityRatios?.grossprofitmargin || 0,
            operatingProfitMargin: ratiosData.profitabilityRatios?.operatingprofitmargin || 0,
            returnOnAssets: ratiosData.profitabilityRatios?.returnonassets || 0,
            // Also check for returnonequity if it exists
            returnOnEquity: ratiosData.profitabilityRatios?.returnonequity
          },
          solvencyRatios: {
            debtToEquityRatio: ratiosData.solvencyRatios?.debttoequityratio || 0,
            interestCoverageRatio: ratiosData.solvencyRatios?.interestcoverageratio || 0,
            // Also check for debtservicecoverageratio if it exists
            debtServiceCoverageRatio: ratiosData.solvencyRatios?.debtservicecoverageratio
          },
          efficiencyRatios: {
            assetTurnoverRatio: ratiosData.efficiencyRatios?.assetturnoverratio || 0,
            inventoryTurnover: ratiosData.efficiencyRatios?.inventoryturnover || 0,
            // Also check for payablesturnoverratio if it exists
            payablesTurnoverRatio: ratiosData.efficiencyRatios?.payablesturnoverratio
          },
          marketValueRatios: {
            priceToEarnings: ratiosData.marketValueRatios?.pricetoearnings || 0,
            // Also check for dividendyield if it exists
            dividendYield: ratiosData.marketValueRatios?.dividendyield
          }
        };

        // Check for performance trends in the ratios data
        if (ratiosData.performanceTrends) {
          performanceTrends = ratiosData.performanceTrends;
          console.log('Found performance trends in ratios:', performanceTrends);
        }
      } catch (parseError) {
        console.error('Error parsing financialRatios JSON:', parseError);
        console.error('Raw financialRatios string that failed to parse:', report.financialRatios);
      }
    } else {
      console.warn('No financialRatios field in report');
    }

    // Parse recommendations
    let recommendations: string[] = [];
    if (report.recommendations) {
      try {
        recommendations = JSON.parse(report.recommendations);
        console.log('Parsed recommendations:', recommendations);
      } catch (parseError) {
        console.error('Error parsing recommendations JSON:', parseError);
      }
    }

    // Parse creditScore - it's a string in the schema
    const creditScore = report.creditScore ? parseInt(report.creditScore, 10) : 0;
    console.log('Parsed creditScore:', creditScore, 'from:', report.creditScore);

    // Return fully parsed object
    const parsedReport = {
      companyId: report.companyId,
      reportDate: report.reportDate,
      companyName: report.companyName || "Unknown",
      creditDecision: report.creditDecision || "PENDING",
      creditScore,
      industry: report.industry || "Unknown",
      lastUpdated: report.lastUpdated || new Date().toISOString(),
      reportStatus: report.reportStatus || "DRAFT",
      financialRatios: parsedRatios,
      performanceTrends,
      recommendations,
      financialYear: report.financialYear,
      s3CsvUrl: report.s3CsvUrl
    };

    console.log('Final parsed report:', parsedReport);
    return parsedReport;

  } catch (error) {
    console.error('Error in parseFinancialReport:', error);
    throw new Error(`Failed to parse financial report data: ${error.message}`);
  }
};

// Transform parsed financial report to DynamoDB-style format for UI components
const transformToDynamoFormat = (parsedReport: ParsedFinancialReport) => {
  console.log('Starting transformation to DynamoDB format for:', parsedReport);

  try {
    // Helper function to safely convert to DynamoDB number format
    const toNum = (value: any): { N: string } => {
      const num = Number(value) || 0;
      return { N: String(num) };
    };

    // Transform from flat object structure to DynamoDB-style nested structure
    const report = {
      companyId: { S: parsedReport.companyId },
      reportDate: { S: parsedReport.reportDate },
      companyName: { S: parsedReport.companyName },
      creditDecision: { S: parsedReport.creditDecision },
      creditScore: toNum(parsedReport.creditScore),
      industry: { S: parsedReport.industry },
      lastUpdated: { S: parsedReport.lastUpdated },
      reportStatus: { S: parsedReport.reportStatus },
      financialRatios: {
        M: {
          liquidityRatios: {
            M: {
              currentRatio: toNum(parsedReport.financialRatios.liquidityRatios.currentRatio),
              quickRatio: toNum(parsedReport.financialRatios.liquidityRatios.quickRatio)
            }
          },
          profitabilityRatios: {
            M: {
              grossProfitMargin: toNum(parsedReport.financialRatios.profitabilityRatios.grossProfitMargin),
              operatingProfitMargin: toNum(parsedReport.financialRatios.profitabilityRatios.operatingProfitMargin),
              returnOnAssets: toNum(parsedReport.financialRatios.profitabilityRatios.returnOnAssets)
            }
          },
          solvencyRatios: {
            M: {
              debtToEquityRatio: toNum(parsedReport.financialRatios.solvencyRatios.debtToEquityRatio),
              interestCoverageRatio: toNum(parsedReport.financialRatios.solvencyRatios.interestCoverageRatio)
            }
          },
          efficiencyRatios: {
            M: {
              assetTurnoverRatio: toNum(parsedReport.financialRatios.efficiencyRatios.assetTurnoverRatio),
              inventoryTurnover: toNum(parsedReport.financialRatios.efficiencyRatios.inventoryTurnover)
            }
          },
          marketValueRatios: {
            M: {
              priceToEarnings: toNum(parsedReport.financialRatios.marketValueRatios.priceToEarnings)
            }
          }
        }
      },
      performanceTrends: {
        L: parsedReport.performanceTrends.map(trend => ({
          M: {
            year: toNum(trend.year),
            revenue: toNum(trend.revenue),
            profit: toNum(trend.profit),
            debt: toNum(trend.debt)
          }
        }))
      },
      recommendations: {
        L: parsedReport.recommendations.map(rec => ({
          S: rec
        }))
      }
    };

    // Add optional fields if they exist
    if (parsedReport.financialYear) {
      report['financialYear'] = { S: parsedReport.financialYear };
    }
    if (parsedReport.s3CsvUrl) {
      report['s3CsvUrl'] = { S: parsedReport.s3CsvUrl };
    }

    console.log('Transformed to DynamoDB format:', report);
    console.log('Sample ratio value check - currentRatio:', report.financialRatios.M.liquidityRatios.M.currentRatio);

    return report;
  } catch (error) {
    console.error('Error transforming to DynamoDB format:', error);
    throw new Error(`Failed to transform report data: ${error.message}`);
  }
};

// Convert financial report data to format expected by the GraphQL API
const prepareReportForApi = (reportData: any): CreateFinancialReportsInput => {
  // When creating/updating reports, convert camelCase to lowercase
  const ratiosObject = {
    liquidityRatios: {
      currentratio: reportData.financialRatios?.liquidityRatios?.currentRatio,
      quickratio: reportData.financialRatios?.liquidityRatios?.quickRatio,
      cashratio: reportData.financialRatios?.liquidityRatios?.cashRatio
    },
    profitabilityRatios: {
      grossprofitmargin: reportData.financialRatios?.profitabilityRatios?.grossProfitMargin,
      operatingprofitmargin: reportData.financialRatios?.profitabilityRatios?.operatingProfitMargin,
      returnonassets: reportData.financialRatios?.profitabilityRatios?.returnOnAssets,
      returnonequity: reportData.financialRatios?.profitabilityRatios?.returnOnEquity
    },
    solvencyRatios: {
      debttoequityratio: reportData.financialRatios?.solvencyRatios?.debtToEquityRatio,
      interestcoverageratio: reportData.financialRatios?.solvencyRatios?.interestCoverageRatio,
      debtservicecoverageratio: reportData.financialRatios?.solvencyRatios?.debtServiceCoverageRatio
    },
    efficiencyRatios: {
      assetturnoverratio: reportData.financialRatios?.efficiencyRatios?.assetTurnoverRatio,
      inventoryturnover: reportData.financialRatios?.efficiencyRatios?.inventoryTurnover,
      payablesturnoverratio: reportData.financialRatios?.efficiencyRatios?.payablesTurnoverRatio
    },
    marketValueRatios: {
      pricetoearnings: reportData.financialRatios?.marketValueRatios?.priceToEarnings,
      dividendyield: reportData.financialRatios?.marketValueRatios?.dividendYield
    },
    performanceTrends: reportData.performanceTrends
  };

  // Convert to JSON string for AWSJSON type
  const financialRatios = JSON.stringify(ratiosObject);

  const recommendations = reportData.recommendations
      ? JSON.stringify(reportData.recommendations)
      : undefined;

  // Return flattened object with JSON strings
  return {
    companyId: reportData.companyId,
    reportDate: reportData.reportDate,
    companyName: reportData.companyName,
    creditDecision: reportData.creditDecision,
    creditScore: String(reportData.creditScore), // Convert to string as per schema
    industry: reportData.industry,
    lastUpdated: reportData.lastUpdated,
    reportStatus: reportData.reportStatus,
    financialRatios,
    recommendations,
    financialYear: reportData.financialYear,
    s3CsvUrl: reportData.s3CsvUrl
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
  // Auth functions - removed mock fallbacks
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
      throw new Error(`Login failed: ${error.message || 'Unknown error'}`);
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
      throw new Error(`Registration failed: ${error.message || 'Unknown error'}`);
    }
  },

  // User functions - removed mock fallbacks
  getCurrentUser: async (): Promise<User> => {
    try {
      const { data, error } = await apolloClient.query<GetCurrentUserQueryResult>({
        query: GET_CURRENT_USER,
        fetchPolicy: 'network-only',
      });

      if (error) throw error;

      return data.getCurrentUser;
    } catch (error) {
      console.error('Get current user error:', error);
      throw new Error(`Failed to get current user: ${error.message || 'Unknown error'}`);
    }
  },

  // Financial report functions - updated with detailed logging
  getFinancialReport: async (companyId: string, reportDate: string): Promise<any> => {
    try {
      console.log(`Fetching financial report for company ${companyId}, date ${reportDate}`);
      const variables: GetFinancialReportsQueryVariables = { companyId, reportDate };

      const result = await apolloClient.query<GetFinancialReportsQueryResult>({
        query: GET_FINANCIAL_REPORTS,
        variables,
        fetchPolicy: 'network-only',
      });

      console.log('GraphQL query result:', {
        hasData: !!result.data,
        hasReport: !!result.data?.getFinancialReports,
        error: result.error
      });

      if (result.error) {
        console.warn('GraphQL error when fetching report:', result.error);
        throw result.error;
      }

      if (result.data?.getFinancialReports) {
        const rawReport = result.data.getFinancialReports;
        console.log('Raw financial report received:', {
          companyId: rawReport.companyId,
          companyName: rawReport.companyName,
          creditScore: rawReport.creditScore,
          hasFinancialRatios: !!rawReport.financialRatios,
          financialRatiosLength: rawReport.financialRatios?.length,
          hasRecommendations: !!rawReport.recommendations
        });

        // Parse the JSON strings from AppSync
        const parsedReport = parseFinancialReport(rawReport);

        // Transform to DynamoDB format expected by UI components
        return transformToDynamoFormat(parsedReport);
      }

      throw new Error(`No report found for company ${companyId} on ${reportDate}`);
    } catch (error) {
      if (error instanceof ApolloError) {
        console.error('Apollo error details:', {
          message: error.message,
          graphQLErrors: error.graphQLErrors,
          networkError: error.networkError
        });
      } else {
        console.error('Error getting financial report:', error);
      }

      throw new Error(`Failed to fetch financial report: ${error.message || 'Unknown error'}`);
    }
  },

  // Company functions - get from financial reports list
  getAvailableCompanies: async (): Promise<Company[]> => {
    try {
      const result = await apolloClient.query<ListFinancialReportsQueryResult>({
        query: LIST_FINANCIAL_REPORTS,
        variables: { limit: 100 },
        fetchPolicy: 'network-only',
      });

      console.log('Companies list result:', {
        hasData: !!result.data,
        hasItems: !!result.data?.listFinancialReports?.items,
        itemCount: result.data?.listFinancialReports?.items?.length || 0
      });

      if (result.error) {
        console.warn('GraphQL error when fetching companies:', result.error);
        throw result.error;
      }

      if (result.data?.listFinancialReports?.items?.length) {
        return convertToCompanies(result.data.listFinancialReports.items);
      }

      throw new Error('No companies found in the system');
    } catch (error) {
      if (error instanceof ApolloError) {
        console.error('Apollo error details:', {
          message: error.message,
          graphQLErrors: error.graphQLErrors,
          networkError: error.networkError
        });
      } else {
        console.error('Error listing companies:', error);
      }

      throw new Error(`Failed to fetch companies: ${error.message || 'Unknown error'}`);
    }
  },

  // Report management functions
  createReport: async (reportData: any): Promise<any> => {
    try {
      const input = prepareReportForApi(reportData);
      console.log('Creating report with input:', input);

      const variables: CreateFinancialReportsMutationVariables = { input };
      const { data, errors } = await apolloClient.mutate<CreateFinancialReportsMutationResult>({
        mutation: CREATE_FINANCIAL_REPORTS,
        variables,
      });

      if (errors && errors.length > 0) {
        throw new Error(errors[0].message);
      }

      console.log('Report created successfully:', data?.createFinancialReports);
      return data?.createFinancialReports;
    } catch (error) {
      console.error('Create report error:', error);
      throw error;
    }
  },

  updateReport: async (companyId: string, reportDate: string, reportData: any): Promise<any> => {
    try {
      const updateData = prepareReportForApi(reportData);

      const input = {
        ...updateData,
        companyId,
        reportDate
      };

      console.log('Updating report with input:', input);

      const variables: UpdateFinancialReportsMutationVariables = { input };

      const { data, errors } = await apolloClient.mutate<UpdateFinancialReportsMutationResult>({
        mutation: UPDATE_FINANCIAL_REPORTS,
        variables,
      });

      if (errors && errors.length > 0) {
        throw new Error(errors[0].message);
      }

      console.log('Report updated successfully:', data?.updateFinancialReports);
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

      console.log('Deleting report:', input);

      const { data, errors } = await apolloClient.mutate<DeleteFinancialReportsMutationResult>({
        mutation: DELETE_FINANCIAL_REPORTS,
        variables,
      });

      if (errors && errors.length > 0) {
        throw new Error(errors[0].message);
      }

      console.log('Report deleted successfully');
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