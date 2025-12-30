/* eslint-disable no-console, n/no-sync */
import { spawnSync } from "node:child_process";

function arg (name, fallback) {
    const hit = process.argv.find((a) => a.startsWith(`--${ name }=`));
    return hit ? hit.split("=").slice(1).join("=") : fallback;
}

const maxErrors = Number(arg("maxErrors", "12"));
const maxWarnings = Number(arg("maxWarnings", "30"));

const configPath = arg("config", ".dependency-cruiser.js");

const res = spawnSync(
    process.platform === "win32" ? "npx.cmd" : "npx",
    [ "depcruise", "--config", configPath, "src", "--include-only", "^src", "--output-type", "json" ],
    { encoding: "utf8" },
);

console.log(Object.keys(res));
console.log(res.status);
if (res.error) {
    console.error(res.error);
    process.exit(2);
}
if (res.status !== 0 && !res.stdout) {
    console.error(res.stderr || "depcruise failed");
    process.exit(res.status || 2);
}

let data = null;
try {
    data = JSON.parse(res.stdout);
} catch (e) {
    console.error("Cannot parse depcruise JSON output");
    console.error(res.stdout);
    process.exit(2);
}
const errors = data?.summary.error;
const warnings = data?.summary.warn;

console.log(`depcruise: errors=${ errors } warnings=${ warnings } (maxErrors=${ maxErrors } maxWarnings=${ maxWarnings })`);

if (errors > maxErrors || warnings > maxWarnings) {
    console.error("depcruise thresholds exceeded");
    process.exit(1);
}
process.exit(0);
