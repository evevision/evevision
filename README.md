<p align="center">
  <img width="400" src="https://user-images.githubusercontent.com/62183293/80457142-d2eb6600-88fc-11ea-8299-6e9540bbd75b.png">
</p>
<p align="center">
  <img src="https://img.shields.io/github/package-json/v/evevision/evevision">
  <img src="https://img.shields.io/github/downloads/evevision/evevision/latest/total">
  <img src="https://img.shields.io/github/downloads/evevision/evevision/total">
  <img src="https://img.shields.io/discord/696546217697476679)](https://discord.gg/wWMasVf">
</p>

<p align="center">
  <a href="README_ru.md">Русские капсулиры</a> · <a href="README_es.md">Versión en Español</a>
</p>

<p align="center">
  <a href="https://github.com/evevision/evevision/releases/latest">Download latest release</a>
</p>


# What is this?

This is a desktop application and platform for extending the user interface of the MMO EVE Online. The tools we've spent years using outside of the game have now finally been brought into the game, greatly increasing immersion and usability.

In the near future, there will be a system allowing you to pick and choose (or develop!) plugins much like apps on your phone, complete with Android-style permissions for accessing your ESI data and EULA-legal-to-read files. You will be able to install and run anyone's tools while feeling safe about your computer and character's data.

Need help using or developing EveVision? Have a suggestion or want to show off how you're using it? [Join our Discord channel!](https://discord.gg/wWMasVf)

### Screenshots

<details>
<summary>Tool Explorer</summary>
  
