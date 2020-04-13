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

There is no complex setup process. Simply download the latest EXE from the [releases page](https://github.com/evevision/evevision/releases), run it once and forget about it. If you would like to build it yourself instead, it is quite simple to do so.

![ev-ss-4](https://user-images.githubusercontent.com/62183293/79017654-ded6da00-7b3f-11ea-96b5-217b1e9e1274.png)

Log into EVE and play as you normally would - the rest will come naturally to you. If there is a new version available, it will let you know. Note that the background only shows for members of Pandemic Horde, this will be customizable soon!

![ev-ss-5](https://user-images.githubusercontent.com/62183293/79019099-86094080-7b43-11ea-8f43-94f559fb3b53.png)

If you are ever on an official CCP website (i.e. for ESI authentication) the window will flash green *all the way to the edge of the window as shown below*

![flashing window](https://user-images.githubusercontent.com/62183293/79035531-88908800-7b8d-11ea-9b4b-eac06576b91a.gif)

To shut down EveVision, simply select Quit from the tray menu where you change your volume and network settings in Windows.

![ev-ss-3](https://user-images.githubusercontent.com/62183293/79017565-a8995a80-7b3f-11ea-82f0-3c292e0f34bb.png)

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

# For Nerds

Want to tinker around and make your own ingame tools for EVE? It is extremely easy to build and run EveVision yourself! Once you're up and running, you'll be able to run a single command and watch your components update in real-time directly ingame as you save your changes, just like regular web development.

Issues and pull requests are reviewed. If you have an idea, hop on Discord and I'll let you know if I would pull it in!

##### If you plan on building private alliance/corp tools, please be aware that the core of this software is not meant to be modified for separate distribution, and the license prevents you from doing so without releasing the full sourcecode. There will be a plugin system in the very near future that will allow you to securely distribute tools.


### Tips
EveVision consists of the following components:
* Electron app inside `app`, with a split codebase for the main and renderer processes.
* Native node module for injecting and communicating with the DLL inside `app/native`. 
* C++ DLL that is injected into your game's process inside `overlay`
* FlatBuffer schemas inside `/flatbuffers/schema` that are used for communication between the DLL and native node module.

If you have never worked with Electron before, the main thing to know is that there is a **main process** that uses **NodeJS** and then **renderer processes** for each window that are **Chromium**. They have two different
sets of code, two different entry points and communicate via Electron's IPC module.

It is the renderer process where web developers will feel most at home, as you are doing nothing more than developing a React app. This is where the actual UI is, rather than all the window, input, and process
management code.

Think of the renderers as the frontend and the main process as the backend.

Note that you can rule out most issues with production and development mode. The only time you need to test packaging the app is when new files will be introduced, which is rare.

## Building

This application can only be built and run on Windows x64. However, it is extraordinarily easy to do so - no prior Windows development experience is required! I'm primarily a linux dev myself, and Windows repos scare me too. Every single thing is handled for you via yarn scripts.

You will need the following installed:
* [Python 2](https://www.python.org/ftp/python/2.7.17/python-2.7.17.amd64.msi)
* [Node v12](https://nodejs.org/dist/v12.16.2/node-v12.16.2-x64.msi)
* [Yarn Package Manager](https://classic.yarnpkg.com/latest.msi)
* [Visual Studio 2017-2019 Build Tools](https://visualstudio.microsoft.com/thank-you-downloading-visual-studio/?sku=BuildTools&rel=16#) (you only need C++ Build Tools from installer)

Download the repo by cloning it or getting the ZIP and extracting it to a local directory of your choice.

#### Generate Packaged Executable
Run `yarn package` and a packaged executable will be output to `release/EveVision VERSION.exe`.

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
