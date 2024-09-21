// Mocking GitHubClient since it's required in the metric file but we don't need it for this test

jest.mock('../src/githubClient.ts', () => ({
    GitHubClient: jest.fn().mockImplementation(() => ({
      someMethod: jest.fn(),
    })),
  }));
  
  import { metricResponsiveness } from '../src/metrics/responsiveness';
  
  describe('Responsiveness Metric', () => {
    test('should calculate responsiveness correctly', async () => {
      const result = await metricResponsiveness({ owner: 'testOwner', name: 'testRepo' });
      expect(result).toBeGreaterThan(0); // Modify the expectation based on your logic
    });
  });
  