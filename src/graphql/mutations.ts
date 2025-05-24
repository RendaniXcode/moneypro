import { gql } from '@apollo/client';
import { 
  LoginResponse, 
  RegisterResponse, 
  FinancialReports, 
  LoginInput, 
  RegisterInput,
  CreateFinancialReportsInput,
  UpdateFinancialReportsInput,
  DeleteFinancialReportsInput
} from './types';

// Login mutation (mock - not in actual schema but used for our app)
export const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      user {
        id
        name
        email
      }
      token
    }
  }
`;

// Register mutation (mock - not in actual schema but used for our app)
export const REGISTER = gql`
  mutation Register($name: String!, $email: String!, $password: String!) {
    register(name: $name, email: $email, password: $password) {
      user {
        id
        name
        email
      }
      token
    }
  }
`;

// Create financial reports
export const CREATE_FINANCIAL_REPORTS = gql`
  mutation CreateFinancialReports($input: CreateFinancialReportsInput!) {
    createFinancialReports(input: $input) {
      companyId
      reportDate
      companyName
      creditDecision
      creditScore
      industry
      lastUpdated
      reportStatus
      financialRatios
      performanceTrends
      recommendations
    }
  }
`;

// Update financial reports
export const UPDATE_FINANCIAL_REPORTS = gql`
  mutation UpdateFinancialReports($input: UpdateFinancialReportsInput!) {
    updateFinancialReports(input: $input) {
      companyId
      reportDate
      companyName
      creditDecision
      creditScore
      industry
      lastUpdated
      reportStatus
      financialRatios
      performanceTrends
      recommendations
    }
  }
`;

// Delete financial reports
export const DELETE_FINANCIAL_REPORTS = gql`
  mutation DeleteFinancialReports($input: DeleteFinancialReportsInput!) {
    deleteFinancialReports(input: $input) {
      companyId
      reportDate
    }
  }
`;

// Upload financial statement - creates a report from uploaded files
export const UPLOAD_FINANCIAL_STATEMENT = gql`
  mutation UploadFinancialStatement($input: CreateFinancialReportsInput!, $fileKeys: [String!]) {
    createFinancialReports(input: $input) {
      companyId
      reportDate
      companyName
      creditDecision
      creditScore
      industry
      lastUpdated
      reportStatus
    }
  }
`;

// TypeScript mutation result types
export interface LoginMutationResult {
  login: LoginResponse;
}

export interface RegisterMutationResult {
  register: RegisterResponse;
}

export interface CreateFinancialReportsMutationResult {
  createFinancialReports: FinancialReports;
}

export interface UpdateFinancialReportsMutationResult {
  updateFinancialReports: FinancialReports;
}

export interface DeleteFinancialReportsMutationResult {
  deleteFinancialReports: FinancialReports;
}

export interface UploadFinancialStatementMutationResult {
  createFinancialReports: FinancialReports;
}

// TypeScript mutation variables types
export interface LoginMutationVariables {
  email: string;
  password: string;
}

export interface RegisterMutationVariables {
  name: string;
  email: string;
  password: string;
}

export interface CreateFinancialReportsMutationVariables {
  input: CreateFinancialReportsInput;
}

export interface UpdateFinancialReportsMutationVariables {
  input: UpdateFinancialReportsInput;
}

export interface DeleteFinancialReportsMutationVariables {
  input: DeleteFinancialReportsInput;
}

export interface UploadFinancialStatementMutationVariables {
  input: CreateFinancialReportsInput;
  fileKeys?: string[];
}
