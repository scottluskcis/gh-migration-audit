import { createAppAuth, StrategyOptions } from '@octokit/auth-app';
import { AuthInterface } from '@octokit/auth-app/dist-types/types';
import { Logger } from './types';
import { readFileSync } from 'fs';

export interface AuthConfig {
  authStrategy: ((options: StrategyOptions) => AuthInterface) | undefined;
  auth:
    | string
    | { appId: number; privateKey: string; installationId: number }
    | undefined;
}

const getEnvVar = (name: string): string | undefined => process.env[name];

const getAuthAppId = (appId?: string): number => {
  const authAppId = appId || getEnvVar('GITHUB_APP_ID');
  if (!authAppId || isNaN(parseInt(authAppId))) {
    throw new Error(
      'You must specify a GitHub app ID using the --app-id argument or GITHUB_APP_ID environment variable.',
    );
  }
  return parseInt(authAppId);
};

const getAuthPrivateKey = (privateKey?: string, privateKeyFile?: string): string => {
  const authPrivateKeyFile = privateKeyFile || getEnvVar('GITHUB_APP_PRIVATE_KEY_FILE');
  let authPrivateKey = privateKey || getEnvVar('GITHUB_APP_PRIVATE_KEY');
  if (!authPrivateKey && authPrivateKeyFile) {
    authPrivateKey = readFileSync(authPrivateKeyFile, 'utf-8');
  }
  if (!authPrivateKey) {
    throw new Error(
      'You must specify a GitHub app private key using the --private-key argument or GITHUB_APP_PRIVATE_KEY environment variable. Alternatively, you can also specify a file containing the private key using the --private-key-file argument or GITHUB_APP_PRIVATE_KEY_FILE environment variable.',
    );
  }
  return authPrivateKey;
};

const getAuthInstallationId = (appInstallationId?: string): number => {
  const authInstallationId = appInstallationId || getEnvVar('GITHUB_APP_INSTALLATION_ID');
  if (!authInstallationId || isNaN(parseInt(authInstallationId))) {
    throw new Error(
      'You must specify a GitHub app installation ID using the --app-installation-id argument or GITHUB_APP_INSTALLATION_ID environment variable.',
    );
  }
  return parseInt(authInstallationId);
};

const getTokenAuthConfig = (accessToken?: string): AuthConfig => {
  const authToken = accessToken || getEnvVar('GITHUB_TOKEN');
  if (!authToken) {
    throw new Error(
      'You must specify a GitHub access token using the --access-token argument or GITHUB_TOKEN environment variable.',
    );
  }
  return { authStrategy: undefined, auth: authToken };
};

const getInstallationAuthConfig = (
  appId?: string,
  privateKey?: string,
  privateKeyFile?: string,
  appInstallationId?: string,
): AuthConfig => {
  const auth = {
    appId: getAuthAppId(appId),
    privateKey: getAuthPrivateKey(privateKey, privateKeyFile),
    installationId: getAuthInstallationId(appInstallationId),
  };
  return { authStrategy: createAppAuth, auth };
};

export const createAuthConfig = ({
  accessToken,
  appId,
  privateKey,
  privateKeyFile,
  appInstallationId,
  logger,
}: {
  accessToken?: string | undefined;
  appId?: string | undefined;
  privateKey?: string | undefined;
  privateKeyFile?: string | undefined;
  appInstallationId?: string | undefined;
  logger: Logger;
}): AuthConfig => {
  try {
    if (appInstallationId || getEnvVar('GITHUB_APP_INSTALLATION_ID')) {
      logger.info('Validating configuration using GitHub App installation');
      return getInstallationAuthConfig(appId, privateKey, privateKeyFile, appInstallationId);
    } else {
      logger.info('Validating configuration using GitHub access token');
      return getTokenAuthConfig(accessToken);
    }
  } catch (e) {
    logger.error('Error creating and validating auth config', e);
    throw e;
  }
};
