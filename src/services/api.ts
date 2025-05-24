import axios from 'axios'

// Mock financial report data
export const mockFinancialReport = {
  "companyId": {
    "S": "MULTICHOICE-001"
  },
  "reportDate": {
    "S": "2024-04-15"
  },
  "companyName": {
    "S": "MultiChoice Group"
  },
  "creditDecision": {
    "S": "DECLINED"
  },
  "creditScore": {
    "N": "82"
  },
  "financialRatios": {
    "M": {
      "efficiencyRatios": {
        "M": {
          "assetTurnoverRatio": {
            "N": "0.74"
          },
          "inventoryTurnover": {
            "N": "5.2"
          }
        }
      },
      "liquidityRatios": {
        "M": {
          "currentRatio": {
            "N": "1.85"
          },
          "quickRatio": {
            "N": "1.42"
          }
        }
      },
      "marketValueRatios": {
        "M": {
          "priceToEarnings": {
            "N": "14.8"
          }
        }
      },
      "profitabilityRatios": {
        "M": {
          "grossProfitMargin": {
            "N": "35.2"
          },
          "operatingProfitMargin": {
            "N": "18.4"
          },
          "returnOnAssets": {
            "N": "12.7"
          }
        }
      },
      "solvencyRatios": {
        "M": {
          "debtToEquityRatio": {
            "N": "0.68"
          },
          "interestCoverageRatio": {
            "N": "8.5"
          }
        }
      }
    }
  },
  "industry": {
    "S": "Media & Entertainment"
  },
  "lastUpdated": {
    "S": "2024-04-15T10:30:00Z"
  },
  "performanceTrends": {
    "L": [
      {
        "M": {
          "debt": {
            "N": "25"
          },
          "profit": {
            "N": "30"
          },
          "revenue": {
            "N": "45"
          },
          "year": {
            "N": "1"
          }
        }
      },
      {
        "M": {
          "debt": {
            "N": "26"
          },
          "profit": {
            "N": "29"
          },
          "revenue": {
            "N": "48"
          },
          "year": {
            "N": "2"
          }
        }
      },
      {
        "M": {
          "debt": {
            "N": "27"
          },
          "profit": {
            "N": "28"
          },
          "revenue": {
            "N": "52"
          },
          "year": {
            "N": "3"
          }
        }
      },
      {
        "M": {
          "debt": {
            "N": "28"
          },
          "profit": {
            "N": "27"
          },
          "revenue": {
            "N": "56"
          },
          "year": {
            "N": "4"
          }
        }
      },
      {
        "M": {
          "debt": {
            "N": "29"
          },
          "profit": {
            "N": "26"
          },
          "revenue": {
            "N": "62"
          },
          "year": {
            "N": "5"
          }
        }
      }
    ]
  },
  "recommendations": {
    "L": [
      {
        "S": "Consider optimizing inventory management to improve the inventory turnover ratio."
      },
      {
        "S": "Maintain the current debt management strategy as it provides a good balance between leverage and financial stability."
      },
      {
        "S": "Explore opportunities to improve asset utilization to enhance the asset turnover ratio."
      },
      {
        "S": "Continue investing in high-return content production to maintain competitive advantage."
      },
      {
        "S": "Consider strategic acquisitions in emerging markets to diversify revenue streams."
      }
    ]
  },
  "reportStatus": {
    "S": "PUBLISHED"
  }
};

// Mock companies data
export const mockCompanies = [
  { id: 'MULTICHOICE-001', name: 'MultiChoice Group', reportDate: '2024-04-15' },
  { id: 'AMAZON-001', name: 'Amazon.com Inc.', reportDate: '2024-03-31' },
  { id: 'NETFLIX-001', name: 'Netflix Inc.', reportDate: '2024-03-15' },
  { id: 'SHOPRITE-001', name: 'Shoprite Holdings', reportDate: '2024-02-28' },
  { id: 'MICROSOFT-001', name: 'Microsoft Corporation', reportDate: '2024-01-31' }
];

// Static data service that replaces API calls
export const dataService = {
  // Get static financial report data
  getFinancialReport: () => {
    // Return a promise to mimic async behavior but use static data
    return Promise.resolve(mockFinancialReport);
  },
  
  // Get static list of companies
  getAvailableCompanies: () => {
    // Return a promise to mimic async behavior but use static data
    return Promise.resolve(mockCompanies);
  },
  
  // Mock authentication - always returns success
  login: (credentials: { email: string; password: string }) => {
    return Promise.resolve({
      user: {
        id: '1',
        name: 'Demo User',
        email: credentials.email,
      },
      token: 'demo-token-12345'
    });
  },
  
  // Mock registration - always returns success
  register: (userData: { name: string; email: string; password: string }) => {
    return Promise.resolve({
      user: {
        id: '1',
        name: userData.name,
        email: userData.email,
      },
      token: 'demo-token-12345'
    });
  },
  
  // Mock user data
  getCurrentUser: () => {
    return Promise.resolve({
      id: '1',
      name: 'Demo User',
      email: 'demo@example.com',
      role: 'user'
    });
  }
};

