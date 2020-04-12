import { execSync } from 'child_process';

execSync('@powershell -NoProfile -ExecutionPolicy Unrestricted -Command ./build-flatbuffers.ps1', {
    cwd: __dirname,
    stdio: 'inherit'
})