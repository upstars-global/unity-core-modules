import type { IPageItemCMS, IPageItemConfig } from "../services/api/DTO/CMS";

export interface IPageCMSPrepare extends IPageItemConfig {
    slug: string;
    url: string;
    hidden: boolean;
    pageType: "static";
}

enum EnumCategories {
    bottomMenu = "bottom-menu",
    bottomMenuHelp = "bottom-menu-help",
    customPage = "custom-page",
    page = "page",
    seoPage = "seo-page",
    termsPage = "terms-page",
    topMenu = "top-menu"
}

export interface ICurrentPageMeta {
    metaDescription: string;
    metaKeywords: string;
    metaTitle: string;
    json: string;
    mainContent: string;
    blocks?: Record<string, unknown>;
}

export interface ICurrentPage {
    content: string;
    id: string;
    slug: string;
    title: string;
    meta: ICurrentPageMeta;
    json: Record<string, unknown>
}

export interface IStaticPage {
    id: string;
    title: string;
    slug: string;
    url: string;
    hidden: false;
    pageType: string;
    categories: EnumCategories[];
    path: string;
    layout: "default";
}

export class CurrentPage implements ICurrentPage {
    content: string;
    id: string;
    slug: string;
    title: string;
    contentMain: string;
    json: Record<string, unknown>;
    meta: ICurrentPageMeta;

    constructor(data: IPageItemCMS) {
        this.id = data.id;
        this.content = data.content;
        this.slug = data.path;
        this.title = data.title;
        this.contentMain = data.blocks?.["content-main"] || "";
        this.json = JSON.parse(data.blocks?.json || "{}");
        this.meta = {
            metaDescription: data.blocks?.description || "",
            metaKeywords: data.blocks?.keywords || "",
            metaTitle: data.blocks?.title || "",
            json: JSON.parse(data.blocks?.json || "{}"),
            mainContent: data.blocks?.["content-main"] || "",
        };
    }
}
