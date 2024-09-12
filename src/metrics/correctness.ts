import * as git from 'isomorphic-git';
import fs from 'fs';
import http from 'isomorphic-git/http/node';
import path from 'path';

// Delete the existing repository directory if it exists
function cleanDirectory(localPath: string): void {
  if (fs.existsSync(localPath)) {
    fs.rmSync(localPath, { recursive: true, force: true }); // Remove the directory
  }
}

// Clone the repository with force checkout
async function cloneRepository(gitUrl: string, localPath: string): Promise<void> {
  cleanDirectory(localPath);
  try {
    await git.clone({
      fs,
      http,
      dir: localPath,
      url: gitUrl,
      singleBranch: true,
      depth: 1, // Shallow clone to get latest commit only
    });
    console.log(`Repository cloned to ${localPath}`);
  } catch (error) {
    console.error(`Failed to clone repository ${gitUrl}:`, error);
    throw error;
  }
}

// Analyze various factors of the repository
async function analyzeRepoData(localPath: string) {
  const repoData: any = {};

  try {
    // Analyze commit history
    const log = await git.log({ fs, dir: localPath, depth: 100 });
    console.log('Git Log:', log); // Debug statement
    const validCommits = log.filter(entry => entry.commit.message.length > 10).length;
    repoData.commitHistoryScore = log.length > 0 ? validCommits / log.length : 0;

    // Analyze contributor activity (bus factor)
    const contributors = new Set(log.map(entry => entry.commit.author.name));
    repoData.contributorScore = contributors.size > 5 ? 1 : contributors.size / 5;

    // Analyze if tests exist (looking for test files or scripts in package.json)
    const packageJsonPath = path.join(localPath, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      if (packageJson.scripts && packageJson.scripts.test) {
        repoData.testSuiteScore = 1; // Test suite exists
      } else {
        repoData.testSuiteScore = 0; // No test suite
      }
    } else {
      repoData.testSuiteScore = 0;
    }

    // Analyze license compatibility
    const licenseFilePath = path.join(localPath, 'LICENSE');
    repoData.licenseScore = fs.existsSync(licenseFilePath) ? 1 : 0;

  } catch (error) {
    console.error(`Failed to analyze repository data at ${localPath}:`, error);
    throw error;
  }

  return repoData;
}

// Calculate the aggregate correctness score
async function calculateCorrectnessScore(gitUrl: string): Promise<void> {
  const localPath = path.join('./temp-repo');

  // Clone the repo
  await cloneRepository(gitUrl, localPath);

  // Analyze the repo data
  const repoData = await analyzeRepoData(localPath);

  // Calculate the correctness score based on multiple factors
  const weights = {
    commitHistory: 0.4,
    contributor: 0.2,
    testSuite: 0.2,
    license: 0.2,
  };

  const correctnessScore =
    (repoData.commitHistoryScore * weights.commitHistory) +
    (repoData.contributorScore * weights.contributor) +
    (repoData.testSuiteScore * weights.testSuite) +
    (repoData.licenseScore * weights.license);

  console.log(`Correctness score: ${correctnessScore.toFixed(2)} (0 = low, 1 = high)`);

  // Output detailed repo data
  console.log('Repository Data:', repoData);

  // Clean up the repository after analysis
  cleanDirectory(localPath);
}

// Example
const gitUrl = 'https://github.com/github-packages-examples/ghcr-publish'; // Replace with actual URL
calculateCorrectnessScore(gitUrl).catch(err => console.error(err));