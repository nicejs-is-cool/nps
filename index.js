#!/usr/bin/env node
const fs = require('fs');
const ansi = require('ansi')(process.stdout);
const {spawn} = require('child_process');

function infoLog(text) {
    return ansi.write('nps ').cyan().write("INFO ").reset().write(`${text}\n`);
}
function errorLog(text) {
    return ansi.write('nps ').brightRed().write("ERR! ").reset().write(`${text}\n`);
}

const argv = process.argv.slice(2);

if (!argv[0] || argv[0] === "-h" || argv[0] === "--help") {
    infoLog(`Usage:
nps <script> [arguments]
You can access arguments from the script using $<index> example:
If you run "nps hello world!"
And your script has:
echo "Hello $1"
It will output "Hello world!"
You can also use $* to get all the arguments.`);
    process.exit(0)
}

infoLog("Looking for package.json in the current directory...")

if (!fs.existsSync("./package.json")) {
    errorLog("Could not find a package.json in the current directory.")
    process.exit(1)
}

let script = argv[0];
infoLog(`Script Name: ${script}`);
infoLog(`Script Arguments: ${argv.join(', ')}`);
infoLog(`System Platform: ${process.platform}`)

let pkg = JSON.parse(fs.readFileSync("./package.json",{encoding: 'utf-8'}));
let scripts = pkg.scripts;
let count = Object.keys(scripts).length;

infoLog(`Found ${count} scripts in the package.json file.`);

infoLog(`Looking for "${script}" script in package.json...`)

if (!scripts[script]) {
    errorLog(`The specified script(${script}) doesn't exist in the current folder.`);
    process.exit(1)
}

let rscript = scripts[script];
for (let i = 0; i < argv.length; i++) {
    rscript = rscript.replace(new RegExp(`\\$${i}`,"g"),argv[i]);
}
rscript = rscript.replace(/\$\*/g,argv.join(' ').slice(1))

if (rscript.includes("\n")) {
    errorLog("Error: New lines(LF or CRLF) are not allowed in scripts.");
    process.exit(1);
}

infoLog(`Running script ${script}...`);

if (process.platform === "win32") {
    console.log(`> ${pkg.name}@${pkg.version} ${script}\n> ${rscript}`)
    let proc = spawn("cmd.exe",["/c",rscript],{stdio: 'inherit'});
    proc.on('exit',(code) => {
        if (code === 1) {
            errorLog(`The script ${script} failed to run.`);
            errorLog(`Status code: ${code}`);
            return errorLog("This is most likely a issue with the script itself.");
        }
        infoLog(`Script exited with status code: ${code}`)
    })
} else {
    console.log(`> ${pkg.name}@${pkg.version} ${script}\n> ${rscript}`)
    let proc = spawn("bash",["-c",rscript],{stdio: 'inherit'});
    proc.on('exit',(code) => {
        if (code !== 0) {
            errorLog(`The script ${script} failed to run.`);
            errorLog(`Status code: ${code}`);
            return errorLog("This is most likely a issue with the script itself.");
        }
        infoLog(`Script exited with status code: ${code}`)
    })
}