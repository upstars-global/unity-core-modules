import type { IPageItemCMS, IPageItemConfig } from "../services/api/DTO/CMS";
import { IRedeemableCards } from "../services/api/DTO/compPoints";
import { Currencies } from "./enums/currencies";

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

type JsonFields = {
    maxWin?: Record<Currencies, number>;
    cards?: Record<string, IRedeemableCards[]>;
    [key: string]: unknown;
}

interface ISeoMeta {
    json?: string;
    metaDescription: string;
    metaTitle: string;
    metaKeywords?: string;
    content?: string;
}

export interface ICurrentPageMeta {
    metaDescription?: string;
    metaKeywords?: string;
    metaTitle?: string;
    json?: string;
    mainContent?: string;
    blocks?: string;
    content?: string;

}

export interface ICurrentPage {
    content: string;
    id: string;
    slug: string;
    title: string;
    meta: ICurrentPageMeta;
    json: JsonFields;
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
    json: JsonFields;
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
