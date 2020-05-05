<p align="center">
  <img width="400" src="https://user-images.githubusercontent.com/62183293/80457142-d2eb6600-88fc-11ea-8299-6e9540bbd75b.png">
</p>

<p align="center">
  <img src="https://img.shields.io/github/downloads/evevision/evevision/total?color=5e2424&style=for-the-badge">
  <img src="https://img.shields.io/github/downloads/evevision/evevision/latest/total?color=5e2424&style=for-the-badge">
  <img src="https://img.shields.io/github/package-json/v/evevision/evevision?color=5e2424&style=for-the-badge">
  <a href="https://discord.gg/wWMasVf"><img alt="Discord" src="https://img.shields.io/discord/696546217697476679?color=5e2424&label=discord&style=for-the-badge"></a>
</p>

<p align="center">
  <a href="README_ru.md">Русские капсулиры</a> · <a href="README_es.md">Versión en Español</a>
</p>

<p align="center">
  <a href="https://github.com/evevision/evevision/releases/latest">下载最新版本</a>
</p>

# 一劳永逸解决切屏烦恼。

如果你是新伊甸的常客，你可能已经习惯于使用Alt+Tab切换到浏览器来使用那些网页工具。这也使得EVEOnline的游玩体验和其他游戏迥然不同。然而，这同时也会影响到对于这个CCP带来的美丽世界的沉浸体验。

