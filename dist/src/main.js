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
// Main function to execute the metrics and repository analysis
async function main(url) {
    const originalUrl = url;
    const loc = checkURL(url);
    if (loc === 'npm') {
        const packageName = parseNpmLink(url);
        try {
            url = await getGitHubFromNpm(packageName);
        }
        catch (error) {
            console.error(error);
            process.exit(1);
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
            // Analyze repository
            const repoStartTime = Date.now();
            const results = await analyzeRepo(url);
            const repoLatency = ((Date.now() - repoStartTime) / 1000).toFixed(3);
            const { contributorScore, licenseScore, cadScore } = results;
            // Define weights for correctness metrics
            const weights = { contributor: 0.3, license: 0.3, cad: 0.4 };
            // Calculate overall NetScore
            const netScore = (contributorScore * weights.contributor) +
                (licenseScore * weights.license) +
                (cadScore * weights.cad);
            const netScoreLatency = ((Date.now() - responsivenessStartTime) / 1000).toFixed(3);
            // Output as NDJSON
            const output = {
                URL: originalUrl,
                NetScore: netScore.toFixed(3),
                NetScore_Latency: netScoreLatency,
                RampUp: rampUpTime.toFixed(3),
                RampUp_Latency: rampUpLatency,
                Correctness: netScore.toFixed(3),
                Correctness_Latency: netScoreLatency,
                BusFactor: contributorScore.toFixed(3),
                BusFactor_Latency: repoLatency,
                ResponsiveMaintainer: responsiveness.toFixed(3),
                ResponsiveMaintainer_Latency: responsivenessLatency,
                License: licenseScore.toFixed(3),
                License_Latency: repoLatency
            };
            console.log(JSON.stringify(output));
            process.exit(0);
        }
        catch (error) {
            console.error('Error during analysis:', error);
            process.exit(1);
        }
    }
    else {
        console.log('Invalid URL');
        process.exit(1);
    }
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
            let repoUrl = stdout.trim();
            // Normalize the URL to use https protocol
            repoUrl = repoUrl.replace(/^git\+/, '');
            if (repoUrl) {
                resolve(repoUrl);
            }
            else {
                reject(`No GitHub repository link found for package: ${packageName}`);
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
            return 'Invalid URL';
        }
    }
    catch {
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
    // Analyze license
    const licenseScore = await analyzeLicense(localPath);
    // Calculate Commit Activity Density (CAD)
    const cadScore = await calculateCAD(localPath);
    // Clean up the repository after analysis
    cleanDirectory(localPath);
    return { contributorScore, licenseScore, cadScore };
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
// Execute main function with the URL to analyze
const urlToAnalyze = 'https://www.npmjs.com/package/express';
main(urlToAnalyze);
