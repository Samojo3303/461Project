import { metricResponsiveness } from './metrics/responsiveness.js';
import { metricRampUpTime } from './metrics/rampUpTime.js';
import { analyzeContributors } from './metrics/busFactor.js';
import { analyzeLicense } from './metrics/licenseCompatability.js';
import { calculateCAD } from './metrics/correctness.js';
import * as git from 'isomorphic-git';
import fs from 'fs';
import http from 'isomorphic-git/http/node/index.js';
import path from 'path';
import { exec } from 'child_process';
// URL to analyze
let url = 'https://github.com/lodash/lodash';
// Check the type of URL (npm or GitHub)
let loc = checkURL(url);
if (loc == 'npm') {
    const packageName = parseNpmLink(url);
    await getGitHubFromNpm(packageName)
        .then(repoUrl => {
        url = repoUrl;
        loc = 'Run';
    })
        .catch(error => console.error(error));
}
if (loc == 'npm' || loc == 'Run') {
    const { owner, name } = parseGitHubLink(url);
    const variables = {
        owner, name
    };
    // Run metrics
    const responsiveness = await metricResponsiveness(variables);
    const rampUpTime = await metricRampUpTime(variables);
    console.log('-----------');
    console.log(`Responsiveness: ${responsiveness.toFixed(2)}`);
    console.log(`Ramp-up time: ${rampUpTime.toFixed(2)}`);
    console.log('-----------');
    // Analyze repository
    await analyzeRepo(url);
}
else {
    console.log('Invalid URL');
}
// Helper functions
function parseGitHubLink(link) {
    link = link.replace(/\.git$/, '');
    const match = link.match(/.*github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) {
        throw new Error('Invalid GitHub link');
    }
    return { owner: match[1], name: match[2] };
}
function parseNpmLink(link) {
    const match = link.match(/npmjs\.com\/package\/([^\/]+)/);
    if (!match) {
        throw new Error('Invalid npm link');
    }
    return match[1];
}
async function getGitHubFromNpm(packageName) {
    return new Promise((resolve, reject) => {
        exec(`npm view ${packageName} repository.url`, (error, stdout, stderr) => {
            if (error) {
                reject(`Error: ${error.message}`);
                return;
            }
            if (stderr) {
                reject(`Error: ${stderr}`);
                return;
            }
            const repoUrl = stdout.trim();
            if (repoUrl) {
                resolve(repoUrl);
            }
            else {
                resolve(`No GitHub repository link found for package: ${packageName}`);
            }
        });
    });
}
function checkURL(link) {
    try {
        const url = new URL(link);
        const hostname = url.hostname.toLowerCase();
        if (hostname.includes('github.com')) {
            return 'Run';
        }
        else if (hostname.includes('npmjs.com')) {
            return 'npm';
        }
        else {
            return 'Unknown Source';
        }
    }
    catch (error) {
        return 'Invalid URL';
    }
}
// Repository analysis functions
async function analyzeRepo(gitUrl) {
    const localPath = path.join('./temp-repo');
    // Clone the repository
    await cloneRepository(gitUrl, localPath);
    // Analyze contributors
    const contributorScore = await analyzeContributors(localPath);
    console.log(`Contributor Score: ${contributorScore}`);
    // Analyze license
    const licenseScore = await analyzeLicense(localPath);
    console.log(`License Score: ${licenseScore}`);
    // Calculate Commit Activity Density (CAD)
    const cadScore = await calculateCAD(localPath);
    console.log(`Commit Activity Density (CAD) Score: ${cadScore.toFixed(2)}`);
    // Clean up the repository after analysis
    cleanDirectory(localPath);
    // Weights for each factor in the correctness score
    const weights = { contributor: 0.3, license: 0.3, cad: 0.4 };
    // Calculate overall correctness score
    const correctnessScore = (contributorScore * weights.contributor) +
        (licenseScore * weights.license) +
        (cadScore * weights.cad);
    console.log(`Overall Correctness Score: ${correctnessScore.toFixed(2)} (0 = low, 1 = high)`);
}
function cleanDirectory(localPath) {
    if (fs.existsSync(localPath)) {
        fs.rmSync(localPath, { recursive: true, force: true });
    }
}
async function cloneRepository(gitUrl, localPath) {
    cleanDirectory(localPath);
    try {
        await git.clone({
            fs,
            http,
            dir: localPath,
            url: gitUrl,
            singleBranch: true,
            depth: 1,
        });
        console.log(`Repository cloned to ${localPath}`);
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(`Failed to clone repository ${gitUrl}: ${error.message}`);
        }
        else {
            console.error(`Failed to clone repository ${gitUrl}:`, error);
        }
        throw error;
    }
}
