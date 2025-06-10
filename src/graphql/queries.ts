/**
 * GraphQL Queries - Updated to match the actual schema
 * Removed performanceTrends field which doesn't exist in the schema
 * Added missing fields: financialYear and s3CsvUrl
 */

import { gql } from '@apollo/client';
import {
  FinancialReports,
  FinancialReportsConnection,
  Company,
  User
} from './types';

// Query to get financial report - FIXED to match schema
export const GET_FINANCIAL_REPORTS = gql`
  query GetFinancialReports($companyId: String!, $reportDate: String!) {
    getFinancialReports(companyId: $companyId, reportDate: $reportDate) {
      companyId
      reportDate
      companyName
      creditDecision
      creditScore
      industry
      lastUpdated
      reportStatus
      financialRatios
      financialYear
      recommendations
      s3CsvUrl
    }
  }
`;

// Query to list available financial reports - Added missing fields
export const LIST_FINANCIAL_REPORTS = gql`
  query ListFinancialReports($filter: TableFinancialReportsFilterInput, $limit: Int, $nextToken: String) {
    listFinancialReports(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        companyId
        reportDate
        companyName
        creditDecision
        creditScore
        industry
        lastUpdated
        reportStatus
        financialYear
        s3CsvUrl
      }
      nextToken
    }
  }
`;

// Mock user query (not in actual schema but used for our app)
export const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    getCurrentUser {
      id
      name
      email
      role
    }
  }
`;

// TypeScript query result types
export interface GetFinancialReportsQueryResult {
  getFinancialReports: FinancialReports;
}

export interface ListFinancialReportsQueryResult {
  listFinancialReports: FinancialReportsConnection;
}

export interface GetCurrentUserQueryResult {
  getCurrentUser: User;
}

// TypeScript query variables types
export interface GetFinancialReportsQueryVariables {
  companyId: string;
  reportDate: string;
}

export interface ListFinancialReportsQueryVariables {
  filter?: {
    companyId?: { eq?: string; contains?: string };
    reportDate?: { eq?: string; contains?: string };
    companyName?: { contains?: string };
    industry?: { contains?: string };
    reportStatus?: { eq?: string };
  };
  limit?: number;
  nextToken?: string;
}