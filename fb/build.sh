# This is dumb but I can't get node-gyp to find these files when its called outside of its directory (i.e. when you yarn install on the root project)
./flatc --cpp --cpp-std c++17 -o output *.fbs --filename-suffix ""

rm -rf ../overlay-dll/fb
rm -rf ../overlay-node/fb
mkdir ../overlay-dll/fb
mkdir ../overlay-node/fb
cp -R output/* ../overlay-dll/fb
cp -R output/* ../overlay-node/fb