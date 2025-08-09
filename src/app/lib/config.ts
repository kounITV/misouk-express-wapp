// Use direct values to avoid SSR/client hydration mismatch
const getConfig = () => {
  return {
    NODE_ENV: 'development',
    NEXTAUTH_URL: 'http://localhost:3000',
    API_BASE_URL: 'https://misouk-api.jackkaphon.com',
    API_URL: 'https://misouk-api.jackkaphon.com/api/v1',
  };
};

export const config = getConfig();

export const apiEndpoints = {
  login: `${config.API_URL}/auth/login`,
  validate: `${config.API_URL}/auth/validate`,
  // Users endpoints
  users: `${config.API_URL}/users`,
  roles: `${config.API_URL}/roles`,
};