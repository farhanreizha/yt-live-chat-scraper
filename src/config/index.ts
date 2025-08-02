/**
 * Application configuration object
 * @property {string} baseUrl - Base URL from environment variables, defaults to empty string
 * @property {string} env - Application environment from environment variables, defaults to 'development'
 */
export default {
  baseUrl: process.env.BASE_URL ?? '',
  env: process.env.APP_ENV ?? 'development',
};
