"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var git = require("isomorphic-git");
var fs = require("fs");
var http = require("isomorphic-git/http/node"); // For HTTP cloning
// Clone a repository
function cloneRepository(repoUrl, dir) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, git.clone({
                        fs: fs,
                        http: http,
                        dir: dir,
                        url: repoUrl,
                        singleBranch: true,
                        depth: 1 // Only clone the latest commit for testing
                    })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
// Example: Clone a repository from GitHub
cloneRepository('https://github.com/cloudinary/cloudinary_npm', './repo').then(function () {
    console.log('Repository cloned');
});
// Read the latest commit
function checkLatestCommit(dir) {
    return __awaiter(this, void 0, void 0, function () {
        var latestCommit;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, git.log({ fs: fs, dir: dir, depth: 1 })];
                case 1:
                    latestCommit = _a.sent();
                    console.log('Latest commit: ', latestCommit);
                    return [2 /*return*/];
            }
        });
    });
}
// Example: Get the latest commit from the cloned repository
checkLatestCommit('./repo');
function checkTags(dir) {
    return __awaiter(this, void 0, void 0, function () {
        var tags;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, git.listTags({ fs: fs, dir: dir })];
                case 1:
                    tags = _a.sent();
                    console.log('Tags: ', tags);
                    if (!tags.length) {
                        console.warn('No tags found! This could indicate the repository lacks proper versioning.');
                    }
                    return [2 /*return*/];
            }
        });
    });
}
// Check size of the repository by scanning files
function checkRepoSize(dir) {
    var files = fs.readdirSync(dir, { withFileTypes: true });
    var totalSize = 0;
    files.forEach(function (file) {
        if (file.isFile()) {
            var fileSize = fs.statSync("".concat(dir, "/").concat(file.name)).size;
            totalSize += fileSize;
        }
    });
    console.log('Repository size:', totalSize, 'bytes');
    // Add logic to warn if the repo size exceeds a certain threshold
    if (totalSize > 50 * 1024 * 1024) { // 50 MB as a threshold example
        console.warn('Repository size exceeds recommended limit.');
    }
}
function checkBranches(dir) {
    return __awaiter(this, void 0, void 0, function () {
        var branches;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, git.listBranches({ fs: fs, dir: dir })];
                case 1:
                    branches = _a.sent();
                    console.log('Branches: ', branches);
                    if (!branches.includes('main') && !branches.includes('master')) {
                        console.warn('Main branch is missing or has an unusual name');
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function checkCommitMessages(dir) {
    return __awaiter(this, void 0, void 0, function () {
        var commits;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, git.log({ fs: fs, dir: dir, depth: 10 })];
                case 1:
                    commits = _a.sent();
                    commits.forEach(function (commit) {
                        if (commit.commit.message.includes('test') || commit.commit.message.includes('lint')) {
                            console.log("Commit \"".concat(commit.oid, "\" mentions testing or linting"));
                        }
                    });
                    return [2 /*return*/];
            }
        });
    });
}
function calculateCorrectnessScore(repoUrl, dir) {
    return __awaiter(this, void 0, void 0, function () {
        var correctnessScore;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: 
                // Clone the repository
                return [4 /*yield*/, cloneRepository(repoUrl, dir)];
                case 1:
                    // Clone the repository
                    _a.sent();
                    // Run all the checks
                    return [4 /*yield*/, checkLatestCommit(dir)];
                case 2:
                    // Run all the checks
                    _a.sent();
                    return [4 /*yield*/, checkTags(dir)];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, checkBranches(dir)];
                case 4:
                    _a.sent();
                    checkRepoSize(dir);
                    return [4 /*yield*/, checkCommitMessages(dir)];
                case 5:
                    _a.sent();
                    correctnessScore = 0.8;
                    return [2 /*return*/, correctnessScore];
            }
        });
    });
}
// Example usage
calculateCorrectnessScore('https://github.com/cloudinary/cloudinary_npm', './repo').then(function (score) {
    console.log('Correctness Score:', score);
});
