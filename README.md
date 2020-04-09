# EveVision

This is a desktop application and platform for extending the user interface of the MMO EVE Online. It is very much a beta and should not be relied on yet during critical ingame operations.

Video demonstration: https://streamable.com/iu729v

Note that EveVision only works on Windows 64-bit with EVE running DirectX 11. Ensure DirectX 9 is not enabled in the launcher settings. There may be conflicts with other third party utilities like frame rate limiters, recorders, or overlays. I will work to resolve as many of these conflicts as possible.

Simply download the EXE from the releases page, run it once and forget about it. Log into EVE and play as you normally would - the rest will be obvious to you. You can close it from the tray where you change your volume and network settings in Windows.

### Discord

Need help using or developing EveVision? Have a suggestion or want to show off how you're using it? Join the EveVision discord at https://discord.gg/wWMasVf

## Donations

You can donate ISK to the character `EveVision` ingame!

If you can't code but would still like to contribute to this project and have your character name in the EveVision credits forever, you can do so at https://www.patreon.com/evevision.
I will put it towards paying for my development tools, the various services that EveVision utilizes, and probably PLEX because I'm a credit card warrior.


## EULA Compliance
EveVision Core is as EULA legal as your Mumble overlay. CCP commented on this type of tool years ago: https://www.eveonline.com/article/overlays-isk-buyer-amnesty-and-account-security

>We may, in our discretion, tolerate the use of applications or other software that simply enhance player enjoyment in a way that maintains fair gameplay.
 AS LONG AS it’s fair to everybody - neither you nor anybody else gets any unfair advantage – we are fine with it.

>For instance, the use of programs that provide in-game overlays (Mumble, Teamspeak) is not something we plan to actively police at this time.
>This is an example of something we do NOT consider unfair, for now. This also includes other in-game overlays which do NOT grant you any unfair advantage.
>We do not consider it an unfair advantage if you can see who is currently talking in your voice communication tool via the means of an in-game overlay.

Most importantly, showing that this is not limited to Mumble or Teamspeak:
>We also do NOT consider it unfair if you use other comfort overlays which do not affect how the game is played. This includes overlays for chat and IM applications, the Steam overlay, and **Web-Browser overlays** for example.

This tool cannot do anything like read the screen or perform ingame actions automatically (unless via ESI). It solely draws over EVE and intercepts input for the purpose of interacting with the EveVision windows.

However, keep in mind that CCP always retains the final say. They could full well decide in the future that EveVision is too much and should not be allowed - but in its current form there is no risk of a ban. Additionally, unofficial plugins in the future do not fall under this - if they provide an unfair advantage, it is still against the EULA, no matter what.

## Development

This repo is in a very early state for open source development. There's most definitely random files and functions that aren't needed or aren't configured right. The whole repo may be split up later.

#### If you plan on building private alliance/corp tools, please be aware that the core of this software is not meant to be modified for separate distribution, and the license prevents you from doing so without releasing the full sourcecode. There will be a plugin system in the very near future that will allow you to securely distribute tools.

Issues and pull requests are reviewed. If you have an idea, let me know and I'll let you know if I would pull it in!

### Internals/Building
EveVision consists of a Node/React-based Electron app at `/evevision`, a C++ DLL that is injected into your game client at `/overlay-dll`, and a native node module for communicating with the injected DLL at `/overlay-node`.
There is also the native node module that injects the DLL at `/hooker` (which will be merged into the overlay module soon) and FlatBuffer definitions inside of `/fb`

This is obviously a very early release. I haven't finished cleaning up build processes, especially for open source consumption. There isn't much 'development/production' separation at this time. Even the folder structure is likely to change.

You will need to download two dependencies:
* libminhook
* flatc.exe

You will need the following installed:
* Python2
* Node v12
* Yarn package manager
* Visual Studio 2019 (will remove this dependency later)

Steps:
1. Clone (or extract ZIP of) repo to a local directory.
2. Inside the `fb` directory, run `build.ps1` to generate the flatbuffer schema files.
3. Inside the `evevision` directory, run `yarn install`.
4. Open `/overlay-dll/overlay.vcxproj` in Visual Studio and build the project.
5. Run `yarn dev` inside `/evevision` to start the app in development. Use `yarn package-win` to build a packaged executable, which will be output at `/evevision/release/EveVision VERSION.exe`. Please ensure Sentry is disabled if you package the app so we don't receive false error reports!

If you want to make changes to overlay-node or hooker and test them, you should use yarn link. Otherwise, you'll need to reinstall the package every time a change is made, since yarn just copies it over otherwise. You need to run `node-gyp rebuild` to compile the changes.

## Thanks
This project uses portions of code from and was inspired by https://github.com/hiitiger/gelectron
