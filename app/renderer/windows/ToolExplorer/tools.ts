export interface ExternalToolResizeConfig {
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export interface ExternalToolMeta {
  url: string;
  iconOverride?: string;
  initialWidth?: number;
  initialHeight?: number;
  resizable?: ExternalToolResizeConfig;
}

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
    description: "Appraises items for you, with a few more nifty features",
    tags: ["appraisal"],
    external: {
      url: "https://janice.e-351.com/"
    }
  },
  {
    name: "EveEye Explorer",
    author: "RisingSon",
    description: "Advanced mapping and exploration tool",
    tags: ["exploration", "intel"],
    external: {
      url: "https://eveeye.com/"
    }
  },
  {
    name: "Fuzzwork",
    author: "Steve Ronuken",
    description: "A variety of industry tools",
    tags: ["industry"],
    external: {
      url: "https://www.fuzzwork.co.uk/"
    }
  },
  {
    name: "EveMarketer",
    author: "Aplulu",
    description: "Look up orders across all of New Eden",
    tags: ["industry", "trade"],
    external: {
      url: "https://evemarketer.com/"
    }
  },
  {
    name: "Evepraisal",
    author: "sudorandom",
    description: "Quickly find out how much items are worth in Jita",
    tags: ["industry", "appraisal"],
    external: {
      url: "https://evepraisal.com/"
    }
  },
  {
    name: "Ore Tables",
    author: "cerlestes",
    description: "Tables of values for ore",
    tags: ["industry", "mining"],
    external: {
      url: "https://ore.cerlestes.de/ore"
    }
  },
  {
    name: "Abyssal Markets",
    author: "Sharad Heft",
    description:
      "A marketplace for buying, selling, and appraising Abyssal modules",
    tags: ["industry", "trade", "deadspace"],
    external: {
      url: "https://mutaplasmid.space/"
    }
  },
  {
    name: "EVE-Mogul",
    author: "Jeronica",
    description:
      "An all-in-one tool to help you make more ISK as a trader in New Eden",
    tags: ["industry", "trade"],
    external: {
      url: "https://www.eve-mogul.com/"
    }
  },
  {
    name: "Dotlan",
    author: "Daniel Hoffend",
    description: "The most well known mapping tool of New Eden",
    tags: ["exploration", "intel"],
    external: {
      url: "https://evemaps.dotlan.net/"
    }
  },
  {
    name: "Tripwire",
    author: "Daimian Mercer",
    description: "A secure open source wormhole mapping tool",
    tags: ["exploration", "wormhole"],
    external: {
      url: "https://tripwire.eve-apps.com/"
    }
  },
  {
    name: "Thera Maps",
    author: "Signal Cartel",
    description:
      "Maps of wormholes to and from Thera maintained by Signal Cartel",
    tags: ["exploration", "wormhole"],
    external: {
      url: "https://www.eve-scout.com/thera/map/"
    }
  },
  {
    name: "Siggy",
    author: "borkedLabs",
    description: "One of the oldest wormhole tools in New Eden. Not free.",
    tags: ["exploration", "wormhole"],
    external: {
      url: "https://siggy.borkedlabs.com/"
    }
  },
  {
    name: "Anoikis",
    author: "Eric Wastl",
    description: "A wormhole exploration tool",
    tags: ["exploration", "wormhole"],
    external: {
      url: "http://anoik.is/"
    }
  },
  {
    name: "ZKillboard",
    author: "Squizz Caphinator",
    description: "The most popular source for killmails",
    tags: ["intel"],
    external: {
      url: "https://zkillboard.com"
    }
  },
  {
    name: "EVEWho",
    author: "Squizz Caphinator",
    description:
      "Find info on any character, corporation, or alliance in New Eden.",
    tags: ["info"],
    external: {
      url: "https://evewho.com"
    }
  },
  {
    name: "DScan Info",
    author: "Unknown Author",
    description: "Copy directional scan info to share with fleet members",
    tags: ["intel"],
    external: {
      url: "https://dscan.infoi"
    }
  },
  {
    name: "EVE-Uni Wiki",
    author: "EVE University",
    description: "The best source of info for anything in EVE",
    tags: ["info"],
    external: {
      url: "https://wiki.eveuniversity.org/"
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
      url: "https://soundcloud.com"
    }
  },
  {
    name: "Google",
    author: "Google",
    description: "The one and only.",
    tags: ["info"],
    external: {
      url: "https://google.com"
    }
  },
  {
    name: "DuckDuckGo",
    author: "DuckDuckGo",
    description: "If you don't like Google. Honk.",
    tags: ["info"],
    external: {
      url: "https://duckduckgo.com"
    }
  },
  {
    name: "Google Translator",
    author: "Google",
    description: "The world's most popular translator",
    tags: ["communication"],
    external: {
      url: "https://translate.google.com/"
    }
  },
  {
    name: "DeepL Translate",
    author: "DeepL",
    description:
      "An alternative translator some say works better for certain languages",
    tags: ["communication"],
    external: {
      url: "https://www.deepl.com/en/translator"
    }
  },
  {
    name: "Discord",
    author: "Discord",
    description: "The chat app of choice for EVE players",
    tags: ["communication"],
    external: {
      url: "https://discordapp.com/app"
    }
  },
  {
    name: "YouTube",
    author: "YouTube",
    description: "The one and only.",
    tags: ["media"],
    external: {
      url: "https://youtube.com"
    }
  },
  {
    name: "Twitch",
    author: "Twitch",
    description: "Watch your favorite streamers directly in EVE!",
    tags: ["media"],
    external: {
      url: "https://www.twitch.tv/directory/game/EVE%20Online"
    }
  },
  {
    name: "YouTube Music",
    author: "YouTube",
    description: "YouTube, but for music!",
    tags: ["media"],
    external: {
      url: "https://music.youtube.com/"
    }
  }
];

export default tools;
