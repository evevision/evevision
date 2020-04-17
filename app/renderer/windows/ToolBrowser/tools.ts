export interface ExternalToolResizeConfig {
    minWidth?: number,
    minHeight?: number,
    maxWidth?: number,
    maxHeight?: number
}

export interface ExternalToolMeta {
    url: string,
    iconOverride?: string,
    initialWidth?: number,
    initialHeight?: number,
    resizable?: ExternalToolResizeConfig
}

export interface ToolDescription {
    name: string,
    author: string,
    external?: ExternalToolMeta,
    windowName?: string,
    tags: string[]
}

const tools: ToolDescription[] = [
    {
        name: "Jukebox",
        author: "RisingSon",
        tags: ["music"],
        windowName: "jukebox"
    },
    {
        name: "EveEye Explorer",
        author: "RisingSon",
        tags: ["exploration"],
        external: {
            url: "https://eveeye.com/"
        }
    },
    {
        name: "Fuzzwork",
        author: "Steve Ronuken",
        tags: ["industry"],
        external: {
            url: "https://www.fuzzwork.co.uk/"
        }
    },
    {
        name: "EveMarketer",
        author: "Aplulu",
        tags: ["market"],
        external: {
            url: "https://evemarketer.com/"
        }
    },
    {
        name: "Evepraisal",
        author: "sudorandom",
        tags: ["trading", "appraisal"],
        external: {
            url: "https://evepraisal.com/"
        }
    },
    {
        name: "Ore Tables",
        author: "cerlestes",
        tags: ["industry", "mining"],
        external: {
            url: "https://ore.cerlestes.de/ore",
        }
    },
    {
        name: "Abyssal Markets",
        author: "Sharad Heft",
        tags: ["industry", "trading", "deadspace"],
        external: {
            url: "https://mutaplasmid.space/"
        }
    },
    {
        name: "EVE-Mogul",
        author: "Jeronica",
        tags: ["industry", "trading"],
        external: {
            url: "https://www.eve-mogul.com/"
        }
    },
    {
        name: "Dotlan",
        author: "Daniel Hoffend",
        tags: ["exploration"],
        external: {
            url: "https://evemaps.dotlan.net/"
        }
    },
    {
        name: "Tripwire",
        author: "Daimian Mercer",
        tags: ["exploration", "wormhole"],
        external: {
            url: "https://tripwire.eve-apps.com/"
        }
    },
    {
        name: "Thera Maps",
        author: "Signal Cartel",
        tags: ["exploration", "wormhole"],
        external: {
            url: "https://www.eve-scout.com/thera/map/"
        }
    },
    {
        name: "Siggy",
        author: "borkedLabs",
        tags: ["exploration", "wormhole"],
        external: {
            url: "https://siggy.borkedlabs.com/"
        }
    },
    {
        name: "Anoikis",
        author: "Eric Wastl",
        tags: ["exploration", "wormhole"],
        external: {
            url: "http://anoik.is/"
        }
    },
    {
        name: "ZKillboard",
        author: "Squizz Caphinator",
        tags: ["killboard"],
        external: {
            url: "https://zkillboard.com"
        }
    },
    {
        name: "EVEWho",
        author: "Squizz Caphinator",
        tags: ["information"],
        external: {
            url: "https://evewho.com"
        }
    },
]

export default tools;