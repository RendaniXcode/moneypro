import axios from 'axios';
import { apolloClient } from '../apolloClient';
import { 
  GET_FINANCIAL_REPORTS,
  LIST_FINANCIAL_REPORTS,
  GET_CURRENT_USER,
  GetFinancialReportsQueryVariables,
  ListFinancialReportsQueryVariables,
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
  UPLOAD_FINANCIAL_STATEMENT,
  LoginMutationVariables,
  RegisterMutationVariables,
  LoginMutationResult,
  RegisterMutationResult,
  CreateFinancialReportsMutationVariables,
  UpdateFinancialReportsMutationVariables,
  DeleteFinancialReportsMutationVariables,
  UploadFinancialStatementMutationVariables
} from '../graphql/mutations';

// API configuration for REST endpoints
const API_BASE_URL = 'https://api-gateway-endpoint.amazonaws.com/v1';
const S3_UPLOAD_ENDPOINT = 'https://s3-upload-api.amazonaws.com';

// Mock financial report data for fallback/development
export const mockFinancialReport = {
  companyId: { S: 'ACME123' },
  reportDate: { S: new Date().toISOString() },
  companyName: { S: 'ACME Corporation' },
  creditDecision: { S: 'APPROVED' },
  creditScore: { N: '78' },
  industry: { S: 'Technology' },
  lastUpdated: { S: new Date().toISOString() },
  reportStatus: { S: 'PUBLISHED' },
  financialRatios: {
    M: {
      liquidityRatios: {
        M: {
          currentRatio: { N: '2.5' },
          quickRatio: { N: '1.8' }
        }
      },
      profitabilityRatios: {
        M: {
          grossProfitMargin: { N: '0.45' },
          operatingProfitMargin: { N: '0.22' },
          returnOnAssets: { N: '0.18' }
        }
      },
      solvencyRatios: {
        M: {
          debtToEquityRatio: { N: '0.8' },
          interestCoverageRatio: { N: '8.5' }
        }
      },
      efficiencyRatios: {
        M: {
          assetTurnoverRatio: { N: '0.9' },
          inventoryTurnover: { N: '5.2' }
        }
      },
      marketValueRatios: {
        M: {
          priceToEarnings: { N: '16.8' }
        }
      }
    }
  },
  performanceTrends: {
    L: [
      {
        M: {
          year: { N: '2019' },
          revenue: { N: '1200000' },
          profit: { N: '250000' },
          debt: { N: '800000' }
        }
      },
      {
        M: {
          year: { N: '2020' },
          revenue: { N: '1350000' },
          profit: { N: '280000' },
          debt: { N: '750000' }
        }
      },
      {
        M: {
          year: { N: '2021' },
          revenue: { N: '1500000' },
          profit: { N: '320000' },
          debt: { N: '700000' }
        }
      },
      {
        M: {
          year: { N: '2022' },
          revenue: { N: '1650000' },
          profit: { N: '375000' },
          debt: { N: '650000' }
        }
      }
    ]
  },
  recommendations: {
    L: [
      { S: 'Improve working capital management to further strengthen liquidity position' },
      { S: 'Consider increasing dividend payouts as cash reserves are strong' },
      { S: 'Explore opportunities to refinance long-term debt at lower interest rates' },
      { S: 'Invest in inventory management systems to improve inventory turnover' }
    ]
  }
};

// Mock companies for development and testing
export const mockCompanies = [
  {
    id: 'ACME123',
    name: 'ACME Corporation',
    reportDate: '2023-01-15T00:00:00.000Z'
  },
  {
    id: 'GLOBEX456',
    name: 'Globex Inc.',
    reportDate: '2023-02-20T00:00:00.000Z'
  },
  {
    id: 'STARK789',
    name: 'Stark Industries',
    reportDate: '2023-03-10T00:00:00.000Z'
  }
];

