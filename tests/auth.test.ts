import { createAuthConfig } from '../src/auth';
import { Logger } from '../src/types';

describe('createAuthConfig', () => {
    const mockLogger: Logger = {
        info: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
        warn: jest.fn()
    };

    it('should return token auth config when authType is token and accessToken is provided', () => {
        const accessToken = 'token';
        const config = createAuthConfig({
            authType: 'token',
            accessToken,
            logger: mockLogger,
        });

        expect(config).toEqual({
            authStrategy: undefined,
            auth: accessToken,
        });
    });

    it('should throw an error when authType is token and accessToken is missing', () => {
        expect(() => {
            createAuthConfig({
                authType: 'token',
                logger: mockLogger,
            });
        }).toThrow('You must specify a GitHub access token using the --access-token argument or GITHUB_TOKEN environment variable.');
    });

    it('should return token auth config when no authType is provided and accessToken is provided', () => {
        const accessToken = 'token';
        const config = createAuthConfig({
            accessToken,
            logger: mockLogger,
        });

        expect(config).toEqual({
            authStrategy: undefined,
            auth: accessToken,
        });
    });

    it('should throw an error when no authType is provided and accessToken is missing', () => {
        expect(() => {
            createAuthConfig({
                logger: mockLogger,
            });
        }).toThrow('You must specify a GitHub access token using the --access-token argument or GITHUB_TOKEN environment variable.');
    });

    it('should return installation auth config when authType is installation and required parameters are provided', () => {
        const appId = '12345';
        const privateKey = 'private-key';
        const appInstallationId = '67890';
        const config = createAuthConfig({
            authType: 'installation',
            appId,
            privateKey,
            appInstallationId,
            logger: mockLogger,
        });

        expect(config).toEqual({
            authStrategy: expect.any(Function),
            auth: {
                appId: parseInt(appId),
                privateKey,
                installationId: parseInt(appInstallationId),
            },
        });
    });

    it('should throw an error when authType is installation and appId is missing', () => {
        const privateKey = 'private-key';
        const appInstallationId = '67890';

        expect(() => {
            createAuthConfig({
                authType: 'installation',
                privateKey,
                appInstallationId,
                logger: mockLogger,
            });
        }).toThrow('You must specify a GitHub app ID using the --app-id argument or GITHUB_APP_ID environment variable.');
    });

    it('should throw an error when authType is installation and privateKey is missing', () => {
        const appId = '12345';
        const appInstallationId = '67890';

        expect(() => {
            createAuthConfig({
                authType: 'installation',
                appId,
                appInstallationId,
                logger: mockLogger,
            });
        }).toThrow('You must specify a GitHub app private key using the --private-key argument or GITHUB_APP_PRIVATE_KEY environment variable.');
    });

    it('should throw an error when authType is installation and appInstallationId is missing', () => {
        const appId = '12345';
        const privateKey = 'private-key';

        expect(() => {
            createAuthConfig({
                authType: 'installation',
                appId,
                privateKey,
                logger: mockLogger,
            });
        }).toThrow('You must specify a GitHub app installation ID using the --app-installation-id argument or GITHUB_APP_INSTALLATION_ID environment variable.');
    });

    it('should throw an error when authType is installation and privateKeyFile is missing', () => {
        const appId = '12345';
        const appInstallationId = '67890';

        expect(() => {
            createAuthConfig({
                authType: 'installation',
                appId,
                appInstallationId,
                logger: mockLogger,
            });
        }).toThrow('You must specify a GitHub app private key using the --private-key argument or GITHUB_APP_PRIVATE_KEY environment variable.');
    });

    it('should return app auth config when authType is app and required parameters are provided', () => {
        const appId = '12345';
        const privateKey = 'private-key';
        const clientId = 'client-id';
        const clientSecret = 'client-secret';
        const config = createAuthConfig({
            authType: 'app',
            appId,
            privateKey,
            clientId,
            clientSecret,
            logger: mockLogger,
        });

        expect(config).toEqual({
            authStrategy: expect.any(Function),
            auth: {
                appId: parseInt(appId),
                privateKey,
                clientId,
                clientSecret,
            },
        });
    });

    it('should throw an error when authType is app and appId is missing', () => {
        const privateKey = 'private-key';
        const clientId = 'client-id';
        const clientSecret = 'client-secret';

        expect(() => {
            createAuthConfig({
                authType: 'app',
                privateKey,
                clientId,
                clientSecret,
                logger: mockLogger,
            });
        }).toThrow('You must specify a GitHub app ID using the --app-id argument or GITHUB_APP_ID environment variable.');
    });

    it('should throw an error when authType is app and privateKey is missing', () => {
        const appId = '12345';
        const clientId = 'client-id';
        const clientSecret = 'client-secret';

        expect(() => {
            createAuthConfig({
                authType: 'app',
                appId,
                clientId,
                clientSecret,
                logger: mockLogger,
            });
        }).toThrow('You must specify a GitHub app private key using the --private-key argument or GITHUB_APP_PRIVATE_KEY environment variable.');
    });

    it('should throw an error when authType is app and clientId is missing', () => {
        const appId = '12345';
        const privateKey = 'private-key';
        const clientSecret = 'client-secret';

        expect(() => {
            createAuthConfig({
                authType: 'app',
                appId,
                privateKey,
                clientSecret,
                logger: mockLogger,
            });
        }).toThrow('You must specify a GitHub client ID using the --client-id argument or GITHUB_CLIENT_ID environment variable.');
    });

    it('should throw an error when authType is app and clientSecret is missing', () => {
        const appId = '12345';
        const privateKey = 'private-key';
        const clientId = 'client-id';

        expect(() => {
            createAuthConfig({
                authType: 'app',
                appId,
                privateKey,
                clientId,
                logger: mockLogger,
            });
        }).toThrow('You must specify a GitHub client secret using the --client-secret argument or GITHUB_CLIENT_SECRET environment variable.');
    });

    it('should throw an error when authType is app and privateKeyFile is missing', () => {
        const appId = '12345';
        const clientId = 'client-id';
        const clientSecret = 'client-secret';

        expect(() => {
            createAuthConfig({
                authType: 'app',
                appId,
                clientId,
                clientSecret,
                logger: mockLogger,
            });
        }).toThrow('You must specify a GitHub app private key using the --private-key argument or GITHUB_APP_PRIVATE_KEY environment variable.');
    });

    it('should return token auth config when authType is token and accessToken is provided via environment variable', () => {
        process.env.GITHUB_TOKEN = 'env-token';
        const config = createAuthConfig({
            authType: 'token',
            logger: mockLogger,
        });

        expect(config).toEqual({
            authStrategy: undefined,
            auth: 'env-token',
        });
        delete process.env.GITHUB_TOKEN;
    });

    it('should return installation auth config when authType is installation and required parameters are provided via environment variables', () => {
        process.env.GITHUB_APP_ID = '12345';
        process.env.GITHUB_APP_PRIVATE_KEY = 'env-private-key';
        process.env.GITHUB_APP_INSTALLATION_ID = '67890';
        const config = createAuthConfig({
            authType: 'installation',
            logger: mockLogger,
        });

        expect(config).toEqual({
            authStrategy: expect.any(Function),
            auth: {
                appId: 12345,
                privateKey: 'env-private-key',
                installationId: 67890,
            },
        });
        delete process.env.GITHUB_APP_ID;
        delete process.env.GITHUB_APP_PRIVATE_KEY;
        delete process.env.GITHUB_APP_INSTALLATION_ID;
    });

    it('should return app auth config when authType is app and required parameters are provided via environment variables', () => {
        process.env.GITHUB_APP_ID = '12345';
        process.env.GITHUB_APP_PRIVATE_KEY = 'env-private-key';
        process.env.GITHUB_CLIENT_ID = 'env-client-id';
        process.env.GITHUB_CLIENT_SECRET = 'env-client-secret';
        const config = createAuthConfig({
            authType: 'app',
            logger: mockLogger,
        });

        expect(config).toEqual({
            authStrategy: expect.any(Function),
            auth: {
                appId: 12345,
                privateKey: 'env-private-key',
                clientId: 'env-client-id',
                clientSecret: 'env-client-secret',
            },
        });
        delete process.env.GITHUB_APP_ID;
        delete process.env.GITHUB_APP_PRIVATE_KEY;
        delete process.env.GITHUB_CLIENT_ID;
        delete process.env.GITHUB_CLIENT_SECRET;
    });
});
