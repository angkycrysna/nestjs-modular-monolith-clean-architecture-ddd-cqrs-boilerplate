/**
 * Abstracts the source of application secrets.
 *
 * Current: Render environment variables (process.env)
 * Future:  AWS Secrets Manager, HashiCorp Vault, etc.
 *
 * Called in main.ts BEFORE NestFactory.create() so that all secrets
 * are available in process.env by the time ConfigModule initializes.
 */
export interface ISecretManager {
  /**
   * Loads secrets from the configured provider and returns them
   * as key-value pairs. These will be merged into process.env.
   *
   * Return an empty object if secrets are already in process.env
   * (e.g., Render injects env vars directly).
   */
  load(): Promise<Record<string, string>>;
}
