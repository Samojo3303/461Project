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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isLicenseCompatibleWithLGPLv21 = isLicenseCompatibleWithLGPLv21;
exports.analyzeLicense = analyzeLicense;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Utility function to check if a license is compatible with LGPLv2.1
function isLicenseCompatibleWithLGPLv21(licenseText) {
    const compatibleLicenses = [
        'LGPL-2.1',
        'LGPL-2.1-only',
        'LGPL-2.1-or-later',
        'MIT',
        'BSD-3-Clause',
        'BSD-2-Clause',
        'Apache-2.0',
        'GPL-2.0-or-later',
        'GPL-3.0-or-later'
    ];
    return compatibleLicenses.some((license) => licenseText.includes(license));
}
// Extract license from README using regex
function extractLicenseFromReadme(readmeContent) {
    const licenseRegex = /##\s*License\s*\n+([^#]+)/i;
    const match = readmeContent.match(licenseRegex);
    return match ? match[1].trim() : null;
}
// Analyze the license for compatibility with LGPLv2.1
function analyzeLicense(localPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const licenseFilePath = path_1.default.join(localPath, 'LICENSE');
        const readmeFilePath = path_1.default.join(localPath, 'README.md');
        let licenseText = null;
        try {
            // Check if LICENSE file exists
            if (fs_1.default.existsSync(licenseFilePath)) {
                licenseText = fs_1.default.readFileSync(licenseFilePath, 'utf8');
            }
            // If not, check for license section in README.md
            else if (fs_1.default.existsSync(readmeFilePath)) {
                const readmeContent = fs_1.default.readFileSync(readmeFilePath, 'utf8');
                licenseText = extractLicenseFromReadme(readmeContent);
            }
            // Determine if the license is compatible with LGPLv2.1
            if (licenseText && isLicenseCompatibleWithLGPLv21(licenseText)) {
                return 1; // License is compatible
            }
            else {
                return 0; // License is incompatible or not found
            }
        }
        catch (error) {
            console.error(`Failed to analyze license at ${localPath}:`, error);
            throw error;
        }
    });
}
