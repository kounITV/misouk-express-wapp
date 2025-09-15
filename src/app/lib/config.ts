// Use direct values to avoid SSR/client hydration mismatch
const getConfig = () => {
  console.log('=== CONFIG DEBUG ===');
  console.log('NEXT_PUBLIC_API_BASE_URL from env:', process.env.NEXT_PUBLIC_API_BASE_URL);
  console.log('NODE_ENV from env:', process.env.NODE_ENV);
  
  return {
    NODE_ENV: process.env.NODE_ENV || 'development',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://misouk-api.jackkaphon.com',
    API_URL: process.env.NEXT_PUBLIC_API_BASE_URL ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1` : 'https://misouk-api.jackkaphon.com/api/v1',
  };
};

export const config = getConfig();

export const apiEndpoints = {
  login: 'https://misouk-api.jackkaphon.com/api/v1/auth/login', // Hardcoded for debugging
  validate: `${config.API_URL}/auth/validate`,
  // Users endpoints
  users: `${config.API_URL}/users`,
  roles: `${config.API_URL}/roles`,
  // Products endpoints
  products: `${config.API_URL}/products`,
  // Orders endpoints
  orders: `${config.API_URL}/orders`,
  ordersBulk: `${config.API_URL}/orders/bulk`,
  // Report endpoints
  reportSummary: `${config.API_URL}/orders/report/summary`,
};