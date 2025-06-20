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
console.log("\n📦 Install: npm dependencies...");

// --- Install root dependencies ---
console.log("⚙️  Install: npm root dependencies...");
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
console.log("⚙️  Install: npm submodules dependencies...");
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
console.log("🚀 Running cas-install script from submodules (if existed) ...");
console.log("");
try {
  Shell.run(
    "git",
    [
      "submodule",
      "foreach",
      "--recursive",
      'sh -c "if [ \\"$name\\" = \\"packages/base\\" ]; then echo; fi; if [ -f package.json ] && [ \\"$PWD\\" != \\"$toplevel\\" ] && grep -q \\"cas-install\\" package.json; then npm run cas-install || echo \\"cas-install failed in $name\\"; else echo \\"Skipping $name (root, no package.json, or no cas-install script)\\";  fi; echo "\n";"',
    ],
    { cwd: Paths.base(), stdio: "inherit" }
  );
} catch (err) {
  console.warn(
    "⚠️  Some submodule cas-install runs may have failed:",
    err.message
  );
}
console.log("✅ All submodules processed!");
console.log("");
