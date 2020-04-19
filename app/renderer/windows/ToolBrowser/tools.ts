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
        author: "Niedar",
        tags: ["core", "music"],
        windowName: "jukebox"
    },
    {
        name: "EveEye Explorer",
        author: "RisingSon",
        tags: ["third party", "exploration"],
        external: {
            url: "https://eveeye.com/"
        }
    },
    {
        name: "Fuzzwork",
        author: "Steve Ronuken",
        tags: ["third party", "industry"],
        external: {
            url: "https://www.fuzzwork.co.uk/"
        }
    },
    {
        name: "EveMarketer",
        author: "Aplulu",
        tags: ["third party", "market"],
        external: {
            url: "https://evemarketer.com/"
        }
    },
    {
        name: "Evepraisal",
        author: "sudorandom",
        tags: ["third party", "trading", "appraisal"],
        external: {
            url: "https://evepraisal.com/"
        }
    },
    {
        name: "Ore Tables",
        author: "cerlestes",
        tags: ["third party", "industry", "mining"],
        external: {
            url: "https://ore.cerlestes.de/ore",
        }
    },
    {
        name: "Abyssal Markets",
        author: "Sharad Heft",
        tags: ["third party", "industry", "trading", "deadspace"],
        external: {
            url: "https://mutaplasmid.space/"
        }
    },
    {
        name: "EVE-Mogul",
        author: "Jeronica",
        tags: ["third party", "industry", "trading"],
        external: {
            url: "https://www.eve-mogul.com/"
        }
    },
    {
        name: "Dotlan",
        author: "Daniel Hoffend",
        tags: ["third party", "exploration"],
        external: {
            url: "https://evemaps.dotlan.net/"
        }
    },
    {
        name: "Tripwire",
        author: "Daimian Mercer",
        tags: ["third party", "exploration", "wormhole"],
        external: {
            url: "https://tripwire.eve-apps.com/"
        }
    },
    {
        name: "Thera Maps",
        author: "Signal Cartel",
        tags: ["third party", "exploration", "wormhole"],
        external: {
            url: "https://www.eve-scout.com/thera/map/"
        }
    },
    {
        name: "Siggy",
        author: "borkedLabs",
        tags: ["third party", "exploration", "wormhole"],
        external: {
            url: "https://siggy.borkedlabs.com/"
        }
    },
    {
        name: "Anoikis",
        author: "Eric Wastl",
        tags: ["third party", "exploration", "wormhole"],
        external: {
            url: "http://anoik.is/"
        }
    },
    {
        name: "ZKillboard",
        author: "Squizz Caphinator",
        tags: ["third party", "killboard"],
        external: {
            url: "https://zkillboard.com"
        }
    },
    {
        name: "EVEWho",
        author: "Squizz Caphinator",
        tags: ["third party", "information"],
        external: {
            url: "https://evewho.com"
        }
    },
    {
        name: "SoundCloud",
        author: "SoundCloud",
        tags: ["third party", "music"],
        external: {
            url: "https://soundcloud.com"
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