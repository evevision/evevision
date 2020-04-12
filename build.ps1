
Write-Host "🛠️ Building flatbuffer.."
pushd flatbuffers
./build.ps1
popd
Write-Host "✔️ OK"

Write-Host "🛠️ Building overlay dll.."
pushd overlay
./build.ps1
popd
Write-Host "✔️ OK"

Write-Host "🛠️ Installing node modules.."
yarn install --frozen-lockfile
Write-Host "✔️ OK"

Write-Host "🛠️ Building evevision.."
yarn run package-win
Write-Host "✔️ OK"
