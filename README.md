# EveVision

This is a tool written for the MMO EVE Online. It is, at it's core, a way to extend the EVE UI in a EULA-legal manner.

Video demonstration: https://streamable.com/fjsoll

EveVision is meant only for members of the PanFam Coalition until it has reached a more stable state. It will not work without logging into a character in one of these alliances:

* Pandemic Horde
* Pandemic Legion
* Northern Coalition
* The Skeleton Crew
* Damned Brotherhood
* Triumvirate
* Reckless Contingency
* Veni Vidi Vici
* No Value
* The Stars of Northern Moon
* Slyce

If you are in one of these alliances, you can access the forum post here to download EveVision: https://www.pandemic-horde.org/forum/index.php?threads/evevision-the-eve-ui-you-always-wanted.2540/. You can also access the Pandemic Horde discord to reach me if need be @kefi#1337 (Jaydubs on Horde Discord) or in EVE at Jaydubs.

You are more than welcome to remove this restriction yourself to play around with it, but please do not distribute the executable. I want to keep the beta testing group controllable so this software doesn't go getting a reputation for being broken because I wasn't around to help.

This repo is in a very early state for open source development. There's most definitely random files and functions that aren't needed or aren't configured right. The whole repo may be split up later.

As of right now this is really meant to just display the source code rather than be collaborative open-source development. However, I will review pull requests.

### EULA Compliance
It's as legal as your Mumble overlay. CCP cleared this type of tool years ago: https://www.eveonline.com/article/overlays-isk-buyer-amnesty-and-account-security

>We may, in our discretion, tolerate the use of applications or other software that simply enhance player enjoyment in a way that maintains fair gameplay.
 AS LONG AS it’s fair to everybody - neither you nor anybody else gets any unfair advantage – we are fine with it.

>For instance, the use of programs that provide in-game overlays (Mumble, Teamspeak) is not something we plan to actively police at this time.
>This is an example of something we do NOT consider unfair, for now. This also includes other in-game overlays which do NOT grant you any unfair advantage.
>We do not consider it an unfair advantage if you can see who is currently talking in your voice communication tool via the means of an in-game overlay.

Most importantly, showing that this is not limited to Mumble or Teamspeak:
>We also do NOT consider it unfair if you use other comfort overlays which do not affect how the game is played. This includes overlays for chat and IM applications, the Steam overlay, and **Web-Browser overlays** for example.

This tool cannot do anything like read the screen or perform ingame actions automatically (unless via ESI). It solely draws over EVE and intercepts input for the purpose of interacting with the EveVision windows.

### Internals/Building
EveVision consists of a Node/React-based Electron app at `/evevision`, a C++ DLL that is injected into your game client at `overlay-dll`, and a native node module for communicating with the injected DLL at `/overlay-node`.
There is also the native node module that injects the DLL at `/hooker` (which will be merged into the overlay module soon) and FlatBuffer definitions inside of `/fb`

This is obviously a very early release. I haven't finished cleaning up build processes, especially for open source consumption. There isn't much 'development/production' separation at this time. Even the folder structure is likely to change.

You will need the following installed:
* Git
* Git Bash (MINGW)
* Node v12
* Yarn package manager
* Visual Studio 2019 (will remove this dependency later)

Steps:
1. Clone repo to a local directory.
2. Inside the `fb` directory, run `build.sh` to generate the flatbuffer schema files. This executes flatc.exe, which is included for convenience, but you can of course download the flatbuffer compiler yourself.
3. Inside the `evevision` directory, run `yarn install`.
4. Open `overlay-dll/overlay.vcxproj` in Visual Studio and build the project.
5. Run `yarn dev` inside `/evevision` to start the app in development. Use `yarn package-win` to build a packaged executable, which will be output at `/evevision/release/EveVision VERSION.exe`

If you want to make changes to overlay-dll or hooker and test them, you should use yarn link. Otherwise, you'll need to reinstall the package every time a change is made, since yarn just copies it over otherwise. You need to run `node-gyp rebuild` to compile the changes.