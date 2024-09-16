"use strict";
// cli.ts
Object.defineProperty(exports, "__esModule", { value: true });
// Step 1: Import yargs
var yargs_1 = require("yargs");
var helpers_1 = require("yargs/helpers");
// Step 2: Define commands and options
(0, yargs_1.default)((0, helpers_1.hideBin)(process.argv))
    .command('greet [name]', // Command name and positional argument
'Greet the user by name', // Command description
function (yargs) {
    yargs.positional('name', {
        describe: 'Name to greet',
        type: 'string',
        default: 'World'
    });
}, function (argv) {
    // Command handler
    var greeting = "Hello, ".concat(argv.name);
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
