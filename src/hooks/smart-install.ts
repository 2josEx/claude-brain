#!/usr/bin/env node
/**
 * Memvid Mind - Smart Install Hook
 *
 * Automatically installs dependencies on first run.
 * Runs on SessionStart before other hooks.
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { execSync } from "node:child_process";
import { writeOutput, debug } from "../utils/helpers.js";

// Get the plugin root directory
const pluginRoot = process.env.CLAUDE_PLUGIN_ROOT || dirname(dirname(__dirname));
const nodeModulesPath = resolve(pluginRoot, "node_modules");
const sdkPath = resolve(nodeModulesPath, "@memvid/sdk");
const packageJsonPath = resolve(pluginRoot, "package.json");
const installMarkerPath = resolve(pluginRoot, ".install-version");

interface InstallMarker {
  version: string;
  installedAt: string;
}

function getPackageVersion(): string {
  try {
    const pkg = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
    return pkg.version || "unknown";
  } catch {
    return "unknown";
  }
}

function getInstallMarker(): InstallMarker | null {
  try {
    if (existsSync(installMarkerPath)) {
      return JSON.parse(readFileSync(installMarkerPath, "utf-8"));
    }
  } catch {
    // Ignore errors
  }
  return null;
}

function saveInstallMarker(version: string): void {
  const marker: InstallMarker = {
    version,
    installedAt: new Date().toISOString(),
  };
  writeFileSync(installMarkerPath, JSON.stringify(marker, null, 2));
}

function needsInstall(): boolean {
  // Check if SDK exists
  if (!existsSync(sdkPath)) {
    debug("SDK not found, needs install");
    return true;
  }

  // Check if version changed
  const marker = getInstallMarker();
  const currentVersion = getPackageVersion();

  if (!marker || marker.version !== currentVersion) {
    debug(`Version mismatch: ${marker?.version} -> ${currentVersion}`);
    return true;
  }

  return false;
}

function installDeps(): boolean {
  debug("Installing dependencies...");

  try {
    // Try npm install first
    execSync("npm install --production --no-fund --no-audit", {
      cwd: pluginRoot,
      stdio: "pipe",
      timeout: 120000, // 2 minute timeout
    });

    debug("Dependencies installed successfully");
    return true;
  } catch (error) {
    debug(`npm install failed: ${error}`);

    // Try with force flag
    try {
      execSync("npm install --production --no-fund --no-audit --force", {
        cwd: pluginRoot,
        stdio: "pipe",
        timeout: 120000,
      });
      debug("Dependencies installed with --force");
      return true;
    } catch (forceError) {
      debug(`npm install --force failed: ${forceError}`);
      return false;
    }
  }
}

async function main() {
  try {
    if (needsInstall()) {
      const success = installDeps();

      if (success) {
        const version = getPackageVersion();
        saveInstallMarker(version);
        debug(`Installed memvid-mind v${version}`);
      } else {
        debug("Failed to install dependencies");
      }
    } else {
      debug("Dependencies already installed");
    }

    // Always continue - don't block on install errors
    writeOutput({ continue: true });
  } catch (error) {
    debug(`Smart install error: ${error}`);
    writeOutput({ continue: true });
  }
}

main();
