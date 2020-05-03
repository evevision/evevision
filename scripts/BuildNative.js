import { execSync } from "child_process";

execSync(
  "@powershell -NoProfile -ExecutionPolicy Unrestricted -Command ./build-native.ps1",
  {
    cwd: __dirname,
    stdio: "inherit",
  }
);