// Real data service that uses GraphQL queries
export const dataService = {
  // Get financial report data from GraphQL API
  getFinancialReport: async (companyId: string, reportDate: string) => {
    try {
      const { data } = await apolloClient.query<GetFinancialReportsQueryResult, GetFinancialReportsQueryVariables>({
        query: GET_FINANCIAL_REPORTS,
        variables: {
          companyId,
          reportDate
        }
      });
      return data.getFinancialReports;
    } catch (error) {
      console.error('Error fetching financial report:', error);
      throw error;
    }
  },
  
  // Get list of companies from GraphQL API
  getAvailableCompanies: async () => {
    try {
      const { data } = await apolloClient.query<ListFinancialReportsQueryResult, ListFinancialReportsQueryVariables>({
        query: LIST_FINANCIAL_REPORTS,
        variables: {
          limit: 100
        }
      });

      // Map the items to the format expected by the application
      return data.listFinancialReports.items.map(item => ({
        id: item.companyId,
        name: item.companyName,
        reportDate: item.reportDate
      }));
    } catch (error) {
      console.error('Error fetching companies:', error);
      throw error;
    }
  },
  
  // Authentication with GraphQL API
  login: async (credentials: { email: string; password: string }) => {
    try {
      const { data } = await apolloClient.mutate<LoginMutationResult, LoginMutationVariables>({
        mutation: LOGIN,
        variables: {
          email: credentials.email,
          password: credentials.password
        }
      });
      
      // Store the token in localStorage
      if (data?.login.token) {
        localStorage.setItem('auth_token', data.login.token);
      }
      
      return data?.login;
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  },
  
  // Registration with GraphQL API
  register: async (userData: { name: string; email: string; password: string }) => {
    try {
      const { data } = await apolloClient.mutate<RegisterMutationResult, RegisterMutationVariables>({
        mutation: REGISTER,
        variables: {
          name: userData.name,
          email: userData.email,
          password: userData.password
        }
      });
      
      // Store the token in localStorage
      if (data?.register.token) {
        localStorage.setItem('auth_token', data.register.token);
      }
      
      return data?.register;
    } catch (error) {
      console.error('Error during registration:', error);
      throw error;
    }
  },
  
  // Get current user data
  getCurrentUser: async () => {
    try {
      const { data } = await apolloClient.query<GetCurrentUserQueryResult>({
        query: GET_CURRENT_USER
      });
      
      return data.getCurrentUser;
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw error;
    }
  }
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle API errors
    const errorMessage = error.response?.data?.message || 'An error occurred'
    console.error('API Error:', errorMessage)
    return Promise.reject(error)
  }
);

export default api;

// Real Reports API functions using GraphQL
export const reportsApi = {
  getReports: async (params?: Record<string, any>) => {
    try {
      const { data } = await apolloClient.query<ListFinancialReportsQueryResult, ListFinancialReportsQueryVariables>({
        query: LIST_FINANCIAL_REPORTS,
        variables: {
          filter: params?.filter,
          limit: params?.limit || 10,
          nextToken: params?.nextToken
        }
      });
      
      return {
        reports: data.listFinancialReports.items,
        total: data.listFinancialReports.items.length,
        page: 1,
        limit: params?.limit || 10,
        nextToken: data.listFinancialReports.nextToken
      };
    } catch (error) {
      console.error('Error fetching reports:', error);
      throw error;
    }
  },
  
  getReportById: async (companyId: string, reportDate: string) => {
    try {
      const { data } = await apolloClient.query<GetFinancialReportsQueryResult, GetFinancialReportsQueryVariables>({
        query: GET_FINANCIAL_REPORTS,
        variables: {
          companyId,
          reportDate
        },
        fetchPolicy: 'network-only' // Skip cache to ensure fresh data
      });
      
      return data.getFinancialReports;
    } catch (error) {
      console.error('Error fetching report by ID:', error);
      throw error;
    }
  },
  
  createReport: async (reportData: any) => {
    try {
      const { data } = await apolloClient.mutate<any, CreateFinancialReportsMutationVariables>({
        mutation: CREATE_FINANCIAL_REPORTS,
        variables: {
          input: reportData
        }
      });
      
      return data.createFinancialReports;
    } catch (error) {
      console.error('Error creating report:', error);
      throw error;
    }
  },
  
  updateReport: async (companyId: string, reportDate: string, reportData: any) => {
    try {
      const { data } = await apolloClient.mutate<any, UpdateFinancialReportsMutationVariables>({
        mutation: UPDATE_FINANCIAL_REPORTS,
        variables: {
          input: {
            companyId,
            reportDate,
            ...reportData
          }
        }
      });
      
      return data.updateFinancialReports;
    } catch (error) {
      console.error('Error updating report:', error);
      throw error;
    }
  },
  
  deleteReport: async (companyId: string, reportDate: string) => {
    try {
      const { data } = await apolloClient.mutate<any, DeleteFinancialReportsMutationVariables>({
        mutation: DELETE_FINANCIAL_REPORTS,
        variables: {
          input: {
            companyId,
            reportDate
          }
        }
      });
      
      return data.deleteFinancialReports;
    } catch (error) {
      console.error('Error deleting report:', error);
      throw error;
    }
  },
  
  queryReports: async (filters: Record<string, any>) => {
    try {
      const { data } = await apolloClient.query<ListFinancialReportsQueryResult, ListFinancialReportsQueryVariables>({
        query: LIST_FINANCIAL_REPORTS,
        variables: {
          filter: filters,
          limit: filters.limit || 100
        }
      });
      
      return {
        reports: data.listFinancialReports.items,
        total: data.listFinancialReports.items.length
      };
    } catch (error) {
      console.error('Error querying reports:', error);
      throw error;
    }
  }
};

