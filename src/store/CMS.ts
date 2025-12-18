import { routeNames } from "@router/routeNames";
import { metaDataSSR } from "@theme/configs/meta";
import { defineStore, type Pinia, storeToRefs } from "pinia";
import { computed, ref } from "vue";

import { enableCategoriesPage } from "../consts/cms";
import { log } from "../controllers/Logger";
import { isExistData } from "../helpers/isExistData";
import type { TemplateType } from "../helpers/replaceStringHelper";
import replaceStringHelper from "../helpers/replaceStringHelper";
import { prepareMapStaticPages } from "../helpers/staticPages";
import { CurrentPage, type ICurrentPage, ICurrentPageMeta, type IPageCMSPrepare } from "../models/CMS";
import type { ISnippetItemCMS } from "../services/api/DTO/CMS";
import { loadCMSPagesReq, loadCMSSnippetsReq, loadPageContentFromCmsReq } from "../services/api/requests/CMS";
import { useMultilangStore } from "../store/multilang";

function replaceCurrentYearPlaceholder<T>(template: TemplateType): T {
    return replaceStringHelper({
        template,
        replaceString: "{current_year}",
        replaceValue: new Date().getFullYear().toString(),
    }) as T;
}

function resolveUrlFromRoute(route: { path: string; name?: string; meta?: { metaUrl?: string } }): string {
    if (route?.meta?.metaUrl) {
        return route.meta.metaUrl;
    }

    if (route?.name === routeNames.main) {
        return "/home";
    }
    return route?.path ?? "";
}

function normalizeUrl(url: string): string {
    return url.replace(/^\/+|\/+$/g, "");
}

export const useCMS = defineStore("CMS", () => {
    const staticPages = ref<IPageCMSPrepare[]>([]);
    const snippets = ref<ISnippetItemCMS[]>([]);
    const { getUserLocale } = storeToRefs(useMultilangStore());
    const currentStaticPage = ref<ICurrentPage | null>();
    const contentCurrentPage = ref<Record<string, ICurrentPage>>({});
    const seoMeta = ref<Record<string, ICurrentPageMeta>>({});
    const seoCurrentDescription = ref<string>("");
    const inflight = new Map<string, ReturnType<typeof loadPageContentFromCmsReq>>();

    async function loadStaticPages({ reload } = { reload: false }) {
        try {
            if (isExistData(staticPages.value) && !reload) {
                return staticPages.value;
            }

            const pages = await loadCMSPagesReq(getUserLocale.value);
            if (pages?.length) {
                staticPages.value = prepareMapStaticPages(pages);
                return pages;
            }

            throw new Error(`pages.length < 1, pages = ${pages}`);
        } catch (err) {
            log.error("STORE_LOAD_STATIC_PAGES_ERROR", err);
            throw err;
        }
    }

    const getStaticPages = computed(() => {
        return staticPages.value.filter((page) => {
            return page.categories.some((pageCategory) => {
                return enableCategoriesPage.includes(pageCategory);
            });
        });
    });

    const hasStaticPageInCMS = (slug: string) => {
        return staticPages.value.some((page: IPageCMSPrepare) => {
            return page.slug === slug || page.url === slug;
        });
    };

    const getStaticPageBySlug = (slug: string) => {
        return getStaticPages.value.find((page) => {
            return page.slug === slug;
        });
    };

    const getUnhiddenStaticPages = computed<IPageCMSPrepare[]>(() => {
        return staticPages.value.filter((page) => {
            return !page.hidden;
        });
    });

    async function loadCMSSnippets({ reload = false } = {}) {
        if (!reload && isExistData(snippets.value)) {
            return snippets.value;
        }

        const data = await loadCMSSnippetsReq(getUserLocale.value);

        if (data) {
            snippets.value = data;
        }

        return data;
    }

    const getSeoMainPageFooter = computed(() => {
        const snippetsId = "footer-content";

        const template = (snippets.value && snippets.value.find((item) => {
            return item.id === snippetsId;
        }) || {}).content;

        return replaceCurrentYearPlaceholder(template);
    });


    function setSeoMeta({ meta, url }: { meta: ICurrentPageMeta, url: string }) {
        if (meta && meta.metaTitle) {
            seoMeta.value = { ...seoMeta.value, [url]: meta };
        }
    }

    function setPageContent({ page, url }: { page: ICurrentPage, url: string }) {
        contentCurrentPage.value[url] = page;
    }

    function setCurrentStaticPage(page: ICurrentPage | null) {
        currentStaticPage.value = page;
    }

    function ensureStaticIfReady(slug: string): string | void {
        if (staticPages.value.length && !hasStaticPageInCMS(slug)) {
            return `${slug} page is not StaticPages`;
        }

        return;
    }

    async function fetchCmsPageOnce(slug: string, locale?: string): ReturnType<typeof loadPageContentFromCmsReq> {
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

    async function loadCurrentStaticPage(slug: string) {
        currentStaticPage.value = null;

        const staticErr = ensureStaticIfReady(slug);

        if (staticErr) {
            return staticErr;
        }

        const cached = contentCurrentPage.value[slug];

        if (cached) {
            setCurrentStaticPage(cached);

            return cached;
        }

        try {
            const data = await fetchCmsPageOnce(slug, getUserLocale.value);

            if (!data) {
                return `${slug} page is not found`;
            }

            const page = replaceCurrentYearPlaceholder<ICurrentPage>(new CurrentPage(data));

            setCurrentStaticPage(page);
            setPageContent({ page, url: slug });

            return page;
        } catch (err) {
            log.error("LOAD_CURRENT_STATIC_PAGE", err);
            throw err;
        }
    }

    async function loadMetaSEO(route: { path: string; name: string; meta?: { metaUrl: string } }) {
        const url = resolveUrlFromRoute(route);
        const slug = normalizeUrl(url);

        const staticErr = ensureStaticIfReady(slug);

        if (staticErr) {
            return staticErr;
        }

        const cachedMeta = seoMeta.value[url];
        const cachedPage = contentCurrentPage.value[slug];

        if (cachedMeta && cachedPage) {
            setCurrentStaticPage(cachedPage);

            return;
        }

        try {
            const data = await fetchCmsPageOnce(slug, getUserLocale.value);

            if (!data) {
                return `${slug} page data is not found`;
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

            setSeoMeta({ meta, url });
            setPageContent({ page, url: slug });
            setCurrentStaticPage(page);

            return meta;
        } catch (err) {
            log.error("LOAD_SEO_META", err);
            return String(err);
        }
    }

    // research: what is it and why this is? it is legacy and maybe we can use `currentStaticPage.metaDescription`
    function setCurrentPageSeoDescription(description: string) {
        seoCurrentDescription.value = description;
    }

    const noIndex = ref<boolean>(false);

    function setNoIndex(noIndexData: boolean) {
        noIndex.value = noIndexData;
    }

    return {
        staticPages,
        snippets,

        loadStaticPages,
        loadCMSSnippets,
        loadCurrentStaticPage,
        currentStaticPage,
        contentCurrentPage,

        setSeoMeta,
        seoMeta,

        getStaticPageBySlug,
        getUnhiddenStaticPages,
        getSeoMainPageFooter,

        loadMetaSEO,

        seoCurrentDescription,
        setCurrentPageSeoDescription,

        noIndex,
        setNoIndex,
    };
});

export function useCMSFetchService(pinia?: Pinia) {
    const { loadStaticPages, loadCMSSnippets } = useCMS(pinia);

    return {
        loadStaticPages,
        loadCMSSnippets,
    };
}