EveVision 是一款[符合EULA](#eula-compliance) 的EVE客户端UI扩展插件，将你最趁手的网页工具整合进客户端。

近期我们计划开发一套系统供用户挑选（甚至开发！）插件，就像手机上的APP一样，通过类似于Android申请权限的方式从你的ESI数据里读取信息，这些都是符合EULA的、非作弊的功能。您可以安装和运行来自任何开发者的插件而不用担心自己的信息会遭到泄漏。

需要帮助？或是想提些建议？又或是想展示你的EveVision？加入我们的Discord频道!](https://discord.gg/wWMasVf)

### 使用截图

<details>
<summary>工具浏览器 Tool Explorer</summary>


![toolexplorer](https://user-images.githubusercontent.com/62183293/79695559-89888000-8245-11ea-8493-d441a955f2c8.png)

</details>

<details>
<summary>EveEye 和 希拉地图 TheraMaps</summary>


![eveeye-ss](https://user-images.githubusercontent.com/62183293/79039585-2b59fe00-7bb0-11ea-91d0-6bb15389dbac.png)

</details>

<details>
<summary>EveMarketer</summary>

![ev-ss-6](https://user-images.githubusercontent.com/62183293/79019786-201db880-7b45-11ea-9d36-45f1fa95fd27.png)

</details>

<details>
<summary>谷歌翻译</summary>


![evevision-ss-1](https://user-images.githubusercontent.com/62183293/79017084-7f2bff00-7b3e-11ea-92c9-0f0fcf91ff19.png)

</details>

<details>
<summary>深渊市场报价 Abyssal Markets</summary>


![abyssal-ss](https://user-images.githubusercontent.com/62183293/79039631-9b688400-7bb0-11ea-835e-3ce72758e16e.png)

</details>

<details>
<summary>D-Scan生成器 和 跳跃计算Dotlan</summary>


![evevision-ss-2](https://user-images.githubusercontent.com/62183293/79017087-7fc49580-7b3e-11ea-9087-b63dadd9c1dd.png)

</details>

### [视频演示](https://streamable.com/iu729v)

# 安装与使用

安装过程并不复杂。你只需要从[这里](https://github.com/evevision/evevision/releases)下载最新安装包，运行一次之后就可以把它完全抛在脑后了。

如果你想从头构建它也很简单。

![ss1](https://user-images.githubusercontent.com/62183293/79319758-bf8cd380-7ed6-11ea-902b-41fb27973048.png)

**确保你在启动器中<font color=red>没有</font>启用DirectX 9。**登录EVE，然后你就可以一如既往地游戏了——其余事项会自动完成。如果有可用的更新，Evevision会给出提示。[作为大型联盟的一员，你还可以自定义属于你们的欢迎页面！](BEANS.md)

![custom](https://user-images.githubusercontent.com/62183293/79323992-eea64380-7edc-11ea-94a8-66fff247e815.png)

如果你曾经登录过CCP网站（比如，设置ESI权限时），这个窗体的*边框将闪绿*。

![flashing window](https://user-images.githubusercontent.com/62183293/79035531-88908800-7b8d-11ea-9b4b-eac06576b91a.gif)

要关闭EveVision，只需在右下角系统托盘内右键EveVision的图标，再选择“Quit”即可。

![ss2](https://user-images.githubusercontent.com/62183293/79319759-bf8cd380-7ed6-11ea-981c-3e3076e9d0be.png)

#### 想要从头编译它吗？很简单！

首先你需要配置好node.js，Python，Yarn和Visual Studio 2019：
```
git clone git@github.com:/evevision/evevision.git
cd evevision
yarn ez:package # OR yarn ez:dev to run in development mode!
```
如果你想了解更多，请继续往下读。

# 捐赠

你可以捐赠给游戏内角色 `EveVision`isk !

[![](https://c5.patreon.com/external/logo/become_a_patron_button.png)](https://www.patreon.com/evevision)

在Patreon上的赞助者会被添加到致谢名单中。我会将赞助用于工具开发，EveVision的各项服务和功能维护，以及（可能包括）PLEX，毕竟我是个信用卡战士：）

# 冲突

EveVision是一款新工具，这意味着它有可能和其他软件产生冲突。如果你在游戏界面中没有看到EveVision的窗口，这可能是由于某些软件和EveVision产生了冲突。

已知的冲突包括：

* RivaTuner Statistics Server
* MSI Afterburner (如果使用了RivaTuner)
* FRAPS
* 在某些罕见的情况下, Windows Defender 防火墙

确认不会冲突的软件包括:
* EVE-O Preview (是的，你可以在EveVision的窗体中看到Preview！)

我们希望更多地了解冲突以便修复它们，因此如果你的EveVision不能运行，请[加入我们的Discord频道](https://discord.gg/wWMasVf)，让我们修复它！

# 符合EULA

EveVision核心服务是符合EULA的，正如Mumble的显示方式一样。CCP在数年前曾对这类工具进行说明：https://www.eveonline.com/article/overlays-isk-buyer-amnesty-and-account-security

>We may, in our discretion, tolerate the use of applications or other software that simply enhance player enjoyment in a way that maintains fair gameplay.
 AS LONG AS it’s fair to everybody - neither you nor anybody else gets any unfair advantage – we are fine with it.

>For instance, the use of programs that provide in-game overlays (Mumble, Teamspeak) is not something we plan to actively police at this time.
>This is an example of something we do NOT consider unfair, for now. This also includes other in-game overlays which do NOT grant you any unfair advantage.
>We do not consider it an unfair advantage if you can see who is currently talking in your voice communication tool via the means of an in-game overlay.

更重要的是，如Mumble或Teamspeak这类软件已被明确表明不违反EULA：
>We also do NOT consider it unfair if you use other comfort overlays which do not affect how the game is played. This includes overlays for chat and IM applications, the Steam overlay, and **Web-Browser overlays** for example.

EveVision不能读游戏屏幕，也不能帮你自动完成某些操作(除非通过ESI)。它只是在EVE主界面上绘制，并获取与EveVision窗口交互时的数据。

但是CCP一直表示他们拥有最终解释权。在将来的某个时间点他们完全有可能宣称EveVision有违规行为并禁止它的使用——但是当下，仅仅使用EveVision并不会导致你被封禁。另外，非官方的插件有可能是违反EULA的，如果它们有作弊行为，它们仍将是违规的。

# 面向开发人员...!!

![Build Status](https://github.com/evevision/evevision/workflows/build/badge.svg?branch=master)
![GitHub commits since latest release](https://img.shields.io/github/commits-since/evevision/evevision/latest/master)
![GitHub commit activity](https://img.shields.io/github/commit-activity/w/evevision/evevision)
![Electron Version](https://img.shields.io/github/package-json/dependency-version/evevision/evevision/electron)
![React Version](https://img.shields.io/github/package-json/dependency-version/evevision/evevision/react)

想捣鼓出一套你自己的EVE内工具吗？自己构建EveVision相当简单！启动后，你就可以像通常开发网页一样，运行一个命令就能实时看到游戏内的显示变化！

![editing](https://user-images.githubusercontent.com/62183293/79146670-bc87cb00-7d90-11ea-9875-815d759dd133.gif)

我们持续关注Issues 和 pull requests。如果你有任何好的想法，欢迎上跳Discord频道告诉我，我会仔细考虑是否加入你的点子！

##### 如果你打算构建私有的联盟/公司工具，请注意这个工具的核心部分不应被修改，这一点在许可中明确说明了；如果你要修改，你应当开放源代码。近期我们计划增加插件功能以允许用户安全地发布自制工具。

### 小贴士

EveVision 包括以下组件：
* Electron ：内部应用，代码包括主进程(app/main)和渲染进程(app/renderer)
* Overlay DLL：将内容覆盖显示在EVE客户端上(overlay)
* Native node module 用来注入和与overlay DLL交互(app/native)
* FlatBuffer 用于DLL和native node module通信（flatbuffers/schema)

如果你没有使用过Electron，那么你需要知道主进程使用Node.JS，而渲染进程是用Chromium渲染每一个窗口的。它们有着两套不同的代码，入口点，通过Electron的IPC模块互相交互。

**如果你是网络开发人员，渲染进程上的内容是你会比较熟悉的内容，因为诸如React的APP都将在那里被Chromium调用。** 那里是UI实际显示的地方，而不是整个窗体，输入，过程等等。
管理代码

从各种意义上讲，主进程都更类似于网站的后端，而渲染进程则类似于前端。

注意，你可以在生产模式和开发模式中排除大部分问题。如果没有新增新的资源文件，一般不需要测试打包APP。

## 构建

This application can only be built and run on Windows x64. However, it is extraordinarily easy to do so - no prior Windows development experience is required! I'm primarily a linux dev myself, and Windows repos scare me too. Every single thing is handled for you via yarn scripts.

This application can only be built and run on Windows x64. However, it is extraordinarily easy to do so - no prior Windows development experience is required! I'm primarily a linux dev myself, and Windows repos scare me too. Every single thing is handled for you via yarn scripts.

EveVision 只能构建和运行于 64位Windows。不过，其实这非常简单——无需额外的Windows开发经验！我自己就是在Linux上开发的，Windows的仓库系统真的很麻烦。所有这些内容的管理都可以交给yarn脚本。

你需要以下这些工具：

* [Python 2](https://www.python.org/ftp/python/2.7.17/python-2.7.17.amd64.msi)
* [Node v12](https://nodejs.org/dist/v12.16.2/node-v12.16.2-x64.msi)
* [Yarn Package Manager](https://classic.yarnpkg.com/latest.msi)
* [Visual Studio 2017-2019 Build Tools](https://visualstudio.microsoft.com/thank-you-downloading-visual-studio/?sku=BuildTools&rel=16#) (你只需要其中的C++编译工具)

通过克隆或者zip下载这个仓库，并将它保存在你的本地文件夹里。

#### 生成可执行文件

运行 `yarn ez:package` 然后你就能得到一个可执行文件 `release/EveVision.exe`.

所有组件都会被构建，这样得到的包会是最新的。

如果想仅打包而不构建的话请执行 `yarn package` 或 `yarn package:fast` 。

#### 开发模式

只需执行 `yarn ez:dev`

所有组件将会现场构建以确保运行的是最新版本。若想直接运行而不构建，请执行`yarn start:dev`。该模式下所有改动会即时生效，以便你直观地检查运行结果是否符合心意。

#### 生产模式

若要构建运行EveVision而不打包，只需执行行`yarn ez:prod`。不构建而直接运行程序可以执行`yarn start:prod` 。

#### 更改C++部分的代码

如果你改动了C++部分的代码，你需要知道：
* 无需关闭EVE来更新overlay部分的显示，因为旧版的overlay不会crash掉，只是在那里不工作而已。但是，重启EVE是一个好主意。
* 如果你修改了overlay DLL文件，记得执行`yarn build:cpp:overlay`。无需重启EveVision。
* 如果你修改了 node native module，执行 `yarn build:cpp:native-node`。这次你**需要**重启EveVision。

所有构件命令需执行于 `yarn ez:dev`, `yarn ez:prod`, and `yarn ez:package`之前。

## 致谢

这个项目是受https://github.com/hiitiger/gelectron 的启发而启动的，并使用了其中部分的代码。
