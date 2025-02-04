import { createAuthConfig } from '../src/auth';
import { Logger } from '../src/types';

describe('createAuthConfig', () => {
    const mockLogger: Logger = {
        info: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
        warn: jest.fn()
    };

    it('should return token auth config when only accessToken is provided', () => {
        const accessToken = 'gh13994940220393293932';
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
});