Write-Host "Building native node module.."
pushd ../
node-gyp configure
node-gyp build
popd
Write-Host "OK"