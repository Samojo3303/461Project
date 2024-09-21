import { metricResponsiveness } from '../src/metrics/responsiveness';
import { metricRampUpTime } from '../src/metrics/rampUpTime';
import { metricBusFactor } from '../src/metrics/busFactor';
import { analyzeLicense } from '../src/metrics/licenseCompatability';
import { calculateCAD } from '../src/metrics/correctness';
import { analyzeURL } from '../src/main'; // Assuming main.ts exports analyzeURL

// Mock for file system and GitHubClient if needed
jest.mock('fs');
jest.mock('../src/githubClient.ts', () => ({
  GitHubClient: jest.fn().mockImplementation(() => ({
    someMethod: jest.fn(),
  })),
}));

// Test cases
describe('Module Metric Tests', () => {
  const exampleGitHubURL = 'https://github.com/facebook/react';
  const exampleNpmURL = 'https://www.npmjs.com/package/react';

  // Test for the analyzeURL function, covering all metrics and measuring latencies
  test('should analyze URL and calculate all metrics with latencies', async () => {
    const startTime = Date.now();
    const result = await analyzeURL(exampleGitHubURL); // URL to analyze

    const totalLatency = (Date.now() - startTime) / 1000; // Latency calculation in seconds

    // Check if the result is not null
    expect(result).not.toBeNull();

    // If result is not null, then continue checking the properties
    if (result) {
      expect(result).toHaveProperty('NetScore');
      expect(result).toHaveProperty('RampUp');
      expect(result).toHaveProperty('Correctness');
      expect(result).toHaveProperty('BusFactor');
      expect(result).toHaveProperty('ResponsiveMaintainer');
      expect(result).toHaveProperty('License');

      // Ensure latencies are measured correctly and included
      expect(result).toHaveProperty('NetScore_Latency');
      expect(result.NetScore_Latency).toBeLessThanOrEqual(totalLatency);
    }
  });

  // Individual Metric Tests with latency measurements
  test('should calculate BusFactor and measure latency', async () => {
    const start = Date.now();
    const result = await metricBusFactor({ owner: 'facebook', name: 'react' });
    const latency = (Date.now() - start) / 1000;

    expect(result).not.toBeNull();
    if (result) {
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(1);
      expect(latency).toBeLessThanOrEqual(5); // Example latency check
    }
  });

  test('should calculate RampUpTime and measure latency', async () => {
    const start = Date.now();
    const result = await metricRampUpTime({ owner: 'facebook', name: 'react' });
    const latency = (Date.now() - start) / 1000;

    expect(result).not.toBeNull();
    if (result) {
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(1);
      expect(latency).toBeLessThanOrEqual(5);
    }
  });

  test('should calculate Correctness and measure latency', async () => {
    const start = Date.now();
    const result = await calculateCAD('./temp-repo'); // Assuming you clone repo locally
    const latency = (Date.now() - start) / 1000;

    expect(result).not.toBeNull();
    if (result) {
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(1);
      expect(latency).toBeLessThanOrEqual(5);
    }
  });

  test('should calculate License Compatibility and measure latency', async () => {
    const start = Date.now();
    const result = await analyzeLicense('./temp-repo'); // Assuming repo is cloned
    const latency = (Date.now() - start) / 1000;

    expect(result).not.toBeNull();
    if (result) {
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(1);
      expect(latency).toBeLessThanOrEqual(5);
    }
  });

  test('should calculate Responsiveness and measure latency', async () => {
    const start = Date.now();
    const result = await metricResponsiveness({ owner: 'facebook', name: 'react' });
    const latency = (Date.now() - start) / 1000;

    expect(result).not.toBeNull();
    if (result) {
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(1);
      expect(latency).toBeLessThanOrEqual(5);
    }
  });

  // Example test for an npm URL
  test('should analyze npm URL and calculate metrics', async () => {
    const startTime = Date.now();
    const result = await analyzeURL(exampleNpmURL);

    // Check if the result is not null
    expect(result).not.toBeNull();

    // If result is not null, then continue checking the properties
    if (result) {
      expect(result.NetScore).toBeGreaterThanOrEqual(0);
      expect(result.NetScore).toBeLessThanOrEqual(1);

      const totalLatency = (Date.now() - startTime) / 1000;
      expect(result.NetScore_Latency).toBeLessThanOrEqual(totalLatency);
    }
  });
});
