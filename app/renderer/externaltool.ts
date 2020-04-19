export interface ExternalToolResizeConfig {
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
}

export interface ExternalToolMeta {
    url: string;
    initialWidth?: number;
    initialHeight?: number;
    resizable?: ExternalToolResizeConfig;
}