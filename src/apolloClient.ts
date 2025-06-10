import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

// AppSync GraphQL endpoint
const APPSYNC_API_URL = 'https://gqczteoq4fcnzbhaqsas4wotqq.appsync-api.us-east-1.amazonaws.com/graphql';

// Get API key from environment variables - ensure this is set in your .env file
// For production, you should use a more secure auth method (IAM, Cognito, etc.)
const API_KEY = import.meta.env.VITE_APPSYNC_API_KEY || '';

// Log missing API key warning
if (!API_KEY) {
  console.warn('No API key provided for AppSync. Set VITE_APPSYNC_API_KEY in your .env file.');
}

// Create a standard HTTP link to the GraphQL endpoint
const httpLink = createHttpLink({
  uri: APPSYNC_API_URL,
});

// Add auth headers to all requests
const authLink = setContext((_, { headers }) => {
  // Get the authentication token from local storage if it exists
  const token = localStorage.getItem('auth_token');
  
  return {
    headers: {
      ...headers,
      // Add API key authentication header
      'x-api-key': API_KEY,
      // Add auth token if available
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      // You can add other headers as needed
    }
  };
});

// Create the Apollo Client with combined links
export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache({
    // Optional: Configure how the cache normalizes and stores data
    typePolicies: {
      Query: {
        fields: {
          getFinancialReports: {
            // Customize cache key for reports
            keyArgs: ['companyId', 'reportDate'],
          },
          listFinancialReports: {
            // Merge for pagination
            keyArgs: ['filter'],
            merge(existing = { items: [] }, incoming) {
              return {
                ...incoming,
                items: [...(existing.items || []), ...(incoming.items || [])],
              };
            },
          }
        },
      },
    },
  }),
  defaultOptions: {
    query: {
      fetchPolicy: 'cache-and-network', // Check cache but also request from network
      errorPolicy: 'all', // Return data even if there are errors
    },
    mutate: {
      errorPolicy: 'all',
    },
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all',
    },
  },
  // Enable this for debugging purposes in development
  connectToDevTools: import.meta.env.DEV,
});
