import { execSync } from "child_process";

execSync(
  "@powershell -NoProfile -ExecutionPolicy Unrestricted -Command ./build-overlay.ps1",
  {
    cwd: __dirname,
    stdio: "inherit"
  }
);
