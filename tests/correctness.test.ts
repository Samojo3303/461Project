import { cloneRepository, checkRepositoryCorrectness } from '../src/metrics/correctness';

describe('Repository Correctness Tests', () => {
  const repoUrl = 'https://github.com/lodash/lodash'; // Example URL

  beforeAll(async () => {
    await cloneRepository(repoUrl);
  });

  test('should have commits', async () => {
    const isCorrect = await checkRepositoryCorrectness();
    expect(isCorrect).toBe(true);
  });

  // Add more tests as needed
});