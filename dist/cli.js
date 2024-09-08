"use strict";
// cli.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Step 1: Import yargs
const yargs_1 = __importDefault(require("yargs"));
const helpers_1 = require("yargs/helpers");
// Step 2: Define commands and options
(0, yargs_1.default)((0, helpers_1.hideBin)(process.argv))
    .command('greet [name]', // Command name and positional argument
'Greet the user by name', // Command description
(yargs) => {
    yargs.positional('name', {
        describe: 'Name to greet',
        type: 'string',
        default: 'World'
    });
}, (argv) => {
    // Command handler
    let greeting = `Hello, ${argv.name}`;
    if (argv.exclaim) {
        greeting += '!';
    }
    else {
        greeting += '.';
    }
    console.log(greeting);
})
    .option('exclaim', {
    alias: 'e',
    type: 'boolean',
    description: 'Add an exclamation mark to the greeting'
})
    .help() // Enable help command
    .argv; // Parse the arguments
//compile with
//npx tsc cli.ts
//run with
//node cli.js greet --name=Sam --exclaim
