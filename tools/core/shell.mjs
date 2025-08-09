/**
 * @module shell (./tools/core/shell.mjs)
 * @description Provides methods for interacting with the shell.
 */

import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { Paths } from "./paths.mjs";

export class Shell {
  /**
   * Runs a command in the current shell synchronously and throws an error if the command fails.
   * @param {string} command - The command to run.
   * @param {string[]} args - The arguments to pass to the command.
   * @param {Object} options - The options to pass to execSync (e.g. cwd, env).
   * @returns {string} The stdout output from the command.
   * @throws {Error} If the command exits with a non-zero code.
   */
  static run(command, args = [], options = {}) {
    const fullCommand = [command, ...args].join(" ");
    const { quiet = false, ...execOptions } = options;
    try {
      return execSync(fullCommand, {
        stdio: quiet ? "ignore" : "pipe",
        encoding: quiet ? undefined : "utf8",
        ...execOptions,
      });
    } catch (error) {
      if (quiet) {
        throw new Error(`Command failed: ${fullCommand}`);
      }
      const output = error.stdout?.toString() ?? "";
      const stderr = error.stderr?.toString() ?? "";
      throw new Error(
        `Command failed: ${fullCommand}\n${error.message}\n${stderr || output}`
      );
    }
  }

  /**
   * Runs an npm script for a specific environment using Shell.run.
   * @param {string} script - The npm script to run.
   * @param {string[]} [args=[]] - Additional arguments to append to the script.
   * @param {Object} options - Options object with `env` key and other execSync options.
   */
  static runNodeScript(script, args = [], options = {}) {
    const { env, ...otherOptions } = options;
    if (!env) {
      console.warn("⚠️  No environment specified.");
      return;
    }

    const projectBasePath = Paths.env(env);
    if (!existsSync(projectBasePath)) {
      console.warn(`⚠️  Directory does not exist: ${projectBasePath}`);
      return;
    }
    console.log(`📂 Working directory: ${projectBasePath}`);

    try {
      console.log(`🚀 Executing: npm run ${script} ${args.join(" ")}`);
      return Shell.run("npm", ["run", script, ...args], {
        stdio: "inherit",
        cwd: projectBasePath,
        ...otherOptions,
      });
    } catch (error) {
      console.warn(`⚠️  Failed to execute script: ${error.message}`);
      return null;
    }
  }
}
