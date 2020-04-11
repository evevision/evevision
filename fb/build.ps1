# This is dumb but I can't get node-gyp to find these files when its called outside of its directory (i.e. when you yarn install on the root project)

function Extract-File($source, $pattern, $destination) {
    Add-Type -Assembly System.IO.Compression.FileSystem

    $source = [IO.Path]::Combine($pwd, $source)
    $destination = [IO.Path]::Combine($pwd, $destination)

    try {
        $zip = [IO.Compression.ZipFile]::OpenRead($source)
        $zip.Entries | where {$_.Name -like $pattern} | foreach {[System.IO.Compression.ZipFileExtensions]::ExtractToFile($_, $destination, $true)}
    }
    finally {
        $zip.Dispose()
    }
}

if (Test-Path "./flatc" -PathType Leaf) {
    # use local flatc if avaiable
    $flatc = "./flatc"
} elseif (Get-Command "flatc" -ErrorAction SilentlyContinue) { 
    # try global if local is not available
    $flatc = "flatc"
} else {
    # download and make local flatc available
    $flatc = "./flatc"
    Invoke-WebRequest -Uri https://github.com/google/flatbuffers/releases/latest/download/flatc_windows.zip -OutFile ./flatc.zip
    Extract-File "./flatc.zip" "flatc.exe" "./flatc.exe"
    Remove-Item "./flatc.zip"
}

Invoke-Expression "$flatc --cpp --cpp-std c++17 -o output (Get-Item ./*.fbs) --filename-suffix '""""'"

Remove-Item -Recurse -Force ../overlay-dll/fb -ErrorAction Ignore
Remove-Item -Recurse -Force ../overlay-node/fb -ErrorAction Ignore
$null = New-Item -Path ../overlay-dll/fb -ItemType "directory"
$null = New-Item -Path ../overlay-node/fb -ItemType "directory"
Copy-Item -Recurse output/* ../overlay-dll/fb
Copy-Item -Recurse output/* ../overlay-node/fb
