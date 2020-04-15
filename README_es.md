# La interfaz de EVE Online que siempre has deseado.

![package.json version](https://img.shields.io/github/package-json/v/evevision/evevision)
![Latest Release Downloads](https://img.shields.io/github/downloads/evevision/evevision/latest/total)
![Release Downloads](https://img.shields.io/github/downloads/evevision/evevision/total)
[![Discord](https://img.shields.io/discord/696546217697476679)](https://discord.gg/wWMasVf)

![eveeye-ss](https://user-images.githubusercontent.com/62183293/79039585-2b59fe00-7bb0-11ea-91d0-6bb15389dbac.png)
![ev-ss-6](https://user-images.githubusercontent.com/62183293/79019786-201db880-7b45-11ea-9d36-45f1fa95fd27.png)
![evevision-ss-1](https://user-images.githubusercontent.com/62183293/79017084-7f2bff00-7b3e-11ea-92c9-0f0fcf91ff19.png)
![abyssal-ss](https://user-images.githubusercontent.com/62183293/79039631-9b688400-7bb0-11ea-835e-3ce72758e16e.png)
![evevision-ss-2](https://user-images.githubusercontent.com/62183293/79017087-7fc49580-7b3e-11ea-9087-b63dadd9c1dd.png)

### [Video Demonstration](https://streamable.com/iu729v)

# ¿Qué es EveVision?

EveVision es una aplicación de escritorio destinada a mejorar la interfaz de usuario del MMO EVE Online. Con esta aplicación las herramientas externas que hemos usado durante años ahora se incorporan al juego, lo que aumenta enormemente la inmersión y jugabilidad.

En un futuro próximo, habrá un sistema que te permitirá agregar e incluso desarrollar complementos muy similares a las aplicaciones de tu teléfono, con permisos tipo Android para acceder a tus datos ESI y a los archivos del EULA. Podrás instalar y ejecutar herramientas desarrolladas por terceros, mientras tu ordenador y los datos de tus personajes permanecen seguros.

¿Necesitas ayuda para usar o desarrollar EveVision? ¿Tienes alguna sugerencia o quieres mostrar cómo la estás utilizando? [¡Entra en nuestro canal de Discord!](https://discord.gg/wWMasVf)

# Instalación y uso

El proceso de instalación no es complejo. Simplemente descarga la última versión del EXE en la [releases page](https://github.com/evevision/evevision/releases), ejecútalo una sola vez y despreocúpate. Si deseas compilarlo tú mismo, el proceso es bastante sencillo.

![ss1](https://user-images.githubusercontent.com/62183293/79319758-bf8cd380-7ed6-11ea-902b-41fb27973048.png)

**Asegúrate de tener el DirectX 9 deshabilitado en la configuración del launcher**. Inicia sesión en EVE y juega como lo harías normalmente; el resto será algo natural para usted. Si hay una nueva versión disponible, la aplicación te avisara. [¡Hay una pantalla de bienvenida personalizada para la mayoría de las principales alianzas!](BEANS.md)
                                                                                                                                                                                                                                                   
![ss-gsf](https://user-images.githubusercontent.com/62183293/79319763-c0256a00-7ed6-11ea-9d75-7840865c912a.png)
![ss-nc](https://user-images.githubusercontent.com/62183293/79319765-c0be0080-7ed6-11ea-85f8-3f8699d2eb6c.png)

Si alguna vez entras en la web oficial de CCP (es decir, para la autenticación ESI), el borde la ventana parpadeará en verde como se muestra a continuación

![flashing window](https://user-images.githubusercontent.com/62183293/79035531-88908800-7b8d-11ea-9b4b-eac06576b91a.gif)

Para cerrar EveVision, simplemente ve a la bandeja de Windows, haz click derecho en el icono de la aplicación y selecciona Salir en el menú.

![ss2](https://user-images.githubusercontent.com/62183293/79319759-bf8cd380-7ed6-11ea-981c-3e3076e9d0be.png)

#### ¿Quiere compilarlo tú mismo? ¡Es realmente fácil!

Suponiendo que tienes instaladas las herramientas de compilación node, python, yarn, y VS2019:
```
git clone git@github.com:/evevision/evevision.git
cd evevision
yarn package # OR yarn dev to run in development mode!
```
Lee el resto del README para más información.

# Donaciones

¡Puedes donar ISK al personaje `EveVision` en el juego!

[![](https://c5.patreon.com/external/logo/become_a_patron_button.png)](https://www.patreon.com/evevision)

¡Los miembros de nuestro Patreon obtienen como recompensa la incorporación del nombre de su personaje en los créditos de EveVision para siempre! Las donaciones de Patreon se emplearan para pagar las herramientas de desarrollo, los diversos servicios que utiliza EveVision y probablemente para comprar PLEX.

# Conflictos
EveVision es muy nuevo y utiliza algunas técnicas que pueden entran en conflicto con otro software. Si EveVision no se superpone en el juego, probablemente tengas instalado algún software que también interactúa de alguna manera con el cliente de EVE Online.

Conflictos conocidos actualmente:
* RivaTuner Statistics Server
* MSI Afterburner (Si ejetuca RivaTuner)
* FRAPS
* En muy raras ocasiones, Windows Defender

Compatibilidad confirmada:
* EVE-O Preview (¡Incluso puedes ver EveVision en las ventanas de previsualización)

¡Queremos conocer los conflictos existentes para poder solucionarlos! Por favor, si parece que no puede lograr que EveVision funcione, [únase a nuestro canal Discord](https://discord.gg/wWMasVf) y ayúdenos a descubrir lo está provocando ese mal funcionamiento.

# Herramientas disponibles:

### Genéricas
* [Google](https://google.com/)
* [DuckDuckGo](https://duckduckgo.com/)

### Industria
* [Fuzzwork](https://www.fuzzwork.co.uk/)
* [EveMarketer](https://evemarketer.com/)
* [Janice Junk Evaluator](https://janice.e-351.com/)
* [Evepraisal](https://evepraisal.com/)
* [Ore Tables](https://ore.cerlestes.de/ore)
* [Abyssal Market](https://mutaplasmid.space/)
* [EVE Mogul](https://www.eve-mogul.com/)

### Comunicación
* [Google Translate](https://translate.google.com/)
* [DeepL Translate](https://www.deepl.com/en/translator)
* [Discord](https://discordapp.com/app)

### Exploración
* [Dotlan](https://evemaps.dotlan.net/)
* [EveEye](https://eveeye.com/)
* [DScan](https://dscan.info/)
* [Tripwire](https://tripwire.eve-apps.com/)
* [Thera Map](https://www.eve-scout.com/thera/map/)
* [Siggy](https://siggy.borkedlabs.com/)
* [Anoikis](https://anoik.is/)

### Información
* [ZKillboard](https://zkillboard.com/)
* [EVEWho](https://evewho.com/)
* [EVE University](https://wiki.eveuniversity.org/)

### Entretenimiento
* EVE Jukebox
* [Youtube](https://www.youtube.com/)
* [Soundcloud](https://www.soundcloud.com/)
* [Reddit](https://reddit.com/r/eve)

# Cumplimiento del EULA
EveVision cumple con el EULA legal igual que las superposiciones de Discord, TeamSpeak o Mumble. CCP hablo sobre este tipo de herramientas hace años: https://www.eveonline.com/article/overlays-isk-buyer-amnesty-and-account-security

>Podemos, a nuestro criterio, tolerar el uso de aplicaciones u otro software que simplemente mejoren la experiencia del jugador de una manera que se mantenga un juego justo. SIEMPRE que sea justo para todos y ni usted ni nadie obtenga una ventaja injusta, estamos de acuerdo con ello.

>Por ejemplo, el uso de programas que proporcionan superposiciones en el juego (Mumble, Teamspeak) no es algo que nos planteemos vigilar activamente en estos momentos.
>Este es un ejemplo de algo que NO consideramos injusto, por ahora. Esto también incluye otras superposiciones en el juego que NO te otorgan ninguna ventaja injusta.
>No consideramos una ventaja injusta si puede ver quién está hablando actualmente en su herramienta de comunicación de voz a través de una superposición en el juego.

Lo más importante, esto no se limita a Mumble o Teamspeak:

>Tampoco consideramos injusto si usa otras superposiciones que aporten comodidad y que no afecten a la forma en que se juega el juego. Esto incluye superposiciones para aplicaciones de chat e IM, la superposición de Steam y las superposiciones de navegadores web, por ejemplo.
>
Esta herramienta no puede leer la pantalla o realizar acciones en el juego de forma automática (Exceptuando las realizadas a través del ESI). Solo se superpone sobre EVE e intercepta los clicks con el fin de interactuar con las ventanas de EveVision.

Sin embargo, ten en cuenta que CCP siempre tiene la última palabra. Podrían decidir en el futuro que EveVision es demasiado y que no debería permitirse su uso, pero en la postura actual de CCP no existe riesgo de baneo. Además de esto, los complementos no oficiales que se desarrollen en el futuro no se incluirán en EveVision si brindan una ventaja injusta, o si van en contra del EULA

# Para Nerds

![Build Status](https://github.com/evevision/evevision/workflows/build/badge.svg?branch=master)
![GitHub commits since latest release](https://img.shields.io/github/commits-since/evevision/evevision/latest/master)
![GitHub commit activity](https://img.shields.io/github/commit-activity/w/evevision/evevision)
![Electron Version](https://img.shields.io/github/package-json/dependency-version/evevision/evevision/electron)
![React Version](https://img.shields.io/github/package-json/dependency-version/evevision/evevision/react)

¿Quieres jugar con tus propias herramientas en EVE? ¡Es extremadamente fácil crear y ejecutar herramientas con EveVision por ti mismo! Una vez que esté en funcionamiento, puedes ejecutar un solo comando y ver cómo se actualizan sus componentes en tiempo real directamente en el juego a medida que guarda los cambios, al igual que el desarrollo web normal.

![editing](https://user-images.githubusercontent.com/62183293/79146670-bc87cb00-7d90-11ea-9875-815d759dd133.gif)

Se están revisando los problemas y las solicitudes de extracción. Si tienes alguna idea, ¡Únete a Discord y te haré saber si lo consigo!

##### Si planeas crear herramientas privadas para alianzas o corporaciones, ten en cuenta que el núcleo de este software no está destinado a ser modificado para su distribución por separado, y la licencia impide hacerlo sin liberar el código fuente completo. En un futuro cercano habrá un sistema de complementos que te permitirá distribuir herramientas de forma segura.

### Consejos
EveVision consta de los siguientes componentes:
* Electron dentro de la aplicación con una base de código dividida para los procesos principales y la renderizacion.
* Superposición DLL que se inyecta en los procesos del cliente EVE durante la superposición
* Modulo nativo para inyectar y comunicarse con la superposición DLL en [app/main/native](app/main/native). 
* Esquemas FlatBuffer que se utilizan para la comunicación entre el DLL y el modulo del nodo nativo en [flatbuffers/schema](flatbuffers/schema)

Si nunca antes has trabajado con Electron, lo principal que debes saber es que hay un proceso principal que usa NodeJS y luego renderiza los procesos para cada ventana en Chromium. Tienen dos conjuntos diferentes de código, dos puntos de entrada diferentes y se comunican a través del módulo IPC de Electron.

**Es el proceso de renderización donde los desarrolladores web se sentirán más como en casa, ya que no está haciendo nada más que desarrollar una aplicación React cargada por Chromium.** Aquí es donde está la interfaz de usuario real, en lugar de toda la ventana, entrada y código de administración de procesos.

En muchos sentidos, los procesos principales y de renderizador comparten la misma relación que la interfaz de backend y frontend de un sitio web.

Tenga en cuenta que puede descartar la mayoría de problemas con el modo de producción y desarrollo. El único momento en que necesita probar el empaquetado de la aplicación es cuando se introducen nuevos archivos de recursos, lo que no debería suceder con frecuencia.

## Compilación

Esta aplicación solo se puede compilar y ejecutar en Windows x64. Sin embargo, es extraordinariamente fácil hacerlo, ¡No se requiere experiencia previa en desarrollo de Windows! Soy principalmente un desarrollador de Linux, y los repositorios de Windows también me dan miedo. Cada cosa se controla por ti a través de yarn scripts.

Necesitas tener lo siguiente instalado:
* [Python 2](https://www.python.org/ftp/python/2.7.17/python-2.7.17.amd64.msi)
* [Node v12](https://nodejs.org/dist/v12.16.2/node-v12.16.2-x64.msi)
* [Yarn Package Manager](https://classic.yarnpkg.com/latest.msi)
* [Visual Studio 2017-2019 Build Tools](https://visualstudio.microsoft.com/thank-you-downloading-visual-studio/?sku=BuildTools&rel=16#) (Solo necesitas las herramientas de compilación C++)

Descargue el repositorio duplicándolo u obteniendo el ZIP y extrayéndolo en un directorio local de tu elección.

#### Generar un ejecutable empaquetado
Ejecuta el paquete yarn y se generará un ejecutable empaquetado con `release/EveVision.exe`.

Todos los componentes se compilaran para garantizar que se empaquete el último código. Para reempaquetar rápidamente la aplicación sin ejecutar ninguna compilación, use `yarn package-skip-build` en su lugar.

#### Modo de desarrollo
Simplemente ejecuta yarn dev Todos los componentes se construirán de antemano para garantizar la ejecución del último código. Para iniciar rápidamente el modo de desarrollo sin ejecutar ninguna compilación, ejecuta yarn dev-skip-build en su lugar. La recarga en caliente estará habilitada para que puedas ver tus cambios dentro de EVE en tiempo real.

#### Modo producción
Para construir y ejecutar EveVision pero sin empaquetarlo en un EXE, simplemente ejecuta yarn satart. Para ejecutar rápidamente la aplicación sin ejecutar ninguna compilación, usa yarn start-skip-build en su lugar.

#### Hacer cambios en C++
Si realizas algún cambio en C ++, debes tener en cuenta algunas cosas:
* No necesariamente tienes que cerrar EVE antes de inyectar una nueva versión de la superposición. Las versiones antiguas se quedan ahí sin hacer nada. Sin embargo, generalmente es una buena idea.
* Después de realizar los cambios en el DLL de superposición, ejecuta la yarn build-overlay. No tiene que reiniciar EveVision para que pueda inyectar la última DLL.
* Después de realizar cambios en el módulo nativo del nodo, ejecute yarn build-native. Deberá reiniciar EveVision. Todos los comandos de compilación se ejecutan de antemano con yarn dev, yarn start y yarn package.

All build commands are run beforehand with `yarn dev`, `yarn start`, and `yarn package`.

## Agradecimientos
Este proyecto está inspirado en partes del código creado por https://github.com/hiitiger/gelectron
