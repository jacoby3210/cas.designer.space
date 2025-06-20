/**
 * @module init (./tools/scripts/init.mjs)
 * @description Initialize a project by installing dependencies in root and all submodules.
 * Includes Git submodule initialization and updates as specified in README.
 */

import { Paths } from "../core/paths.mjs";
import { Shell } from "../core/shell.mjs";

// --- Git Submodule Setup (from README "How to start" section) ---
console.log("🔄 Initializing and updating Git submodules...");
console.log("");

try {
  console.log("⚙️  Running: git submodule update --init --recursive");
  Shell.run("git", ["submodule", "update", "--init", "--recursive"], {
    cwd: Paths.base(),
    stdio: "inherit",
  });
  console.log("");
} catch (err) {
  console.error("❌ Error initializing submodules:", err.message);
  process.exit(1);
}

try {
  console.log("⚙️  Running: git submodule update --recursive --remote");
  Shell.run("git", ["submodule", "update", "--recursive", "--remote"], {
    cwd: Paths.base(),
    stdio: "inherit",
  });
} catch (err) {
  console.error("❌ Error updating submodules:", err.message);
  process.exit(1);
}

// --- NPM Dependencies Installation ---
console.log("\n📦 Installing NPM dependencies...");

// --- Install root dependencies ---
console.log("⚙️  Installing NPM root dependencies...");
try {
  Shell.run("npm", ["install"], {
    cwd: Paths.base(),
    quiet: true,
  });
} catch (err) {
  console.error("❌ Error installing root dependencies:", err.message);
  process.exit(1);
}

// --- Install dependencies in all submodules ---
console.log("⚙️  Installing NPM dependencies in all submodules...");
try {
  Shell.run(
    "git",
    [
      "submodule",
      "foreach",
      "--recursive",
      'npm install || echo "npm install failed in $name"',
    ],
    {
      cwd: Paths.base(),
      quiet: true,
    }
  );
} catch (err) {
  console.warn(
    "⚠️  Some submodule installations may have failed:",
    err.message
  );
}
console.log("");

// --- Run cas-install in supported submodules ---
console.log("🚀 Running cas-install in supported submodules...");
try {
  Shell.run(
    "git",
    [
      "submodule",
      "foreach",
      "--recursive",
      "node -e \"try{const pkg=require('./package.json');if(pkg.scripts && pkg.scripts['cas-install']){require('child_process').execSync('npm run cas-install',{stdio:'inherit'});}else{console.log('ℹ️  cas-install not defined in $name');}}catch(e){console.log('⚠️  No package.json in $name');}\"",
    ],
    {
      cwd: Paths.base(),
      stdio: "inherit",
    }
  );
} catch (err) {
  console.warn(
    "⚠️  Some submodule cas-install runs may have failed:",
    err.message
  );
}
console.log("");

console.log("✅ All submodules processed!");
console.log("");
