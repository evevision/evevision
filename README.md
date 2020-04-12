# The EVE Online UI you've always wanted.
![eveeye-ss](https://user-images.githubusercontent.com/62183293/79039585-2b59fe00-7bb0-11ea-91d0-6bb15389dbac.png)
![ev-ss-6](https://user-images.githubusercontent.com/62183293/79019786-201db880-7b45-11ea-9d36-45f1fa95fd27.png)
![evevision-ss-1](https://user-images.githubusercontent.com/62183293/79017084-7f2bff00-7b3e-11ea-92c9-0f0fcf91ff19.png)
![abyssal-ss](https://user-images.githubusercontent.com/62183293/79039631-9b688400-7bb0-11ea-835e-3ce72758e16e.png)
![evevision-ss-2](https://user-images.githubusercontent.com/62183293/79017087-7fc49580-7b3e-11ea-9087-b63dadd9c1dd.png)

[Video Demonstration](https://streamable.com/iu729v)

# What is this?

This is a desktop application and platform for extending the user interface of the MMO EVE Online. The tools we've spent years using outside of the game have now finally been brought into the game, greatly increasing immersion and usability.

In the near future, there will be a system allowing you to pick and choose (or develop!) plugins much like apps on your phone, complete with Android-style permissions for accessing your ESI data and EULA-legal-to-read files. You will be able to install and run anyone's tools while feeling safe about your computer and character's data.

Need help using or developing EveVision? Have a suggestion or want to show off how you're using it? [Join our Discord channel!](https://discord.gg/wWMasVf)

# Installation and Usage

There is no complex setup process. Simply download the latest EXE from the [releases page](https://github.com/evevision/evevision/releases), run it once and forget about it.

![ev-ss-4](https://user-images.githubusercontent.com/62183293/79017654-ded6da00-7b3f-11ea-96b5-217b1e9e1274.png)

Log into EVE and play as you normally would - the rest will come naturally to you. If there is a new version available, it will let you know. Note that the background only shows for members of Pandemic Horde, this will be customizable soon!

![ev-ss-5](https://user-images.githubusercontent.com/62183293/79019099-86094080-7b43-11ea-8f43-94f559fb3b53.png)

If you are ever on an official CCP website (i.e. for ESI authentication) the window will flash green *all the way to the edge of the window as shown below*

![flashing window](https://user-images.githubusercontent.com/62183293/79035531-88908800-7b8d-11ea-9b4b-eac06576b91a.gif)

To shut down EveVision, simply select Quit from the tray menu where you change your volume and network settings in Windows.

![ev-ss-3](https://user-images.githubusercontent.com/62183293/79017565-a8995a80-7b3f-11ea-82f0-3c292e0f34bb.png)

# Donations

You can donate ISK to the character `EveVision` ingame!

[![](https://c5.patreon.com/external/logo/become_a_patron_button.png)](https://www.patreon.com/evevision)

Patreon donators get their character name in the EveVision credits forever! I will put it towards paying for my development tools, the various services that EveVision utilizes, and probably PLEX because I'm a credit card warrior.

# Conflicts
EveVision is very new and uses some techniques that easily conflict with other software. If you don't see the overlay ingame, you probably have some software installed that somehow interacts with the EVE client too.

Currently known conflicts:
* RivaTuner Statistics Server
* MSI Afterburner (if running RivaTuner)
* FRAPS
* On very rare occasion, Windows Defender

Confirmed to work:
* EVE-O Preview (you can even see EveVision windows in the previews!)

We want to hear about conflicts so we can fix them! Please, if you can't seem to get EveVision to work, [join our Discord channel](https://discord.gg/wWMasVf) and help us figure out what it might be.

# Currently Available Tools

### Generic
* [Google](https://google.com/)
* [DuckDuckGo](https://duckduckgo.com/)

### Industry
* [EveMarketer](https://evemarketer.com/)
* [Janice Junk Evaluator](https://janice.e-351.com/)
* [Evepraisal](https://evepraisal.com/)
* [Ore Tables](https://ore.cerlestes.de/ore)
* [Abyssal Market](https://mutaplasmid.space/)
* [EVE Mogul](https://www.eve-mogul.com/)

### Communication
* [Google Translate](https://translate.google.com/)
* [DeepL Translate](https://www.deepl.com/en/translator)
* [Discord](https://discordapp.com/app)

### Exploration
* [Dotlan](https://evemaps.dotlan.net/)
* [EveEye](https://eveeye.com/)
* [DScan](https://dscan.info/)
* [Tripwire](https://tripwire.eve-apps.com/)
* [Thera Map](https://www.eve-scout.com/thera/map/)

### Information
* [ZKillboard](https://zkillboard.com/)
* [EVEWho](https://evewho.com/)
* [EVE University](https://wiki.eveuniversity.org/)

### Entertainment
* [Youtube](https://www.youtube.com/)
* [Soundcloud](https://www.soundcloud.com/)
* [Reddit](https://reddit.com/r/eve)

# EULA Compliance
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

# Development

This repo is in a very early state for open source development. There's most definitely random files and functions that aren't needed or aren't configured right. The whole repo may be split up later.

#### If you plan on building private alliance/corp tools, please be aware that the core of this software is not meant to be modified for separate distribution, and the license prevents you from doing so without releasing the full sourcecode. There will be a plugin system in the very near future that will allow you to securely distribute tools.

Issues and pull requests are reviewed. If you have an idea, let me know and I'll let you know if I would pull it in!

### Internals/Building
EveVision consists of a Node/React-based Electron app at `/evevision`, a C++ DLL that is injected into your game client at `/overlay-dll`, and a native node module for injecting and communicating with the DLL at `/overlay-node`. There are also FlatBuffer definitions inside of `/fb`.

This is obviously a very early release. I haven't finished cleaning up build processes, especially for open source consumption. There isn't much 'development/production' separation at this time. Even the folder structure is likely to change.

You will need to download:
* flatc.exe (https://github.com/google/flatbuffers) - put this in your PATH or inside the fb directory

You will need the following installed:
* Python2
* Node v12
* Yarn package manager
* Visual Studio 2019 (will remove this dependency later)

Steps:
1. Clone (or extract ZIP of) repo to a local directory.
2. Inside the `fb` directory, run `build.ps1` to generate and copy the flatbuffer schema files.
3. Inside the `evevision` directory, run `yarn install`.
4. Inside the `overlay-dll` directory, run `build.ps1` to build the overlay DLL.
5. Run `yarn dev` inside `/evevision` to start the app in development. Use `yarn package-win` to build a packaged executable, which will be output at `/evevision/release/EveVision VERSION.exe`. Please ensure Sentry is disabled if you package the app so we don't receive false error reports!

If you want to make changes to overlay-node and test them, you should use yarn link. Otherwise, you'll need to reinstall the package every time a change is made, since yarn just copies it over otherwise. You need to run `node-gyp rebuild` to compile the changes.

## Thanks
This project uses portions of code from and was inspired by https://github.com/hiitiger/gelectron
