import path from "path";
import { execSync } from "child_process";
import fs from "fs";
import { dependencies } from "../app/package.json";

const nodeModulesPath = path.join(__dirname, "..", "app", "node_modules");

if (
  Object.keys(dependencies || {}).length > 0 &&
  fs.existsSync(nodeModulesPath)
) {
  execSync("..\\node_modules\\.bin\\yarn install", {
    cwd: path.join(__dirname, "..", "app"),
    stdio: "inherit"
  });
  const electronRebuildCmd =
    "..\\node_modules\\.bin\\electron-rebuild --parallel --force --types prod,dev,optional --module-dir .";
  execSync(electronRebuildCmd, {
    cwd: path.join(__dirname, "..", "app"),
    stdio: "inherit"
  });
}
