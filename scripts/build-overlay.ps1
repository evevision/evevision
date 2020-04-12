$vswhere = Join-Path -Path ${env:ProgramFiles(x86)} -ChildPath "Microsoft Visual Studio\Installer\vswhere.exe"
Write-Host "Building native node module.."
$msbuild = Invoke-Expression "& '$vswhere' -latest -products Microsoft.VisualStudio.Product.BuildTools -find MSBuild\**\Bin\MSBuild.exe | select-object -first 1"

pushd ../overlay
Invoke-Expression "& '$msbuild' overlay.vcxproj /p:Configuration=Release /p:Platform=x64"
popd