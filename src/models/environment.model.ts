export interface Env {
  /** Load the .env file specified by the ENV_PATH environment variable */
  path: string;
  /** Dev or prod environment */
  env: 'dev' | 'production';
  /** DB connection string */
  dbConnectionString: string | null;
  /** Secret for JWT Tokens */
  tokenSecret: string | null;
}
