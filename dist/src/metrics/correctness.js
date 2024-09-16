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
exports.calculateCAD = calculateCAD;
const git = __importStar(require("isomorphic-git"));
const fs_1 = __importDefault(require("fs"));
// Analyze Commit Activity Density (CAD)
function calculateCAD(localPath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Get commit history
            const log = yield git.log({ fs: fs_1.default, dir: localPath });
            if (log.length === 0) {
                return 0; // No commits, so CAD is 0
            }
            // Get the date of the first and last commit
            const firstCommitDate = new Date(log[log.length - 1].commit.author.timestamp * 1000);
            const lastCommitDate = new Date(log[0].commit.author.timestamp * 1000);
            // Calculate the repository age in days
            const repoAgeInDays = Math.max((lastCommitDate.getTime() - firstCommitDate.getTime()) / (1000 * 60 * 60 * 24), 1); // To avoid division by zero
            // Calculate commits per day
            const commitsPerDay = log.length / repoAgeInDays;
            // Normalize the CAD
            const maxCAD = 5;
            const normalizedCAD = Math.min(commitsPerDay / maxCAD, 1);
            return normalizedCAD;
        }
        catch (error) {
            console.error(`Failed to calculate CAD:`, error);
            throw error;
        }
    });
}
