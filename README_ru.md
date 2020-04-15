# Интерфейс EVE Online, который вы всегда хотели.
 
![package.json version](https://img.shields.io/github/package-json/v/evevision/evevision?label=%D0%B2%D0%B5%D1%80%D1%81%D0%B8%D1%8F)
![Latest Release Downloads](https://img.shields.io/github/downloads/evevision/evevision/latest/total?label=%D0%B7%D0%B0%D0%B3%D1%80%D1%83%D0%B7%D0%BA%D0%B8%40%D0%9F%D0%BE%D1%81%D0%BB%D0%B5%D0%B4%D0%BD%D0%B8%D0%B5)
![Release Downloads](https://img.shields.io/github/downloads/evevision/evevision/total?label=%D0%B7%D0%B0%D0%B3%D1%80%D1%83%D0%B7%D0%BA%D0%B8)
[![Discord](https://img.shields.io/discord/696546217697476679?label=discord)](https://discord.gg/Pw84WbS)
 
![eveeye-ss](https://user-images.githubusercontent.com/62183293/79039585-2b59fe00-7bb0-11ea-91d0-6bb15389dbac.png)
![ev-ss-6](https://user-images.githubusercontent.com/62183293/79019786-201db880-7b45-11ea-9d36-45f1fa95fd27.png)
![evevision-ss-1](https://user-images.githubusercontent.com/62183293/79017084-7f2bff00-7b3e-11ea-92c9-0f0fcf91ff19.png)
![abyssal-ss](https://user-images.githubusercontent.com/62183293/79039631-9b688400-7bb0-11ea-835e-3ce72758e16e.png)
![evevision-ss-2](https://user-images.githubusercontent.com/62183293/79017087-7fc49580-7b3e-11ea-9087-b63dadd9c1dd.png)
 
### [Видео демонстрация](https://streamable.com/iu729v)

# Что это?
 
Это приложение и платформа для расширения пользовательского интерфейса ММО EVE Online. Инструменты, которые мы годами использовали вне игры, теперь являются частью ее, усиливая погружение и юзабилити.
 
В ближайшем будущем это будет системой, позволяющей вам использовать (или разрабатывать!) плагины как обычные приложения на вашем телефоне, с разграничением доступов как на платформе Android к вашим данным в ESI и файлам, которые разрешено использовать EULA. Вы сможете устанавливать и запускать любые инструменты, будучи уверенными в безопасности своего компьютера и сведений о своем персонаже.
 
Для самого приложения также скоро будет русский перевод.

Нужна помощь в использовании или разработке EveVision? Есть предложение, или хотите показать, как вы используете его? [Присоединяйтесь к нашему каналу в Discord!](https://discord.gg/Pw84WbS)
 
# Установка и использование
 
Здесь нет привычного установочного процесса. Просто загрузите последнюю версию приложения со [страницы с версиями](https://github.com/evevision/evevision/releases), запустите и забудьте о нем. Если вы хотите самостоятельно собрать его, это тоже весьма легко сделать.
 
![ss1](https://user-images.githubusercontent.com/62183293/79319758-bf8cd380-7ed6-11ea-902b-41fb27973048.png)
 
**Убедитесь, что у вас отключен DirectX 9 в настройках лаунчера**. Войдите в игру и играйте как ни в чем не бывало - остальное приложится. Если выйдет новая версия, приложение вас предупредит. [Для большинства крупных альянсов есть персональный экран приветствия!](BEANS.md)
 
![custom](https://user-images.githubusercontent.com/62183293/79323992-eea64380-7edc-11ea-94a8-66fff247e815.png)

Если вы будете на официальном сайте CCP (например для ESI авторизации), у окна появится мигающая зеленая рамка по его периметру, как на примере.
 
![flashing window](https://user-images.githubusercontent.com/62183293/79035531-88908800-7b8d-11ea-9b4b-eac06576b91a.gif)
 
Чтобы выключить EveVision, щелкните по его иконке в трее правой кнопкой мыши и выберите Quit.
 
![ss2](https://user-images.githubusercontent.com/62183293/79319759-bf8cd380-7ed6-11ea-981c-3e3076e9d0be.png)
 
#### Хотите собрать самостоятельно? Это просто!
 
При условии, что у вас установлены node, python, yarn, и VS2019:
```
git clone git@github.com:/evevision/evevision.git
cd evevision
yarn package # OR yarn dev to run in development mode!
```
Для большей информации прочитайте README до конца.
 
# Донат
 
Вы можете задонатить ISK персонажу `EveVision` непосредственно в игре!
 
[![](https://c5.patreon.com/external/logo/become_a_patron_button.png)](https://www.patreon.com/evevision)
 
Имена персонажей тех, кто задонатит на Patreon, будут навсегда вписаны в описание EveVision! Я буду использовать эти средства чтобы оплачивать инструменты разработки, различные сервисы, которые использует EveVision, и возможно покупать плексы.
 
# Совместимость
EveVision использует некоторые технологии, которые легко могут конфликтовать с другими приложениями. Если вы не видите оверлея в игре, возможно у вас установлено какое-то приложение, которое также взаимодействует с клиентом игры.
 
Известные несовместимые приложения:
* RivaTuner Statistics Server
* MSI Afterburner (если запущен RivaTuner)
* FRAPS
* Очень редко, Windows Defender
 
Подтверждена совместимость:
* EVE-O Preview (вы даже можете видеть окна EveVision на превью!)
 
Мы хотим знать, с чем еще EveVision работает некорректно, чтобы исправить это! Если у вас не получается заставить EveVision работать, [присоединитесь к нашему Discord](https://discord.gg/Pw84WbS) и помогите нам понять, в чем может быть дело.
 
# Доступные инструменты
 
### Общие
* [Google](https://google.com/)
* [DuckDuckGo](https://duckduckgo.com/)
 
### Производство
* [Fuzzwork](https://www.fuzzwork.co.uk/)
* [EveMarketer](https://evemarketer.com/)
* [Janice Junk Evaluator](https://janice.e-351.com/)
* [Evepraisal](https://evepraisal.com/)
* [Ore Tables](https://ore.cerlestes.de/ore)
* [Abyssal Market](https://mutaplasmid.space/)
* [EVE Mogul](https://www.eve-mogul.com/)
 
### Коммуникации
* [Google Translate](https://translate.google.com/)
* [DeepL Translate](https://www.deepl.com/en/translator)
* [Discord](https://discordapp.com/app)
 
### Исследование
* [Dotlan](https://evemaps.dotlan.net/)
* [EveEye](https://eveeye.com/)
* [DScan](https://dscan.info/)
* [Tripwire](https://tripwire.eve-apps.com/)
* [Thera Map](https://www.eve-scout.com/thera/map/)
* [Siggy](https://siggy.borkedlabs.com/)
* [Anoikis](https://anoik.is/)
 
### Информация
* [ZKillboard](https://zkillboard.com/)
* [EVEWho](https://evewho.com/)
* [EVE University](https://wiki.eveuniversity.org/)
 
### Развлечения
* EVE Jukebox
* [Youtube](https://www.youtube.com/)
* [Soundcloud](https://www.soundcloud.com/)
* [Reddit](https://reddit.com/r/eve)
 
# Легальность
Ядро EveVision полностью находится в рамках EULA, как и ваш оверлей из дискорда или мамбла. CCP комментировали подобные виды приложений несколько лет назад: https://www.eveonline.com/article/overlays-isk-buyer-amnesty-and-account-security
 
>We may, in our discretion, tolerate the use of applications or other software that simply enhance player enjoyment in a way that maintains fair gameplay.
 AS LONG AS it’s fair to everybody - neither you nor anybody else gets any unfair advantage – we are fine with it.
 
>For instance, the use of programs that provide in-game overlays (Mumble, Teamspeak) is not something we plan to actively police at this time.
>This is an example of something we do NOT consider unfair, for now. This also includes other in-game overlays which do NOT grant you any unfair advantage.
>We do not consider it an unfair advantage if you can see who is currently talking in your voice communication tool via the means of an in-game overlay.
 
Самый важный пункт, показывающий что это относится не только к Mumble или TeamSpeak:
>We also do NOT consider it unfair if you use other comfort overlays which do not affect how the game is played. This includes overlays for chat and IM applications, the Steam overlay, and **Web-Browser overlays** for example.
 
Это приложение не может делать ничего вроде считывания с экрана или автоматизации действий в игре (кроме тех, что идут через ESI). Оно только отрисовывает EveVision поверх клиента и перехватывает нажатия с целью взаимодействия с ним.
 
Как бы то ни было, помните, что последнее слово всегда за ССР. Они могут решить в будущем, что EveVision позволяет слишком многое, и должен быть запрещен - но на данный момент здесь нет никакого риска быть забаненным. В дополнение к этому, неофициальные плагины, которые будут разработаны в будущем, не подпадают под данные утверждения - если они будут обеспечивать нечестное преимущество, это нарушение EULA.
 
# Для задротов
 
![Build Status](https://github.com/evevision/evevision/workflows/build/badge.svg?branch=master)
![GitHub commits since latest release](https://img.shields.io/github/commits-since/evevision/evevision/latest/master)
![GitHub commit activity](https://img.shields.io/github/commit-activity/w/evevision/evevision)
![Electron Version](https://img.shields.io/github/package-json/dependency-version/evevision/evevision/electron)
![React Version](https://img.shields.io/github/package-json/dependency-version/evevision/evevision/react)
 
Хотите повозиться и сделать свои собственные инструменты для EVE? Самостоятельная сборка и запуск EveVision крайне проста! Как только приложение запущено, вы можете выполнить единственную команду и наблюдать за обновлением всех компонентов в реальном времени прямо в игре, когда вы сохраните изменения, прям как в обычной веб-разработке.
 
![editing](https://user-images.githubusercontent.com/62183293/79146670-bc87cb00-7d90-11ea-9875-815d759dd133.gif)
 
Проблемы и пулл-реквесты изучаются. Если у вас есть какая-то идея, заскакивайте в дискорд, и я дам вам знать, если я введу ее.
 
##### Если вы планируете сделать приватный альянсовый/корпоративный инструмент, обратите внимание, что ядро этого приложения не предполагает изменений для отдельного распространения, и условия лицензии не позволяют вам делать этого без публикации полного искходного кода. В ближайшем будущем будет разработана система плагинов, которая будет позволять вам безопасно распространять инструменты.
 
### Tips
EveVision consists of the following components:
* Electron app inside [app](app), with a split codebase for the [main](app/main) and [renderer](app/renderer) processes.
* Overlay DLL that is injected into the EVE Client's process space at [overlay](overlay)
* Native node module for injecting and communicating with the overlay DLL at [app/main/native](app/main/native).
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