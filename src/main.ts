import { metricResponsiveness } from './metrics/responsiveness.js';
import { metricRampUpTime } from './metrics/rampUpTime.js';
import { metricBusFactor } from './metrics/busFactor.js';
import { analyzeLicense } from './metrics/licenseCompatability.js';
import { calculateCAD } from './metrics/correctness.js';
import * as git from 'isomorphic-git';
import fs from 'fs';
import http from 'isomorphic-git/http/node/index.js';
import path from 'path';
import axios from 'axios';
import { logMessage } from '../log.js';

// Main function to execute the metrics and repository analysis
async function analyzeURL(url: string) {
  const originalUrl = url;
  const loc = checkURL(url);
  if (loc === 'npm') {
    const packageName = parseNpmLink(url);
    try {
      url = await getGitHubFromNpmAxios(packageName);
    } catch (error) {
      console.error(error);
      return null; // Indicate failure
    }
  }

  if (loc === 'npm' || loc === 'Run') {
    const { owner, name } = parseGitHubLink(url);
    const variables = { owner, name };

    try {
      // Measure and run metrics
      const responsivenessStartTime = Date.now();
      const responsiveness = await metricResponsiveness(variables);
      const responsivenessLatency = ((Date.now() - responsivenessStartTime) / 1000).toFixed(3);

      const rampUpStartTime = Date.now();
      const rampUpTime = await metricRampUpTime(variables);
      const rampUpLatency = ((Date.now() - rampUpStartTime) / 1000).toFixed(3);

      const busFactorStartTime = Date.now();
      const busFactor = await metricBusFactor(variables);
      const busFactorLatency = ((Date.now() - busFactorStartTime) / 1000).toFixed(3);

      // Analyze repository
      const localPath = path.join('./temp-repo');

      await cloneRepository(url, localPath);

      const licenseScoreStartTime = Date.now();
      const licenseScore = await analyzeLicense(localPath);
      const licenseScoreLatency = ((Date.now() - licenseScoreStartTime) / 1000).toFixed(3);

      const correctnessScoreStartTime = Date.now();
      const cadScore = await calculateCAD(localPath);
      const correctnessScoreLatency = ((Date.now() - correctnessScoreStartTime) / 1000).toFixed(3);

      cleanDirectory(localPath);

      // Define weights for metrics
      let weights = { rampUp: 0.15, correctness: 0.2, busFactor: 0.3, responsiveness: 0.15, license: 0.2 };

      if (rampUpTime === -1) {
        weights.rampUp = 0;
      }
      if (cadScore === -1) {
        weights.correctness = 0;
      }
      if (busFactor === -1) {
        weights.busFactor = 0;
      }
      if (responsiveness === -1) {
        weights.responsiveness = 0;
      }
      if (licenseScore === -1) {
        weights.license = 0;
      }
      const weightSum = weights.busFactor + weights.correctness + weights.rampUp + weights.responsiveness + weights.license;
      weights.rampUp = weights.rampUp / weightSum;
      weights.correctness = weights.correctness / weightSum;
      weights.busFactor = weights.busFactor / weightSum;
      weights.responsiveness = weights.responsiveness / weightSum;
      weights.license = weights.license / weightSum;

      // Calculate overall NetScore
      const netScore =
        (rampUpTime * weights.rampUp) +
        (cadScore * weights.correctness) +
        (busFactor * weights.busFactor) +
        (responsiveness * weights.responsiveness) +
        (licenseScore * weights.license);
      const netScoreLatency = ((Date.now() - responsivenessStartTime) / 1000).toFixed(3);

      // Output as NDJSON
      const output = {
        URL: originalUrl,
        NetScore: netScore.toFixed(3),
        NetScore_Latency: netScoreLatency,
        RampUp: rampUpTime.toFixed(3),
        RampUp_Latency: rampUpLatency,
        Correctness: cadScore.toFixed(3),
        Correctness_Latency: correctnessScoreLatency,
        BusFactor: busFactor.toFixed(3),
        BusFactor_Latency: busFactorLatency,
        ResponsiveMaintainer: responsiveness.toFixed(3),
        ResponsiveMaintainer_Latency: responsivenessLatency,
        License: licenseScore.toFixed(3),
        License_Latency: licenseScoreLatency
      };

      return output;
    } catch (error) {
      console.error('Error during analysis:', error);
      return null; // Indicate failure
    }
  } else {
    console.log('Invalid URL');
    return null; // Indicate failure
  }
}

// Helper functions
function parseGitHubLink(link: string) {
  link = link.replace(/\.git$/, '');
  const match = link.match(/.*github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) {
    throw new Error('Invalid GitHub link');
  }
  return { owner: match[1], name: match[2] };
}

function parseNpmLink(link: string) {
  const match = link.match(/npmjs\.com\/package\/([^\/]+)/);
  if (!match) {
    throw new Error('Invalid npm link');
  }
  return match[1];
}

async function getGitHubFromNpmAxios(packageName: string): Promise<string> {
  return axios.get(`https://registry.npmjs.com/${packageName}`)
    .then(response => {
      let repoUrl = response.data.repository.url;
      repoUrl = repoUrl.replace(/^git\+/, "");
      if (repoUrl) {
        return repoUrl;
      } else {
        return `No GitHub repository link found for package: ${packageName}`;
      }
    })
    .catch(error => {
      return `Error: ${error.message}`;
    });
}

function checkURL(link: string): 'Run' | 'npm' | 'Invalid URL' {
  try {
    const url = new URL(link);
    const hostname = url.hostname.toLowerCase();

    if (hostname.includes('github.com')) {
      return 'Run';
    } else if (hostname.includes('npmjs.com')) {
      return 'npm';
    } else {
      return 'Invalid URL';
    }
  } catch {
    return 'Invalid URL';
  }
}

function cleanDirectory(localPath: string) {
  if (fs.existsSync(localPath)) {
    fs.rmSync(localPath, { recursive: true, force: true });
  }
}

async function cloneRepository(gitUrl: string, localPath: string) {
  cleanDirectory(localPath);

  // Replace ssh protocol with https
  if (gitUrl.startsWith('ssh://')) {
    gitUrl = gitUrl.replace(/^ssh:\/\/git@github.com\//, 'https://github.com/');
  }

  // Replace git protocol with https
  if (gitUrl.startsWith('git://')) {
    gitUrl = gitUrl.replace(/^git:\/\//, 'https://');
  }

  try {
    await git.clone({
      fs,
      http,
      dir: localPath,
      url: gitUrl,
      singleBranch: true,
      depth: 1,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Failed to clone repository ${gitUrl}: ${error.message}`);
    } else {
      console.error(`Failed to clone repository ${gitUrl}:`, error);
    }
    throw error;
  }
}

// Process the URL_FILE and analyze each URL
async function processUrlFile(filePath: string) {
  try {
    if (process.env.GITHUB_TOKEN === undefined) {
      console.error('GitHub token is not defined in environment variables');
      process.exit(1);
    }
    const urls = fs.readFileSync(filePath, 'utf8').split('\n').filter(Boolean);

    for (const url of urls) {
      const result = await analyzeURL(url);
      if (result) {
        console.log(JSON.stringify(result));
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('Error processing URL file:', error);
    process.exit(1);
  }
}

// Check for command-line arguments
const args = process.argv.slice(2);
if (args.length !== 1) {
  console.error('Usage: ./run URL_FILE');
  process.exit(1);
}

const urlFilePath = args[0];
processUrlFile(urlFilePath);
