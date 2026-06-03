import * as fs from 'fs';
import * as path from 'path';

/**
 * Initializes Google Cloud credentials on environments (like Vercel serverless functions)
 * where application default credentials are not locally available on disk.
 * Supports both traditional Service Account keys and Workload Identity Federation (OIDC).
 */
export function initGCPCredentials(): void {
  // 1. Traditional Service Account Key Fallback
  const credentialsJson = process.env.GCP_SERVICE_ACCOUNT_KEY || process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (credentialsJson && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    const tempPath = path.join('/tmp', 'gcp-service-account.json');
    try {
      if (!fs.existsSync(tempPath)) {
        fs.writeFileSync(tempPath, credentialsJson);
      }
      process.env.GOOGLE_APPLICATION_CREDENTIALS = tempPath;
      return;
    } catch (error) {
      console.error('Failed to initialize GCP service account key credentials:', error);
    }
  }

  // 2. Workload Identity Federation (Keyless OIDC)
  const oidcToken = process.env.VERCEL_OIDC_TOKEN;
  const projectNumber = process.env.GCP_PROJECT_NUMBER;
  const saEmail = process.env.GCP_SERVICE_ACCOUNT_EMAIL;
  const poolId = process.env.GCP_WORKLOAD_IDENTITY_POOL;
  const providerId = process.env.GCP_WORKLOAD_IDENTITY_PROVIDER;

  if (oidcToken && projectNumber && saEmail && poolId && providerId && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    try {
      const tokenPath = path.join('/tmp', 'vercel-oidc-token.txt');
      const configPath = path.join('/tmp', 'gcp-workload-identity.json');

      // Write OIDC token to temporary file
      fs.writeFileSync(tokenPath, oidcToken);

      // Construct the Google credential configuration object
      const workloadConfig = {
        type: 'external_account',
        audience: `//iam.googleapis.com/projects/${projectNumber}/locations/global/workloadIdentityPools/${poolId}/providers/${providerId}`,
        subject_token_type: 'urn:ietf:params:oauth:token-type:jwt',
        token_url: 'https://sts.googleapis.com/v1/token',
        credential_source: {
          file: tokenPath,
          format: {
            type: 'text',
          },
        },
        service_account_impersonation_url: `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${saEmail}:generateAccessToken`,
      };

      // Write credential config file
      fs.writeFileSync(configPath, JSON.stringify(workloadConfig, null, 2));

      // Instruct Google Auth library to use this config file
      process.env.GOOGLE_APPLICATION_CREDENTIALS = configPath;
    } catch (error) {
      console.error('Failed to initialize GCP Workload Identity Federation credentials:', error);
    }
  }
}
