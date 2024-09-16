// cli.ts

// Step 1: Import yargs and other dependencies
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
//import { calculateModuleScore } from './moduleEvaluator'; // Hypothetical module for evaluating scores

import { calculateRampUp } from './metrics/metricRampUpTime';
import { calculateCorrectness } from './metrics/correctness';
import { calculateBusFactor } from './metrics/busFactor';
import { calculateResponsiveness } from './metrics/metricResponsiveness';
import { calculateLicenseCompatibility } from './metrics/licenseCompatability';



// Step 2: Define the CLI commands and options
yargs(hideBin(process.argv))
    .command(
        'evaluate [url]', // Evaluate command
        'Evaluate a module from a given URL',
        (yargs) => {
            yargs.positional('url', {
                describe: 'The URL of the module to evaluate',
                type: 'string',
                demandOption: true
            });
        },
        async (argv) => {
            // Step 3: Call each metric function to calculate scores
            const rampUpScore = await calculateRampUp(argv.url);
            const correctnessScore = await calculateCorrectness(argv.url);
            const busFactorScore = await calculateBusFactor(argv.url);
            const responsivenessScore = await calculateResponsiveness(argv.url);
            const licenseCompatibilityScore = await calculateLicenseCompatibility(argv.url);

            // Step 4: Combine the results into a final object
            const result = {
                URL: argv.url,
                NetScore: (rampUpScore + correctnessScore + busFactorScore + responsivenessScore + licenseCompatibilityScore) / 5, // Simple average
                RampUp: rampUpScore,
                Correctness: correctnessScore,
                BusFactor: busFactorScore,
                Responsiveness: responsivenessScore,
                LicenseCompatibility: licenseCompatibilityScore
            };

            // Step 5: Output the result in JSON format
            console.log(JSON.stringify(result, null, 2));
        }
    )
    .help()
    .argv;

// compile with
// npx tsc cli.ts

// run with
// node cli.js evaluate --url=https://github.com/user/repo