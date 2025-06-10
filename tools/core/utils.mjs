/**
 * @module utils (./tools/main/utils.mjs)
 * @description Utility functions for working with dev tools.
 * including argument source detection and help output.
 */

import { readdir } from "fs/promises";
import { Paths } from "./paths.mjs";

export class Utils {
  /**
   * Reads the ./deploy directory and returns a list of subdirectories.
   * @returns {Promise<string[]>} Array of deploy target names.
   */

  static async getEnvironmentOptionList() {
    const envPath = Paths.env();
    const exclude = new Set(["base", "common", "temp"]);

    try {
      const entries = await readdir(envPath, { withFileTypes: true });
      return entries
        .filter((entry) => entry.isDirectory() && !exclude.has(entry.name))
        .map((entry) => entry.name);
    } catch (err) {
      console.error(
        `❌ Failed to read environment directory "${envPath}": ${err.message}`
      );
      return [];
    }
  }

  /**
   * Parses an environment variable string into a native value.
   *
   * @param {string} raw - The raw string from environment.
   * @returns {*} Parsed value: boolean, number or original string.
   */

  static parseEnvValue(raw) {
    if (raw === "true") return true;
    if (raw === "false") return false;
    if (!isNaN(raw) && raw.trim() !== "") return Number(raw);
    return raw;
  }

  /**
   * Get the value for a given key from CLI arguments, environment variables, or fallback.
   *
   * @param {Object} args - Parsed command-line arguments.
   * @param {Object} env - Environment variables (typically from dotenv).
   * @param {string} key - The name of the option to retrieve.
   * @param {*} [fallback=null] - The default value if not found in args or env.
   * @returns {{ value: *, source: "CMD" | "ENV" | "default" }}
   *
   */

  static getLaunchOptionInfo(args, env, key, fallback = null) {
    // 1. Check command-line arguments
    if (args?.[key] !== null) {
      return { value: args[key], source: "CMD" };
    }

    // 2. Check environment variables (with standard prefix)
    const envKey = `SCRIPT_LAUNCH_${key.toUpperCase()}`;
    if (env?.[envKey] !== undefined) {
      const parsed = Utils.parseEnvValue(env[envKey]);
      return { value: parsed, source: "ENV" };
    }

    // 3. Use fallback
    return { value: fallback, source: "default" };
  }

  /**
   * Display help information for the launch script.
   */

  static showHelp() {
    console.log(`
  🚀 Launch Script Help
  
  Usage:
    node launch.mjs [options] [script]
  
  Options:
    -d, --deploy           Enable deploy mode
    -m, --mode <mode>      Set execution mode (e.g., development, production)
    -p, --package <name>   Specify root package name
    -s, --script <name>    Specify script to launch
    -v, --verbose          Show verbose output
    -h, --help             Show this help message
  
  Examples:
    node launch.mjs --deploy --mode production
    node launch.mjs --package my-app --script build
    node launch.mjs build --mode test --deploy
  `);
  }
}
