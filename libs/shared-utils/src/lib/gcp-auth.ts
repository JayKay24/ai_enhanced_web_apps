import { getVercelOidcToken } from '@vercel/oidc';
import { ExternalAccountClient } from 'google-auth-library';

export interface GCPAuthOptions {
  authClient: ExternalAccountClient;
  projectId: string;
}

/**
 * Programmatically constructs the GCP Workload Identity Federation ExternalAccountClient
 * using Vercel OIDC. Returns the client configuration if environment variables are
 * present, or undefined to fallback to default Application Default Credentials (ADC).
 */
export function getGCPAuthOptions(): GCPAuthOptions | undefined {
  const GCP_PROJECT_ID = process.env.GCP_PROJECT_ID || process.env.VERTEX_AI_PROJECT_ID;
  const GCP_PROJECT_NUMBER = process.env.GCP_PROJECT_NUMBER;
  const GCP_SERVICE_ACCOUNT_EMAIL = process.env.GCP_SERVICE_ACCOUNT_EMAIL;
  const GCP_WORKLOAD_IDENTITY_POOL_ID = process.env.GCP_WORKLOAD_IDENTITY_POOL_ID;
  const GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID = process.env.GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID;

  if (
    GCP_PROJECT_ID &&
    GCP_PROJECT_NUMBER &&
    GCP_SERVICE_ACCOUNT_EMAIL &&
    GCP_WORKLOAD_IDENTITY_POOL_ID &&
    GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID &&
    (process.env.VERCEL_OIDC_TOKEN || process.env.NODE_ENV === 'production')
  ) {
    const authClient = ExternalAccountClient.fromJSON({
      type: 'external_account',
      audience: `//iam.googleapis.com/projects/${GCP_PROJECT_NUMBER}/locations/global/workloadIdentityPools/${GCP_WORKLOAD_IDENTITY_POOL_ID}/providers/${GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID}`,
      subject_token_type: 'urn:ietf:params:oauth:token-type:jwt',
      token_url: 'https://sts.googleapis.com/v1/token',
      service_account_impersonation_url: `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${GCP_SERVICE_ACCOUNT_EMAIL}:generateAccessToken`,
      subject_token_supplier: {
        getSubjectToken: async () => {
          const token = await getVercelOidcToken();
          if (!token) {
            throw new Error('Vercel OIDC token not found');
          }
          return token;
        },
      },
    });

    if (!authClient) {
      throw new Error('Failed to initialize GCP ExternalAccountClient from JSON configuration');
    }

    return {
      authClient: authClient as ExternalAccountClient,
      projectId: GCP_PROJECT_ID,
    };
  }

  return undefined;
}
