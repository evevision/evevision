# This is dumb but I can't get node-gyp to find these files when its called outside of its directory (i.e. when you yarn install on the root project)
./flatc --cpp --cpp-std c++17 -o output (Get-Item ./*.fbs) --filename-suffix '""'

Remove-Item -Recurse -Force ../overlay-dll/fb -ErrorAction Ignore
Remove-Item -Recurse -Force ../overlay-node/fb -ErrorAction Ignore
$null = New-Item -Path ../overlay-dll/fb -ItemType "directory"
$null = New-Item -Path ../overlay-node/fb -ItemType "directory"
Copy-Item -Recurse output/* ../overlay-dll/fb
Copy-Item -Recurse output/* ../overlay-node/fb
