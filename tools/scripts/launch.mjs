/**
 * @module launch (./tools/scripts/launch.mjs)
 * @description Launch specified script from selected deploy with selected root package.
 */

import { config } from "dotenv";
import { resolve } from "node:path";

import { parseArguments } from "../core/args.mjs";
import { Paths } from "../core/paths.mjs";
import { Shell } from "../core/shell.mjs";
import { Utils } from "../core/utils.mjs";

// Clear the console for better readability.
process.stdout.write("\x1Bc");

// Display a welcome message.
console.log("🚀 Welcome to the CAS Foundation Launch Script!\n");

// Getting the path to the root directory of the project.

// 1. Load the config file
const path = resolve(Paths.base(), "tools", "config", "current.cfg");
const result = config({ path });
if (!result || result.error) {
  console.warn(`⚠️ Failed to load config file from ${path}`);
  process.exit(1);
}

const cfg = result.parsed;

console.log(`🔧 Configuration file loaded successfully (from ${path})`);
if (cfg.APP_NAME) console.log(`📱 App Name: ${cfg.APP_NAME}`);
if (cfg.APP_VERSION) console.log(`🔖 Version: ${cfg.VERSION}`);

// 2. Main function to parse arguments and run the script
async function main() {
  const args = parseArguments();
  if (!args) process.exit(1);
  if (args.help) return Utils.showHelp();
  if (args.verbose) {
    console.log("\n🛠️  Full parsed arguments:");
    console.log(JSON.stringify(args, null, 2));
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  }

  const env = Utils.getLaunchOptionInfo(args, cfg, "environment", false);
  const pkg = Utils.getLaunchOptionInfo(args, cfg, "package", "Not specified");
  const script = Utils.getLaunchOptionInfo(args, cfg, "script", "start.mjs");
  const verbose = Utils.getLaunchOptionInfo(args, cfg, "verbose", false);

  console.log("\n🌍 Environment Info:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`📁 Dir: ${process.cwd()}`);
  console.log(`⚙️  Node Version: ${process.version}`);
  console.log(`🔧 Platform: ${process.platform}\n`);

  console.log("📋 Parsed Arguments:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`🎯 Environment:  ${env.value} (from ${env.source})`);
  console.log(`📦 Package:      ${pkg.value} (from ${pkg.source})`);
  console.log(`⚡ Script:       ${script.value} (from ${script.source})`);
  console.log(`🔍 Verbose:      ${verbose.value} (from ${verbose.source})\n`);

  const options =
    env.value === "all" ? await Utils.getEnvironmentOptionList() : [env.value];
  if (options.length === 0) {
    console.error("❌ No found available environments!");
    process.exit(1);
  }
  for (const option of options)
    Shell.runNodeScript(script.value, [], { env: option });

  console.log("✨ Launch script completed successfully!\n");
}

main();
