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
const busFactor_1 = require("./metrics/busFactor");
const licenseCompatability_1 = require("./metrics/licenseCompatability");
const correctness_1 = require("./metrics/correctness");
// Delete the existing repository directory if it exists
function cleanDirectory(localPath) {
    if (fs_1.default.existsSync(localPath)) {
        fs_1.default.rmSync(localPath, { recursive: true, force: true }); // Remove the directory
    }
}
// Clone the repository with force checkout
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
                depth: 1, // Shallow clone to get the latest commit only
            });
            console.log(`Repository cloned to ${localPath}`);
        }
        catch (error) {
            console.error(`Failed to clone repository ${gitUrl}:`, error);
            throw error;
        }
    });
}
// Main function to analyze the repository
function analyzeRepo(gitUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        const localPath = path_1.default.join('./temp-repo');
        // Clone the repository
        yield cloneRepository(gitUrl, localPath);
        // Analyze contributors
        const contributorScore = yield (0, busFactor_1.analyzeContributors)(localPath);
        console.log(`Contributor Score: ${contributorScore}`);
        // Analyze license
        const licenseScore = yield (0, licenseCompatability_1.analyzeLicense)(localPath);
        console.log(`License Score: ${licenseScore}`);
        // Calculate Commit Activity Density (CAD)
        const cadScore = yield (0, correctness_1.calculateCAD)(localPath);
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
    });
}
// Example usage
const gitUrl = 'https://github.com/lodash/lodash'; // Replace with the actual URL
analyzeRepo(gitUrl).catch(err => console.error(err));
