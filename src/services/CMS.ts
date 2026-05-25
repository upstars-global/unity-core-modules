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
import { IFileCMS, IPageItemCMS } from "./api/DTO/CMS";
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

type StaticPageRoute = { path: string; name?: string; meta?: { metaUrl?: string } };
type StaticPageExplicitSource = { slug: string; seoUrl?: string };
type StaticPageSource = string | StaticPageRoute | StaticPageExplicitSource;

function isExplicitStaticPageSource(source: StaticPageSource): source is StaticPageExplicitSource {
    return typeof source !== "string" && "slug" in source;
}

function resolveStaticPageSource(source: StaticPageSource, seoUrl?: string) {
    if (isExplicitStaticPageSource(source)) {
        return {
            slug: normalizeUrl(source.slug),
            seoUrl: source.seoUrl || seoUrl || normalizeUrl(source.slug),
        };
    }

    const url = typeof source === "string" ? source : resolveUrlFromRoute(source);
    const slug = normalizeUrl(url);

    return {
        slug,
        seoUrl: seoUrl || (typeof source === "string" ? slug : url),
    };
}

function buildMetaSEO(data: IPageItemCMS, locale: string): ICurrentPageMeta {
    const blocks = data.blocks;

    if (blocks) {
        return {
            metaTitle: blocks.title,
            metaDescription: blocks.description,
            content: data.content,
            json: blocks.json,
        };
    }

    const fallback = metaDataSSR(locale);

    return {
        metaTitle: fallback?.title,
        metaDescription: fallback?.description,
        content: fallback?.content,
    };
}

export async function loadCurrentStaticPage(source: StaticPageSource, seoUrl?: string) {
    const cmsStore = useCMS();
    const { contentCurrentPage, seoMeta } = storeToRefs(cmsStore);
    const { getUserLocale } = storeToRefs(useMultilangStore());
    const { slug, seoUrl: resolvedSeoUrl } = resolveStaticPageSource(source, seoUrl);

    cmsStore.setCurrentStaticPage(null);

    const staticErr = cmsStore.ensureStaticIfReady(slug);

    if (staticErr) {
        return staticErr;
    }

    const cached = contentCurrentPage.value[slug];

    if (cached) {
        cmsStore.setCurrentStaticPage(cached);

        if (!seoMeta.value[resolvedSeoUrl]) {
            cmsStore.setSeoMeta({ meta: seoMeta.value[slug] || cached.meta, url: resolvedSeoUrl });
        }

        return cached;
    }

    try {
        const data = await fetchCmsPageOnce(slug, getUserLocale.value);

        if (!data) {
            return `${ slug } page is not found`;
        }

        const page = replaceCurrentYearPlaceholder<ICurrentPage>(new CurrentPage(data));
        const meta = replaceCurrentYearPlaceholder<ICurrentPageMeta>(buildMetaSEO(data, getUserLocale.value));

        cmsStore.setCurrentStaticPage(page);
        cmsStore.setPageContent({ page, url: slug });
        cmsStore.setSeoMeta({ meta, url: resolvedSeoUrl });

        return page;
    } catch (err) {
        log.error("LOAD_CURRENT_STATIC_PAGE", err);
        throw err;
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