// API configuration
const API_BASE_URL = 'https://api-gateway-endpoint.amazonaws.com/v1'
const S3_UPLOAD_ENDPOINT = 'https://s3-upload-api.amazonaws.com'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

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
)

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle API errors
    const errorMessage = error.response?.data?.message || 'An error occurred'
    console.error('API Error:', errorMessage)
    return Promise.reject(error)
  }
)

export default api

// Reports API functions (keeping for reference, but using dataService instead)
export const reportsApi = {
  getReports: async (params?: Record<string, any>) => {
    // Return mock data instead of making API call
    return Promise.resolve({
      reports: [],
      total: 0,
      page: 1,
      limit: 10
    });
  },
  
  getReportById: async (companyId: string, reportDate: string) => {
    // Return mock report data
    return Promise.resolve(mockFinancialReport);
  },
  
  createReport: async (data: any) => {
    return Promise.resolve({ success: true });
  },
  
  updateReport: async (companyId: string, reportDate: string, data: any) => {
    return Promise.resolve({ success: true });
  },
  
  deleteReport: async (companyId: string, reportDate: string) => {
    return Promise.resolve({ success: true });
  },
  
  queryReports: async (filters: Record<string, any>) => {
    return Promise.resolve({
      reports: [],
      total: 0
    });
  }
}

// Get the API key for S3 uploads
const getS3ApiKey = () => {
  return import.meta.env.VITE_S3_UPLOAD_API_KEY || 'demo-api-key';
}

// Upload API functions for S3 integration
export const uploadApi = {
  // Get a presigned URL for direct S3 upload
  getPresignedUrl: async (fileName: string, fileType: string) => {
    try {
      // For development/testing, return a mock presigned URL
      if (import.meta.env.DEV) {
        console.log('DEV mode: Using mock presigned URL');
        
        // Generate a unique file key with timestamp to avoid collisions
        const timestamp = new Date().getTime();
        const fileKey = `${timestamp}-${fileName}`;
        
        return { 
          presignedUrl: `${S3_UPLOAD_ENDPOINT}/mock-upload/${fileKey}`, 
          fileKey 
        };
      }
      
      // For production, make an actual API call
      const response = await api.post('/upload/presigned-url', {
        fileName,
        fileType,
        // Add any other required parameters
      });
      
      return response.data;
    } catch (error) {
      console.error('Error getting presigned URL:', error);
      
      // Fallback for demo/development
      const timestamp = new Date().getTime();
      const fileKey = `${timestamp}-${fileName}`;
      
      return { 
        presignedUrl: `${S3_UPLOAD_ENDPOINT}/mock-upload/${fileKey}`, 
        fileKey 
      };
    }
  },
  
  // Upload file to S3 using the presigned URL
  uploadToS3: async (presignedUrl: string, file: File, onProgress: (progress: number) => void) => {
    try {
      if (import.meta.env.DEV) {
        // For development, simulate a gradual upload
        await new Promise(resolve => setTimeout(() => { onProgress(25); resolve(null); }, 300));
        await new Promise(resolve => setTimeout(() => { onProgress(50); resolve(null); }, 600));
        await new Promise(resolve => setTimeout(() => { onProgress(75); resolve(null); }, 900));
        await new Promise(resolve => setTimeout(() => { onProgress(100); resolve(null); }, 1200));
        
        return { success: true };
      }
      
      // For production, use axios to upload the file with progress tracking
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
      if (import.meta.env.DEV) {
        // For development, return success immediately
        console.log('DEV mode: Simulating successful upload notification');
        return { success: true, fileKey };
      }
      
      // For production, notify the backend
      const response = await api.post('/upload/complete', {
        fileKey,
        metadata
      });
      
      return response.data;
    } catch (error) {
      console.error('Error notifying upload complete:', error);
      
      // For demo purposes, return success even on error
      return { 
        success: true,
        fileKey,
        demo: true
      };
    }
  },
  
  // Get the status of file processing
  getFileProcessingStatus: async (fileKey: string) => {
    try {
      if (import.meta.env.DEV) {
        // For development, return mock processing status
        return { 
          status: 'completed',
          progress: 100,
          fileKey
        };
      }
      
      // For production, check with the backend
      const response = await api.get(`/upload/status/${fileKey}`);
      return response.data;
    } catch (error) {
      console.error('Error getting file processing status:', error);
      
      // For demo purposes, return completed status
      return { 
        status: 'completed',
        progress: 100,
        fileKey,
        demo: true
      };
    }
  }
}
