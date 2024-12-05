import log from "../../../controllers/Logger";
import type { IFileCMS, IPageItemCMS, IPageItemConfig, ISnippetItemCMS } from "../DTO/CMS";
import { http } from "../http";

export async function loadCMSPagesReq(locale: string): Promise<IPageItemConfig[] | undefined> {
    try {
        const { data } = await http({ locale }).get<IPageItemConfig[]>(`/api/cms/pages?l=${ locale }`);
        return data;
    } catch (err) {
        log.error("LOAD_STATIC_PAGES_ERROR", err);
    }
}

export async function loadCMSSnippetsReq(locale: string): Promise<ISnippetItemCMS[] | undefined> {
    try {
        const { data } = await http({ locale }).get<ISnippetItemCMS[]>(`/api/cms/snippets?l=${ locale }`);
        return data;
    } catch (err) {
        log.error("LOAD_STATIC_SNIPPETS_ERROR", err);
    }
}

export async function loadAllFilesFromCMSReq(locale: string): Promise<IFileCMS[]> {
    try {
        const { data } = await http({ locale }).get<IFileCMS[]>(`/api/cms/files?l=${ locale }`);
        return data;
    } catch (err) {
        log.error("LOAD_ALL_FILES_ERROR", err);
        throw err;
    }
}

export async function loadPageContentFromCmsReq(slugPage: string, locale: string): Promise<IPageItemCMS | void> { // TODO: rename
    try {
        const { data } = await http({ locale }).get<IPageItemCMS>(`/api/cms/pages/${ slugPage }?l=${ locale }`);
        return data;
    } catch (err) {
        log.error("LOAD_PAGE_CONTENT_FORM_CMS_REQ_ERROR", err);
        throw err;
    }
}

export async function loadMetaSEOReq(url: string, locale: string): Promise<IPageItemCMS | void> {
    try {
        const { data } = await http({ locale }).get<IPageItemCMS>(`/api/cms/pages${ url }?l=${ locale }`);
        return data;
    } catch (err) {
        log.error("LOAD_SEO_META_REQ_ERROR", err);
        throw err;
    }
}
