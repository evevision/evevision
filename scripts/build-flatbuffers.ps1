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

Invoke-Expression "$flatc --cpp --cpp-std c++17 -o ../output/flatbuffers (Get-Item ../flatbuffers/schema/*.fbs) --filename-suffix '""""'"