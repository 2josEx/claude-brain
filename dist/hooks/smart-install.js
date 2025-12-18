#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { execSync } from 'child_process';
import 'crypto';

function writeOutput(output) {
  console.log(JSON.stringify(output));
}
function debug(message) {
  if (process.env.MEMVID_MIND_DEBUG === "1") {
    console.error(`[memvid-mind] ${message}`);
  }
}

// src/hooks/smart-install.ts
var pluginRoot = process.env.CLAUDE_PLUGIN_ROOT || dirname(dirname(__dirname));
var nodeModulesPath = resolve(pluginRoot, "node_modules");
var sdkPath = resolve(nodeModulesPath, "@memvid/sdk");
var packageJsonPath = resolve(pluginRoot, "package.json");
var installMarkerPath = resolve(pluginRoot, ".install-version");
function getPackageVersion() {
  try {
    const pkg = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
    return pkg.version || "unknown";
  } catch {
    return "unknown";
  }
}
function getInstallMarker() {
  try {
    if (existsSync(installMarkerPath)) {
      return JSON.parse(readFileSync(installMarkerPath, "utf-8"));
    }
  } catch {
  }
  return null;
}
function saveInstallMarker(version) {
  const marker = {
    version,
    installedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  writeFileSync(installMarkerPath, JSON.stringify(marker, null, 2));
}
function needsInstall() {
  if (!existsSync(sdkPath)) {
    debug("SDK not found, needs install");
    return true;
  }
  const marker = getInstallMarker();
  const currentVersion = getPackageVersion();
  if (!marker || marker.version !== currentVersion) {
    debug(`Version mismatch: ${marker?.version} -> ${currentVersion}`);
    return true;
  }
  return false;
}
function installDeps() {
  debug("Installing dependencies...");
  try {
    execSync("npm install --production --no-fund --no-audit", {
      cwd: pluginRoot,
      stdio: "pipe",
      timeout: 12e4
      // 2 minute timeout
    });
    debug("Dependencies installed successfully");
    return true;
  } catch (error) {
    debug(`npm install failed: ${error}`);
    try {
      execSync("npm install --production --no-fund --no-audit --force", {
        cwd: pluginRoot,
        stdio: "pipe",
        timeout: 12e4
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
    writeOutput({ continue: true });
  } catch (error) {
    debug(`Smart install error: ${error}`);
    writeOutput({ continue: true });
  }
}
main();
//# sourceMappingURL=smart-install.js.map
//# sourceMappingURL=smart-install.js.map