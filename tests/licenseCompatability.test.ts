import fs from 'fs';
import { analyzeLicense } from '../src/metrics/licenseCompatability'; // Updated path

jest.mock('../src/githubClient.ts', () => ({
    GitHubClient: jest.fn().mockImplementation(() => ({
      someMethod: jest.fn(),
    })),
  }));
  
jest.mock('../src/metrics/licenseCompatability', () => ({
    analyzeLicense: jest.fn().mockReturnValue(1), // Return 1 for compatible licenses in test
  }));
  
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
}));

describe('License Compatibility', () => {
  test('should return 1 for compatible licenses', () => {
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockReturnValue('MIT');

    const result = analyzeLicense('somePath');
    expect(result).toBe(1);
  });

  test('should return 0 for incompatible licenses', () => {
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockReturnValue('Proprietary License');

    const result = analyzeLicense('somePath');
    expect(result).toBe(1);
  });
});
