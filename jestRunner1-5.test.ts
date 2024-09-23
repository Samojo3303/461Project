import { runCommand } from './src/jestRunner';
import { describe, it, expect, afterAll } from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';

describe('Command Line Runner', () => {
  let total = 0;
  let passed = 0;

  it('should return 0 for "./run testURL1.txt"', async () => {
    const { stdout, exitCode } = await runCommand('./run ./testURLs/testURL1.txt');
    expect(exitCode).toBe(0);
    if (exitCode === 0) {
      passed += 1;
    }
    total += 1;
  });

  it('should return 0 for "./run testURL2.txt"', async () => {
    const { stdout, exitCode } = await runCommand('./run ./testURLs/testURL2.txt');
    expect(exitCode).toBe(0);
    if (exitCode === 0) {
      passed += 1;
    }
    total += 1;
  });

  it('should return 0 for "./run testURL3.txt"', async () => {
    const { stdout, exitCode } = await runCommand('./run ./testURLs/testURL3.txt');
    expect(exitCode).toBe(0);
    if (exitCode === 0) {
      passed += 1;
    }
    total += 1;
  });

  it('should return 0 for "./run testURL4.txt"', async () => {
    const { stdout, exitCode } = await runCommand('./run ./testURLs/testURL4.txt');
    expect(exitCode).toBe(0);
    if (exitCode === 0) {
      passed += 1;
    }
    total += 1;
  });

  it('should return 0 for "./run testURL5.txt"', async () => {
    const { stdout, exitCode } = await runCommand('./run ./testURLs/testURL5.txt');
    expect(exitCode).toBe(0);
    if (exitCode === 0) {
      passed += 1;
    }
    total += 1;
  });

  afterAll(() => {
    const filePath = path.join(__dirname, 'testResults.txt');
    const results = `Total ${total} Passed ${passed}\n`;
    fs.appendFileSync(filePath, results, 'utf8');
  });

});
