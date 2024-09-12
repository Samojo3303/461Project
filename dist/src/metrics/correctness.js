"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const git = __importStar(require("isomorphic-git"));
const fs_1 = __importDefault(require("fs"));
const node_1 = __importDefault(require("isomorphic-git/http/node"));
const path_1 = __importDefault(require("path"));
// Function to delete the existing repository directory if it exists
function cleanDirectory(localPath) {
    if (fs_1.default.existsSync(localPath)) {
        fs_1.default.rmSync(localPath, { recursive: true, force: true }); // Remove the directory
    }
}
// Function to clone the repository with force checkout
function cloneRepository(gitUrl, localPath) {
    return __awaiter(this, void 0, void 0, function* () {
        cleanDirectory(localPath);
        try {
            yield git.clone({
                fs: fs_1.default,
                http: node_1.default,
                dir: localPath,
                url: gitUrl,
                singleBranch: true,
                depth: 1, // Shallow clone to get latest commit only
            });
            console.log(`Repository cloned to ${localPath}`);
        }
        catch (error) {
            console.error(`Failed to clone repository ${gitUrl}:`, error);
            throw error;
        }
    });
}
// Analyzing various factors of the repository
function analyzeRepoData(localPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const repoData = {};
        try {
            // Analyze commit history
            const log = yield git.log({ fs: fs_1.default, dir: localPath, depth: 100 });
            console.log('Git Log:', log); // Debug statement
            const validCommits = log.filter(entry => entry.commit.message.length > 10).length;
            repoData.commitHistoryScore = log.length > 0 ? validCommits / log.length : 0;
            // Analyze contributor activity (bus factor)
            const contributors = new Set(log.map(entry => entry.commit.author.name));
            repoData.contributorScore = contributors.size > 5 ? 1 : contributors.size / 5;
            // Analyze if tests exist (looking for test files or scripts in package.json)
            const packageJsonPath = path_1.default.join(localPath, 'package.json');
            if (fs_1.default.existsSync(packageJsonPath)) {
                const packageJson = JSON.parse(fs_1.default.readFileSync(packageJsonPath, 'utf8'));
                if (packageJson.scripts && packageJson.scripts.test) {
                    repoData.testSuiteScore = 1; // Test suite exists
                }
                else {
                    repoData.testSuiteScore = 0; // No test suite
                }
            }
            else {
                repoData.testSuiteScore = 0;
            }
            // Analyze license compatibility
            const licenseFilePath = path_1.default.join(localPath, 'LICENSE');
            repoData.licenseScore = fs_1.default.existsSync(licenseFilePath) ? 1 : 0;
        }
        catch (error) {
            console.error(`Failed to analyze repository data at ${localPath}:`, error);
            throw error;
        }
        return repoData;
    });
}
// Function to calculate the aggregate correctness score
function calculateCorrectnessScore(gitUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        const localPath = path_1.default.join('./temp-repo');
        // Clone the repo
        yield cloneRepository(gitUrl, localPath);
        // Analyze the repo data
        const repoData = yield analyzeRepoData(localPath);
        // Calculate the correctness score based on multiple factors
        const weights = {
            commitHistory: 0.4,
            contributor: 0.2,
            testSuite: 0.2,
            license: 0.2,
        };
        const correctnessScore = (repoData.commitHistoryScore * weights.commitHistory) +
            (repoData.contributorScore * weights.contributor) +
            (repoData.testSuiteScore * weights.testSuite) +
            (repoData.licenseScore * weights.license);
        console.log(`Correctness score: ${correctnessScore.toFixed(2)} (0 = low, 1 = high)`);
        // Output detailed repo data
        console.log('Repository Data:', repoData);
        // Clean up the repository after analysis
        cleanDirectory(localPath);
    });
}
// Example usage
const gitUrl = 'https://github.com/github-packages-examples/ghcr-publish'; // Replace with actual URL
calculateCorrectnessScore(gitUrl).catch(err => console.error(err));
