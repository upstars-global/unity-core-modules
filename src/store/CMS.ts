import { routeNames } from "@router/routeNames";
import { metaDataSSR } from "@theme/configs/meta";
import { defineStore, type Pinia, storeToRefs } from "pinia";
import { computed, ref } from "vue";

import { enableCategoriesPage } from "../consts/cms";
import { log } from "../controllers/Logger";
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
    return url.replace(/\/$/, "");
}

export const useCMS = defineStore("CMS", () => {
    const staticPages = ref<IPageCMSPrepare[]>([]);
    const snippets = ref<ISnippetItemCMS[]>([]);
    const { getUserLocale } = storeToRefs(useMultilangStore());
    const currentStaticPage = ref<ICurrentPage | null>();
    const contentCurrentPage = ref<string>("");
    const seoMeta = ref<Record<string, ICurrentPageMeta>>({});
    const pagesContent = ref<Record<string, ICurrentPage>>({});
    const seoCurrentDescription = ref<string>("");

    async function loadStaticPages({ reload } = { reload: false }) {
        if (staticPages.value.length && !reload) {
            return staticPages.value;
        }

        const pages = await loadCMSPagesReq(getUserLocale.value);
        if (pages) {
            staticPages.value = prepareMapStaticPages(pages);
        }
        return pages;
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
        if (!reload && snippets.value.length) {
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
    function setPageContent({ content, url }: {content: ICurrentPage, url: string}) {
        pagesContent.value = { ...pagesContent.value, [url]: content };
    }

    function ensureStaticIfReady(slug: string): string | void {
        if (staticPages.value.length && !hasStaticPageInCMS(slug)) {
            return `${slug} page is not StaticPages`;
        }

        return;
    }

    async function loadCurrentStaticPage(slug: string) {
        const staticErr = ensureStaticIfReady(slug);

        if (staticErr) {
            return staticErr;
        }

        try {
            const data = await loadPageContentFromCmsReq(slug, getUserLocale.value);
            if (!data) {
                return `${slug} page is not found`;
            }

            const page = replaceCurrentYearPlaceholder<ICurrentPage>(new CurrentPage(data));

            currentStaticPage.value = page;
            contentCurrentPage.value = data.content;

            const urlKey = normalizeUrl(data.path || slug);

            setSeoMeta({ meta: page.meta, url: urlKey });
            setPageContent({ content: page, url: urlKey });

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

        const cached = seoMeta.value[url];
        if (cached) {
            return cached;
        }

        try {
            const data = await loadPageContentFromCmsReq(url, getUserLocale.value);

            if (!data) {
                return `${url} page data is not found`;
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

            setSeoMeta({ meta, url });

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
