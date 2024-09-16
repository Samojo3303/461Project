import fs from 'fs';
import path from 'path';
// Utility function to check if a license is compatible with LGPLv2.1
export function isLicenseCompatibleWithLGPLv21(licenseText) {
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
export async function analyzeLicense(localPath) {
    const licenseFilePath = path.join(localPath, 'LICENSE');
    const readmeFilePath = path.join(localPath, 'README.md');
    let licenseText = null;
    try {
        // Check if LICENSE file exists
        if (fs.existsSync(licenseFilePath)) {
            licenseText = fs.readFileSync(licenseFilePath, 'utf8');
        }
        // If not, check for license section in README.md
        else if (fs.existsSync(readmeFilePath)) {
            const readmeContent = fs.readFileSync(readmeFilePath, 'utf8');
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
}
