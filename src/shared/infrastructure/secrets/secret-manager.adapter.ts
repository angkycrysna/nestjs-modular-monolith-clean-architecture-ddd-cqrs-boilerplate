import { ISecretManager } from '@shared/application/interfaces/secret-manager.interface';

/**
 * Loads application secrets from the configured provider.
 *
 * This adapter is instantiated in main.ts BEFORE the NestJS app starts,
 * so it cannot use NestJS dependency injection.
 *
 * ── Current (Render) ──
 * Render injects env vars directly into process.env.
 * Nothing extra to load — return empty object.
 *
 * ── Future (AWS Secrets Manager) ──
 * Update this file to use the AWS SDK:
 *
 *   import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
 *
 *   async load(): Promise<Record<string, string>> {
 *     const client = new SecretsManagerClient({ region: process.env.AWS_REGION });
 *     const response = await client.send(
 *       new GetSecretValueCommand({ SecretId: process.env.AWS_SECRET_NAME }),
 *     );
 *     return JSON.parse(response.SecretString!);
 *   }
 */
export class SecretManagerAdapter implements ISecretManager {
  load(): Promise<Record<string, string>> {
    // Render: all secrets are already in process.env via Render dashboard.
    // No external secret fetching needed.
    return Promise.resolve({});
  }
}
