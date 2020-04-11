
Write-Host "🛠️ Building flatbuffer.."
pushd fb
./build.ps1
popd
Write-Host "✔️ OK"

Write-Host "🛠️ Building overlay dll.."
pushd overlay-dll
./build.ps1
popd
Write-Host "✔️ OK"

Write-Host "🛠️ Installing node modules.."
pushd evevision
yarn install --frozen-lockfile
popd
Write-Host "✔️ OK"

Write-Host "🛠️ Building evevision.."
pushd evevision
yarn run package-win
popd
Write-Host "✔️ OK"