![toolexplorer](https://user-images.githubusercontent.com/62183293/79695559-89888000-8245-11ea-8493-d441a955f2c8.png)

</details>
<details>
<summary>EveEye and Thera Maps</summary>

![eveeye-ss](https://user-images.githubusercontent.com/62183293/79039585-2b59fe00-7bb0-11ea-91d0-6bb15389dbac.png)

</details>
<details>
<summary>EveMarketer</summary>

![ev-ss-6](https://user-images.githubusercontent.com/62183293/79019786-201db880-7b45-11ea-9d36-45f1fa95fd27.png)

</details>
<details>
<summary>Google Translator</summary>
 
![evevision-ss-1](https://user-images.githubusercontent.com/62183293/79017084-7f2bff00-7b3e-11ea-92c9-0f0fcf91ff19.png)

</details>
<details>
<summary>Abyssal Markets</summary>
  
![abyssal-ss](https://user-images.githubusercontent.com/62183293/79039631-9b688400-7bb0-11ea-835e-3ce72758e16e.png)

</details>
<details>
<summary>D-Scan and Dotlan</summary>
  
![evevision-ss-2](https://user-images.githubusercontent.com/62183293/79017087-7fc49580-7b3e-11ea-9087-b63dadd9c1dd.png)

</details>

### [Video Demonstration](https://streamable.com/iu729v)

# Installation and Usage

There is no complex setup process. Simply download the latest EXE from the [releases page](https://github.com/evevision/evevision/releases), run it once and forget about it. If you would like to build it yourself instead, it is quite simple to do so.

![ss1](https://user-images.githubusercontent.com/62183293/79319758-bf8cd380-7ed6-11ea-902b-41fb27973048.png)

**Make sure you have DirectX 9 disabled in launcher settings**. Log into EVE and play as you normally would - the rest will come naturally to you. If there is a new version available, it will let you know. [There is a custom welcome screen for most major alliances!](BEANS.md)

![custom](https://user-images.githubusercontent.com/62183293/79323992-eea64380-7edc-11ea-94a8-66fff247e815.png)

If you are ever on an official CCP website (i.e. for ESI authentication) the window will flash green *all the way to the edge of the window as shown below*

![flashing window](https://user-images.githubusercontent.com/62183293/79035531-88908800-7b8d-11ea-9b4b-eac06576b91a.gif)

To shut down EveVision, simply select Quit from the tray menu where you change your volume and network settings in Windows.

![ss2](https://user-images.githubusercontent.com/62183293/79319759-bf8cd380-7ed6-11ea-981c-3e3076e9d0be.png)

#### Want to build it yourself? It's really easy!

Assuming you've got node, python, yarn, and VS2019 build tools installed:
```
git clone git@github.com:/evevision/evevision.git
cd evevision
yarn package # OR yarn dev to run in development mode!
```
Read the rest of the README for more info.

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

<details>
<summary>Generic</summary>

* [Google](https://google.com/)
* [DuckDuckGo](https://duckduckgo.com/)

</details>

<details>
<summary>Industry</summary>

* [Fuzzwork](https://www.fuzzwork.co.uk/)
* [EveMarketer](https://evemarketer.com/)
* [Janice Junk Evaluator](https://janice.e-351.com/)
* [Evepraisal](https://evepraisal.com/)
* [Ore Tables](https://ore.cerlestes.de/ore)
* [Abyssal Market](https://mutaplasmid.space/)
* [EVE Mogul](https://www.eve-mogul.com/)

</details>
<details>
<summary>Communication</summary>

* [Google Translate](https://translate.google.com/)
* [DeepL Translate](https://www.deepl.com/en/translator)
* [Discord](https://discordapp.com/app)

</details>
<details>
<summary>Exploration</summary>

* [Dotlan](https://evemaps.dotlan.net/)
* [EveEye](https://eveeye.com/)
* [DScan](https://dscan.info/)
* [Tripwire](https://tripwire.eve-apps.com/)
* [Thera Map](https://www.eve-scout.com/thera/map/)
* [Siggy](https://siggy.borkedlabs.com/)
* [Anoikis](https://anoik.is/)

</details>
<details>
<summary>Information</summary>
  
* [ZKillboard](https://zkillboard.com/)
* [EVEWho](https://evewho.com/)
* [EVE University](https://wiki.eveuniversity.org/)

</details>
<details>
<summary>Entertainment</summary>
  
![jukebox](https://user-images.githubusercontent.com/62183293/79378845-0527bb80-7f2c-11ea-9bc1-58a15eb0c00b.png)
* [Twitch](https://twitch.tv/)
* [Youtube](https://www.youtube.com/)
* [Soundcloud](https://www.soundcloud.com/)
* [Reddit](https://reddit.com/r/eve)

</details>

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

# For Nerds

![Build Status](https://github.com/evevision/evevision/workflows/build/badge.svg?branch=master)
![GitHub commits since latest release](https://img.shields.io/github/commits-since/evevision/evevision/latest/master)
![GitHub commit activity](https://img.shields.io/github/commit-activity/w/evevision/evevision)
![Electron Version](https://img.shields.io/github/package-json/dependency-version/evevision/evevision/electron)
![React Version](https://img.shields.io/github/package-json/dependency-version/evevision/evevision/react)

Want to tinker around and make your own ingame tools for EVE? It is extremely easy to build and run EveVision yourself! Once you're up and running, you'll be able to run a single command and watch your components update in real-time directly ingame as you save your changes, just like regular web development.

![editing](https://user-images.githubusercontent.com/62183293/79146670-bc87cb00-7d90-11ea-9875-815d759dd133.gif)

Issues and pull requests are reviewed. If you have an idea, hop on Discord and I'll let you know if I would pull it in!

##### If you plan on building private alliance/corp tools, please be aware that the core of this software is not meant to be modified for separate distribution, and the license prevents you from doing so without releasing the full sourcecode. There will be a plugin system in the very near future that will allow you to securely distribute tools.


### Tips
EveVision consists of the following components:
* Electron app inside [app](app), with a split codebase for the [main](app/main) and [renderer](app/renderer) processes.
* Overlay DLL that is injected into the EVE Client's process space at [overlay](overlay)
* Native node module for injecting and communicating with the overlay DLL at [app/native](app/native). 
* FlatBuffer schemas that are used for communication between the DLL and native node module at [flatbuffers/schema](flatbuffers/schema)

If you have never worked with Electron before, the main thing to know is that there is a **main process** that uses **NodeJS** and then **renderer processes** for each window that are **Chromium**. They have two different
sets of code, two different entry points and communicate via Electron's IPC module.

**It is the renderer process where web developers will feel most at home, as you are doing nothing more than developing a React app that is loaded by Chromium.** This is where the actual UI is, rather than all the window, input, and process
management code.

In many ways, the main and renderer processes share the same relationship as the backend and frontend interface of a website.

Note that you can rule out most issues with production and development mode. The only time you need to test packaging the app is when new resource files will be introduced, which shouldn't be happening often.

## Building

This application can only be built and run on Windows x64. However, it is extraordinarily easy to do so - no prior Windows development experience is required! I'm primarily a linux dev myself, and Windows repos scare me too. Every single thing is handled for you via yarn scripts.

You will need the following installed:
* [Python 2](https://www.python.org/ftp/python/2.7.17/python-2.7.17.amd64.msi)
* [Node v12](https://nodejs.org/dist/v12.16.2/node-v12.16.2-x64.msi)
* [Yarn Package Manager](https://classic.yarnpkg.com/latest.msi)
* [Visual Studio 2017-2019 Build Tools](https://visualstudio.microsoft.com/thank-you-downloading-visual-studio/?sku=BuildTools&rel=16#) (you only need C++ Build Tools from installer)

Download the repo by cloning it or getting the ZIP and extracting it to a local directory of your choice.

#### Generate Packaged Executable
Run `yarn package` and a packaged executable will be output to `release/EveVision.exe`.

All components will be built to ensure the latest code is packaged.
To quickly repackage the app without running any builds, use `yarn package-skip-build` instead.

#### Development Mode
Simply run `yarn dev`

All components will be built beforehand to ensure the latest code is running. To quickly start development mode without running any builds, run `yarn dev-skip-build` instead. Hot-reloading will be enabled so you can see your changes inside EVE in real time.

#### Production Mode
To build and run EveVision but without packaging it into an EXE, simply run `yarn start`. To quickly run the app without running any builds, use `yarn start-skip-build` instead.

#### Making changes to C++
If you make any changes to the C++, you need to know a few things:
* You don't necessarily have to shut down EVE before injecting a new version of the overlay. Old versions sit there doing nothing. However, it's usually a good idea.
* After making your changes to the overlay DLL, run `yarn build-overlay`. You don't have to restart EveVision for it to inject the latest DLL.
* After making changes to the node native module, run `yarn build-native`. You **will** have to restart EveVision.

All build commands are run beforehand with `yarn dev`, `yarn start`, and `yarn package`.

## Thanks
This project uses portions of code from and was inspired by https://github.com/hiitiger/gelectron
