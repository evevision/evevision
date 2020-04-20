import { ExternalToolMeta } from "../../externaltool";

export interface ToolDescription {
  name: string;
  author: string;
  description: string;
  external?: ExternalToolMeta;
  windowName?: string;
  tags: string[];
  icon?: string;
}

const tools: ToolDescription[] = [
  //
  // EVE tools
  //
  {
    name: "Jukebox",
    author: "Niedar",
    description: "Listen to the EVE soundtrack like the old days",
    tags: ["media"],
    windowName: "jukebox"
  },
  {
    name: "Janice Junk Evaluator",
    author: "E-351",
    description: "Appraises space junk for you, with a few more nifty features",
    tags: ["appraisal"],
    external: {
      url: "https://janice.e-351.com/",
      initialWidth: 800,
      initialHeight: 465,
      resizable: {
        minWidth: 800,
        minHeight: 465,
        maxWidth: 1020,
        maxHeight: 785
      }
    }
  },
  {
    name: "EveEye Explorer",
    author: "RisingSon",
    description: "Advanced mapping and exploration tool",
    tags: ["exploration", "intel"],
    external: {
      url: "https://eveeye.com/",
      initialWidth: 1200,
      initialHeight: 720,
      resizable: {
        minWidth: 400,
        minHeight: 300
      }
    }
  },
  {
    name: "Fuzzwork",
    author: "Steve Ronuken",
    description: "A variety of EVE tools",
    tags: ["industry", "mining", "pi"],
    external: {
      url: "https://www.fuzzwork.co.uk/",
      initialWidth: 675,
      initialHeight: 335,
      resizable: {
        minWidth: 675,
        minHeight: 335
      }
    }
  },
  {
    name: "EveMarketer",
    author: "Aplulu",
    description: "Look up orders across all of New Eden",
    tags: ["industry", "trade"],
    external: {
      url: "https://evemarketer.com/",
      initialWidth: 1000,
      initialHeight: 550,
      resizable: {
        minWidth: 400,
        minHeight: 300
      }
    }
  },
  {
    name: "Evepraisal",
    author: "sudorandom",
    description: "Quickly find out how much items are worth in Jita",
    tags: ["industry", "appraisal", "trade"],
    external: {
      url: "https://evepraisal.com/",
      initialWidth: 600,
      initialHeight: 410,
      resizable: {
        minWidth: 600,
        minHeight: 410
      }
    }
  },
  {
    name: "Ore Tables",
    author: "cerlestes",
    description: "Tables of values for ore",
    tags: ["industry", "mining"],
    external: {
      url: "https://ore.cerlestes.de/ore",
      initialWidth: 1010,
      initialHeight: 580,
      resizable: {
        minWidth: 585,
        minHeight: 200
      }
    }
  },
  {
    name: "Abyssal Markets",
    author: "Sharad Heft",
    description:
      "A marketplace for buying, selling, and appraising Abyssal modules",
    tags: ["industry", "trade", "deadspace"],
    external: {
      url: "https://mutaplasmid.space/",
      initialWidth: 615,
      initialHeight: 784,
      resizable: {
        minWidth: 615,
        minHeight: 225
      }
    }
  },
  {
    name: "EVE-Mogul",
    author: "Jeronica",
    description:
      "An all-in-one tool to help you make more ISK as a trader in New Eden",
    tags: ["industry", "trade"],
    external: {
      url: "https://www.eve-mogul.com/",
      initialWidth: 1000,
      initialHeight: 520,
      resizable: {
        minWidth: 1000,
        minHeight: 520
      }
    }
  },
  {
    name: "Dotlan",
    author: "Daniel Hoffend",
    description: "The most well known mapping tool of New Eden",
    tags: ["exploration", "intel"],
    external: {
      url: "https://evemaps.dotlan.net/",
      initialWidth: 1055,
      initialHeight: 200,
      resizable: {
        minWidth: 1055,
        minHeight: 300
      }
    }
  },
  {
    name: "Tripwire",
    author: "Daimian Mercer",
    description: "A secure open source wormhole mapping tool",
    tags: ["exploration", "wormhole", "intel"],
    external: {
      url: "https://tripwire.eve-apps.com/",
      initialWidth: 880,
      initialHeight: 510,
      resizable: {
        minHeight: 430,
        minWidth: 360
      }
    }
  },
  {
    name: "Thera Maps",
    author: "Signal Cartel",
    description:
      "Maps of wormholes to and from Thera maintained by Signal Cartel",
    tags: ["exploration", "wormhole"],
    external: {
      url: "https://www.eve-scout.com/thera/map/",
      initialWidth: 1020,
      initialHeight: 555,
      resizable: {
        minWidth: 400,
        minHeight: 400
      }
    }
  },
  {
    name: "Siggy",
    author: "borkedLabs",
    description: "One of the oldest wormhole tools in New Eden. Not free.",
    tags: ["exploration", "wormhole"],
    external: {
      url: "https://siggy.borkedlabs.com/",
      initialWidth: 820,
      initialHeight: 430,
      resizable: {
        minWidth: 500,
        minHeight: 500
      }
    }
  },
  {
    name: "Anoikis",
    author: "Eric Wastl",
    description: "A wormhole exploration tool",
    tags: ["exploration", "wormhole"],
    external: {
      url: "http://anoik.is/",
      initialWidth: 685,
      initialHeight: 450,
      resizable: {
        minWidth: 685,
        minHeight: 230
      }
    }
  },
  {
    name: "ZKillboard",
    author: "Squizz Caphinator",
    description: "The most popular source for killmails",
    tags: ["intel"],
    external: {
      url: "https://zkillboard.com",
      initialWidth: 1065,
      initialHeight: 775,
      resizable: {
        minWidth: 400,
        minHeight: 400
      }
    }
  },
  {
    name: "EVEWho",
    author: "Squizz Caphinator",
    description:
      "Find info on any character, corporation, or alliance in New Eden.",
    tags: ["info", "intel"],
    external: {
      url: "https://evewho.com",
      initialWidth: 1200, // this is so big because of the ridiculously huge ad at the top
      initialHeight: 980,
      resizable: {
        minWidth: 400,
        minHeight: 400
      }
    }
  },
  {
    name: "DScan Info",
    author: "Unknown Author",
    description: "Copy directional scan info to share with fleet members",
    tags: ["intel"],
    external: {
      url: "https://dscan.info",
      initialWidth: 600,
      initialHeight: 450,
      resizable: {
        minWidth: 500,
        minHeight: 400
      }
    }
  },
  {
    name: "EVE-Uni Wiki",
    author: "EVE University",
    description: "The best source of info for anything in EVE",
    tags: ["info"],
    external: {
      url: "https://wiki.eveuniversity.org/",
      initialWidth: 1050,
      initialHeight: 550,
      resizable: {
        minWidth: 722, // there's an issue with the search bar breaking
        minHeight: 250
      }
    }
  },
  {
    name: "EVE PRISM",
    author: "Kpekep",
    description:
      "A beautiful way to analyze what's going on in New Eden.<br><br/>This was made by Kpekep, who passed away on March 6th, 2019. His goal was to create the best intel tool in New Eden. He succeeded.<br/><br/>Rest in peace, capsuleer.",
    tags: ["intel"],
    external: {
      url: "https://eve-prism.com/",
      initialWidth: 1400,
      initialHeight: 942,
      resizable: {
        minWidth: 1224,
        minHeight: 942
      }
    }
  },
  {
    name: "EVE Forums",
    author: "CCP",
    description: "The official EVE Online forums",
    tags: ["communication", "info"],
    external: {
      url: "https://forums.eveonline.com/",
      initialWidth: 1400,
      initialHeight: 900,
      resizable: {
        minWidth: 575,
        minHeight: 250
      }
    }
  },
  {
    name: "EVE Market Watch",
    author: "Rihan Shazih",
    description: "Lets you know when markets run out of stock.",
    tags: ["industry", "trade"],
    external: {
      url: "https://evemarketwatch.com/",
      initialWidth: 700,
      initialHeight: 505,
      resizable: {
        minWidth: 250,
        minHeight: 250
      }
    }
  },
  {
    name: "Abyss Tracker",
    author: "Veetor Nara",
    description:
      "Track and compare your Abyss runs, how much your loot is worth, and what kind of filaments are popular.",
    tags: ["deadspace"],
    external: {
      url: "https://abyss.eve-nt.uk/",
      initialWidth: 1250,
      initialHeight: 645,
      resizable: {
        minWidth: 600,
        minHeight: 350
      }
    }
  },
  {
    name: "Pathfinder",
    author: "Exodus 4D",
    description:
      "An extremely good looking and powerful tool for mapping EVE and sharing said maps.",
    tags: ["exploration", "wormhole", "intel"],
    external: {
      url: "https://www.pathfinder-w.space/",
      initialWidth: 600,
      initialHeight: 500,
      resizable: {
        minWidth: 600,
        minHeight: 350
      }
    }
  },
  {
    name: "Adam4Eve",
    author: "Ethan02, Engelbert Tristram",
    description:
      "An extremely good looking and powerful tool for mapping EVE and sharing said maps.",
    tags: ["industry", "trade", "pi"],
    external: {
      url: "https://www.adam4eve.eu/",
      initialWidth: 1250,
      initialHeight: 645,
      resizable: {
        minWidth: 600,
        minHeight: 350
      }
    }
  },
  //
  // Non EVE tools
  //
  {
    name: "SoundCloud",
    author: "SoundCloud",
    description: "All the music you would ever need",
    tags: ["media"],
    external: {
      url: "https://soundcloud.com",
      initialWidth: 1050,
      initialHeight: 670,
      resizable: {
        minWidth: 990,
        minHeight: 90
      }
    }
  },
  {
    name: "Google",
    author: "Google",
    description: "The one and only.",
    tags: ["info"],
    external: {
      url: "https://google.com",
      initialWidth: 1010,
      initialHeight: 550,
      resizable: {
        minWidth: 250,
        minHeight: 250
      }
    }
  },
  {
    name: "DuckDuckGo",
    author: "DuckDuckGo",
    description: "If you don't like Google. Honk.",
    tags: ["info"],
    external: {
      url: "https://duckduckgo.com",
      initialWidth: 500,
      initialHeight: 350,
      resizable: {
        minWidth: 250,
        minHeight: 250
      }
    }
  },
  {
    name: "Google Translator",
    author: "Google",
    description: "The world's most popular translator",
    tags: ["communication"],
    external: {
      url: "https://translate.google.com/",
      initialWidth: 500,
      initialHeight: 525,
      resizable: {
        minWidth: 320,
        minHeight: 500
      }
    }
  },
  {
    name: "DeepL Translate",
    author: "DeepL",
    description:
      "An alternative translator some say works better for certain languages",
    tags: ["communication"],
    external: {
      url: "https://www.deepl.com/en/translator",
      initialWidth: 400,
      initialHeight: 450,
      resizable: {
        minWidth: 400,
        minHeight: 450
      }
    }
  },
  {
    name: "Discord",
    author: "Discord",
    description: "The chat app of choice for EVE players",
    tags: ["communication"],
    external: {
      url: "https://discordapp.com/app",
      initialWidth: 856,
      initialHeight: 622,
      resizable: {
        minWidth: 856,
        minHeight: 622
      }
    }
  },
  {
    name: "YouTube",
    author: "YouTube",
    description: "The one and only.",
    tags: ["media"],
    external: {
      url: "https://youtube.com",
      initialWidth: 800,
      initialHeight: 480,
      resizable: {
        minWidth: 250,
        minHeight: 250
      }
    }
  },
  {
    name: "Twitch",
    author: "Twitch",
    description: "Watch your favorite streamers directly in EVE!",
    tags: ["media"],
    external: {
      url: "https://www.twitch.tv/directory/game/EVE%20Online",
      initialWidth: 945,
      initialHeight: 900,
      resizable: {
        minWidth: 250,
        minHeight: 250
      }
    }
  },
  {
    name: "YouTube Music",
    author: "YouTube",
    description: "YouTube, but for music!",
    tags: ["media"],
    external: {
      url: "https://music.youtube.com/",
      initialWidth: 720,
      initialHeight: 450,
      resizable: {
        minWidth: 140,
        minHeight: 100
      }
    }
  },
  {
    name: "Windows PowerShell",
    author: "Microsoft",
    description: "Opens a PowerShell terminal. Perfect for developers.",
    tags: ["other"],
    windowName: "terminal"
  }
];

export const defaultFavorites: string[] = [
  "ZKillboard",
  "DScan Info",
  "Google Translator"
];

export default tools;
