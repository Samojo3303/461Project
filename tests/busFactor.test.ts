// Mocking GitHubClient since it's required in the metric file but we don't need it for this test

jest.mock('../src/githubClient.ts', () => ({
    GitHubClient: jest.fn().mockImplementation(() => ({
      someMethod: jest.fn(),
    })),
  }));
  
  
  import { metricBusFactor } from '../src/metrics/busFactor';
  
  describe('Bus Factor Metric', () => {
    test('should calculate bus factor correctly', async () => {
      const result = await metricBusFactor({ owner: 'testOwner', name: 'testRepo' });
      expect(result).toBeGreaterThan(0); // Modify the expectation based on your logic
    });
  });
  