import {
    BANNER_CATEGORY_TERMS_CONDITIONS,
} from "@config/banners";
import { metaDataSSR } from "@theme/configs/meta";
import { storeToRefs } from "pinia";

import { log } from "../controllers/Logger";
import { isExistData } from "../helpers/isExistData";
import { replaceCurrentYearPlaceholder } from "../helpers/replaceStringHelper";
import { normalizeUrl, prepareMapStaticPages, resolveUrlFromRoute } from "../helpers/staticPages";
import { CurrentPage, ICurrentPage, ICurrentPageMeta } from "../models/CMS";
import { useBannerStore } from "../store/banners";
import { useCMS } from "../store/CMS";
import { useMultilangStore } from "../store/multilang";
import { IFileCMS } from "./api/DTO/CMS";
import {
    loadAllFilesFromCMSReq,
    loadCMSPagesReq,
    loadCMSSnippetsReq,
    loadPageContentFromCmsReq,
} from "./api/requests/CMS";

export async function loadStaticPages({ reload } = { reload: false }) {
    try {
        const cmsStore = useCMS();
        const { staticPages } = storeToRefs(cmsStore);
        const { getUserLocale } = storeToRefs(useMultilangStore());

        if (isExistData(staticPages.value) && !reload) {
            return staticPages.value;
        }

        const pages = await loadCMSPagesReq(getUserLocale.value);

        if (pages?.length) {
            cmsStore.setStaticPages(prepareMapStaticPages(pages));

            return pages;
        }

        throw new Error(`pages.length < 1, pages = ${pages}`);
    } catch (err) {
        log.error("STORE_LOAD_STATIC_PAGES_ERROR", err);
    }
}

export async function loadCMSSnippets({ reload = false } = {}) {
    const cmsStore = useCMS();
    const { snippets } = storeToRefs(cmsStore);
    const { getUserLocale } = storeToRefs(useMultilangStore());

    if (!reload && isExistData(snippets.value)) {
        return snippets.value;
    }

    const data = await loadCMSSnippetsReq(getUserLocale.value);

    if (data) {
        cmsStore.setSnippets(data);
    }

    return data;
}

export async function fetchCmsPageOnce(slug: string, locale?: string): ReturnType<typeof loadPageContentFromCmsReq> {
    const { inflight } = useCMS();
    const existingPromise = inflight.get(slug);

    if (existingPromise) {
        return existingPromise;
    }

    const promise = loadPageContentFromCmsReq(slug, locale)
        .finally(() => {
            setTimeout(() => inflight.delete(slug), 150);
        });

    inflight.set(slug, promise);

    return promise;
}

export async function loadCurrentStaticPage(slug: string) {
    const cmsStore = useCMS();
    const { contentCurrentPage } = storeToRefs(cmsStore);
    const { getUserLocale } = storeToRefs(useMultilangStore());

    cmsStore.setCurrentStaticPage(null);

    const staticErr = cmsStore.ensureStaticIfReady(slug);

    if (staticErr) {
        return staticErr;
    }

    const cached = contentCurrentPage.value[slug];

    if (cached) {
        cmsStore.setCurrentStaticPage(cached);

        return cached;
    }

    try {
        const data = await fetchCmsPageOnce(slug, getUserLocale.value);

        if (!data) {
            return `${ slug } page is not found`;
        }

        const page = replaceCurrentYearPlaceholder<ICurrentPage>(new CurrentPage(data));

        cmsStore.setCurrentStaticPage(page);
        cmsStore.setPageContent({ page, url: slug });

        return page;
    } catch (err) {
        log.error("LOAD_CURRENT_STATIC_PAGE", err);
        throw err;
    }
}

export async function loadMetaSEO(route: { path: string; name: string; meta?: { metaUrl: string } }) {
    const cmsStore = useCMS();
    const { seoMeta, contentCurrentPage } = storeToRefs(cmsStore);
    const { getUserLocale } = storeToRefs(useMultilangStore());
    const url = resolveUrlFromRoute(route);
    const slug = normalizeUrl(url);

    const staticErr = cmsStore.ensureStaticIfReady(slug);

    if (staticErr) {
        return staticErr;
    }

    const cachedMeta = seoMeta.value[url];
    const cachedPage = contentCurrentPage.value[slug];

    if (cachedMeta && cachedPage) {
        cmsStore.setCurrentStaticPage(cachedPage);

        return;
    }

    try {
        const data = await fetchCmsPageOnce(slug, getUserLocale.value);

        if (!data) {
            return `${ slug } page data is not found`;
        }

        const blocks = data.blocks;
        let meta: ICurrentPageMeta | null = null;

        if (blocks) {
            meta = {
                metaTitle: blocks.title,
                metaDescription: blocks.description,
                content: data.content,
                json: blocks.json,
            };
        } else {
            const fallback = metaDataSSR(getUserLocale.value);
            meta = {
                metaTitle: fallback?.title,
                metaDescription: fallback?.description,
                content: fallback?.content,
            };
        }

        meta = replaceCurrentYearPlaceholder<ICurrentPageMeta>(meta);
        const page = replaceCurrentYearPlaceholder<ICurrentPage>(new CurrentPage(data));

        cmsStore.setSeoMeta({ meta, url });
        cmsStore.setPageContent({ page, url: slug });
        cmsStore.setCurrentStaticPage(page);

        return meta;
    } catch (err) {
        log.error("LOAD_SEO_META", err);
        return String(err);
    }
}

export async function loadCMSPages(): Promise<IFileCMS[] | undefined> {
    const { getUserLocale } = storeToRefs(useMultilangStore());
    const bannerStore = useBannerStore();
    const { termsFiles } = storeToRefs(bannerStore);

    if (
        termsFiles.value.length
    ) {
        return;
    }

    const filesCMS: IFileCMS[] = await loadAllFilesFromCMSReq(getUserLocale.value);
    const filteredFiles = filesCMS.filter((file) => file.categories.includes(BANNER_CATEGORY_TERMS_CONDITIONS));

    bannerStore.setTermsFiles(filteredFiles);

    return filesCMS;
}
