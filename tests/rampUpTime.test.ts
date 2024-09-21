// Mocking GitHubClient since it's required in the metric file but we don't need it for this test

jest.mock('../src/githubClient.ts', () => ({
    GitHubClient: jest.fn().mockImplementation(() => ({
      someMethod: jest.fn(),
    })),
  }));
  
  
  import { metricRampUpTime } from '../src/metrics/rampUpTime';
  
  describe('Ramp Up Time Metric', () => {
    test('should calculate ramp up time correctly', async () => {
      const result = await metricRampUpTime({ owner: 'testOwner', name: 'testRepo' });
      expect(result).toBeGreaterThan(0); // Modify the expectation based on your logic
    });
  });
  