// Upload API functions for S3 integration
// NOTE: The S3 upload functionality remains relatively unchanged
// as it's using AWS SDK directly rather than the GraphQL API
export const uploadApi = {
  // Get a presigned URL for direct S3 upload
  getPresignedUrl: async (fileName: string, fileType: string) => {
    try {
      // Make an actual API call to get presigned URL
      const response = await api.post('/upload/presigned-url', {
        fileName,
        fileType,
        bucket: import.meta.env.VITE_S3_BUCKET,
        folder: import.meta.env.VITE_S3_FOLDER
      });
      
      return response.data;
    } catch (error) {
      console.error('Error getting presigned URL:', error);
      throw new Error('Failed to get upload URL. Please try again.');
    }
  },
  
  // Upload file to S3 using the presigned URL
  uploadToS3: async (presignedUrl: string, file: File, onProgress: (progress: number) => void) => {
    try {
      // Use axios to upload the file with progress tracking
      const uploadResponse = await axios.put(presignedUrl, file, {
        headers: {
          'Content-Type': file.type,
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || file.size)
          );
          onProgress(percentCompleted);
        },
      });
      
      return { 
        success: uploadResponse.status >= 200 && uploadResponse.status < 300,
        response: uploadResponse.data
      };
    } catch (error) {
      console.error('Error uploading to S3:', error);
      throw new Error('Failed to upload file. Please try again.');
    }
  },
  
  // Notify backend that upload is complete and file should be processed
  notifyUploadComplete: async (fileKey: string, metadata?: Record<string, any>) => {
    try {
      // Notify the backend about completed upload
      const response = await apolloClient.mutate<any, UploadFinancialStatementMutationVariables>({
        mutation: UPLOAD_FINANCIAL_STATEMENT,
        variables: {
          input: metadata?.reportData || {},
          fileKeys: [fileKey]
        }
      });
      
      return {
        success: true,
        fileKey,
        reportData: response.data?.createFinancialReports
      };
    } catch (error) {
      console.error('Error notifying upload complete:', error);
      throw new Error('Failed to process uploaded file. Please try again.');
    }
  },
  
  // Get the status of file processing
  getFileProcessingStatus: async (fileKey: string) => {
    try {
      // Check with the backend for file processing status
      const response = await api.get(`/upload/status/${fileKey}`);
      return response.data;
    } catch (error) {
      console.error('Error getting file processing status:', error);
      throw new Error('Failed to check file processing status. Please try again.');
    }
  }
};
