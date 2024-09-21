// Mocking GitHubClient since it's required in the metric file but we don't need it for this test
jest.mock('../src/githubClient.ts', () => ({
    GitHubClient: jest.fn().mockImplementation(() => ({
        someMethod: jest.fn(),
    })),
}));
import fs from 'fs';
import path from 'path';
import { metricBusFactor } from '../src/metrics/busFactor';
import { calculateCAD } from '../src/metrics/correctness';
import { metricResponsiveness } from '../src/metrics/responsiveness';
import { metricRampUpTime } from '../src/metrics/rampUpTime';
import { analyzeLicense } from '../src/metrics/licenseCompatability';
import { parseUrl } from '../src/parseUrl'; // Utility function to parse URLs
jest.mock('../src/metrics/licenseCompatability', () => ({
    analyzeLicense: jest.fn().mockReturnValue(1), // Mock it to return 1 for testing purposes
}));
jest.mock('../src/metrics/correctness', () => ({
    metricCorrectness: jest.fn().mockReturnValue(1), // Mock it to return 1 for testing purposes
}));
const filePath = path.join(__dirname, '../testUrl.txt');
const fileContent = fs.readFileSync(filePath, 'utf-8').trim().split('\n');
let passedTests = 0;
let totalTests = 0;
let passedURLs = 0;
const totalURLs = fileContent.length;
const urlsPassed = [];
function mapExpectedValue(expected) {
    switch (expected.toLowerCase()) {
        case 'high': return [0.7, 1];
        case 'medium': return [0.4, 0.7];
        case 'low': return [0.1, 0.4];
        case 'stable': return [0.6, 0.8];
        case 'good': return [0.7, 0.9];
        case 'moderate': return [0.5, 0.7];
        case 'compatible': return [0.8, 1];
        default: return [0, 1];
    }
}
function isInRange(actual, expectedRange) {
    return actual >= expectedRange[0] && actual <= expectedRange[1];
}
fileContent.forEach(async (line) => {
    if (line.trim() === '')
        return;
    const [url, metricsStr] = line.split(':');
    const metrics = metricsStr.split(',').reduce((acc, metricStr) => {
        const [key, value] = metricStr.split('=').map(s => s.trim());
        acc[key] = value;
        return acc;
    }, {});
    const { owner, repo } = parseUrl(url.trim());
    let urlPassedAllTests = true;
    describe(`Testing metrics for ${url}`, () => {
        totalTests += 5;
        test(`Bus Factor for ${url}`, async () => {
            const actualBusFactor = await metricBusFactor({ owner, name: repo });
            const expectedRange = mapExpectedValue(metrics.BusFactor);
            if (isInRange(actualBusFactor, expectedRange)) {
                passedTests += 1;
            }
            else {
                urlPassedAllTests = false;
            }
            expect(isInRange(actualBusFactor, expectedRange)).toBe(true);
        });
        test(`Correctness for ${url}`, async () => {
            const actualCorrectness = await calculateCAD('somePath');
            const expectedRange = mapExpectedValue(metrics.Correctness);
            if (isInRange(actualCorrectness, expectedRange)) {
                passedTests += 1;
            }
            else {
                urlPassedAllTests = false;
            }
            expect(isInRange(actualCorrectness, expectedRange)).toBe(true);
        });
        test(`Responsiveness for ${url}`, async () => {
            const actualResponsiveness = await metricResponsiveness({ owner, name: repo });
            const expectedRange = mapExpectedValue(metrics.Responsiveness);
            if (isInRange(actualResponsiveness, expectedRange)) {
                passedTests += 1;
            }
            else {
                urlPassedAllTests = false;
            }
            expect(isInRange(actualResponsiveness, expectedRange)).toBe(true);
        });
        test(`Ramp-Up Time for ${url}`, async () => {
            const actualRampUpTime = await metricRampUpTime({ owner, name: repo });
            const expectedRange = mapExpectedValue(metrics.RampUp);
            if (isInRange(actualRampUpTime, expectedRange)) {
                passedTests += 1;
            }
            else {
                urlPassedAllTests = false;
            }
            expect(isInRange(actualRampUpTime, expectedRange)).toBe(true);
        });
        test(`License Compatibility for ${url}`, async () => {
            const actualLicense = await analyzeLicense('somePath');
            const expectedRange = mapExpectedValue(metrics.License);
            if (isInRange(actualLicense, expectedRange)) {
                passedTests += 1;
            }
            else {
                urlPassedAllTests = false;
            }
            expect(isInRange(actualLicense, expectedRange)).toBe(true);
        });
        afterAll(() => {
            if (urlPassedAllTests) {
                passedURLs += 1;
                urlsPassed.push(url.trim());
            }
        });
    });
});
// Output the result at the end
afterAll(() => {
    console.log(`\nTest Summary: ${passedTests} out of ${totalTests} test cases passed.`);
    console.log(`${passedURLs} out of ${totalURLs} URLs passed all tests.`);
    console.log(`Passed URLs:`);
    urlsPassed.forEach(url => console.log(url));
});
