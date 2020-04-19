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
    description: string,
    external?: ExternalToolMeta,
    windowName?: string,
    tags: string[]
}

const tools: ToolDescription[] = [
    {
        name: "Jukebox",
        author: "Niedar",
        description: "Listen to the EVE soundtrack like the old days",
        tags: ["music"],
        windowName: "jukebox"
    },
    {
        name: "EveEye Explorer",
        author: "RisingSon",
        description: "Advanced mapping and exploration tool",
        tags: ["exploration"],
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
        tags: ["market"],
        external: {
            url: "https://evemarketer.com/"
        }
    },
    {
        name: "Evepraisal",
        author: "sudorandom",
        description: "Quickly find out how much items are worth in Jita",
        tags: ["trading", "appraisal"],
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
            url: "https://ore.cerlestes.de/ore",
        }
    },
    {
        name: "Abyssal Markets",
        author: "Sharad Heft",
        description: "A marketplace for buying, selling, and appraising Abyssal modules",
        tags: ["industry", "trading", "deadspace"],
        external: {
            url: "https://mutaplasmid.space/"
        }
    },
    {
        name: "EVE-Mogul",
        author: "Jeronica",
        description: "An all-in-one tool to help you make more ISK as a trader in New Eden",
        tags: ["industry", "trading"],
        external: {
            url: "https://www.eve-mogul.com/"
        }
    },
    {
        name: "Dotlan",
        author: "Daniel Hoffend",
        description: "The most well known mapping tool of New Eden",
        tags: ["exploration"],
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
        description: "Maps of wormholes to and from Thera maintained by Signal Cartel",
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
        tags: ["killboard"],
        external: {
            url: "https://zkillboard.com"
        }
    },
    {
        name: "EVEWho",
        author: "Squizz Caphinator",
        description: "Find information on any character, corporation, or alliance in New Eden.",
        tags: ["information"],
        external: {
            url: "https://evewho.com"
        }
    },
    {
        name: "SoundCloud",
        author: "SoundCloud",
        description: "Muzak, yo.",
        tags: ["music"],
        external: {
            url: "https://google.com"
        }
    },
]

const tagCounts: {tag: string, count: number}[] = []

tools.forEach(tool => {
    tool.tags.forEach(tag => {
        const tagCount = tagCounts.find(tc => tc.tag === tag);
        if (tagCount) {
            tagCount.count += 1;
        } else {
            tagCounts.push({tag: tag, count: 1});
        }
    })
})

const allTags: string[] = []

tagCounts.sort((a,b) => b.count-a.count).forEach(tagCount => allTags.push(tagCount.tag))

export const AllTags = allTags;

export default tools;