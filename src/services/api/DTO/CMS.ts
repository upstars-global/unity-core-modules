export interface IFileCMS {
    id: string;
    url: string;
    categories: string[];
    description: string;
}

export interface IPageItemCMS {
    categories: string[];
    path: string;
    layout: "default";
    id: string;
    title: string;
    content: string;
    blocks: {
        title: string;
        keywords: string;
        "content-main": string;
        description: string;
        json: string;
    };
}

export interface IPageItemConfig {
    categories: string[];
    path: string;
    layout: "default";
    id: string;
    title: string;
    children: IPageItemConfig[];
}

export interface ISnippetItemCMS {
    categories: string[];
    id: string;
    content: string;
}
