
import { defineStore } from "pinia";
import { replaceCurrentYearPlaceholder } from "src/helpers/replaceStringHelper";
import { computed, ref } from "vue";

import { enableCategoriesPage } from "../consts/cms";
import { type ICurrentPage, ICurrentPageMeta, type IPageCMSPrepare } from "../models/CMS";
import type { ISnippetItemCMS } from "../services/api/DTO/CMS";
import { loadPageContentFromCmsReq } from "../services/api/requests/CMS";


export const useCMS = defineStore("CMS", () => {
    const staticPages = ref<IPageCMSPrepare[]>([]);
    const snippets = ref<ISnippetItemCMS[]>([]);
    const currentStaticPage = ref<ICurrentPage | null>();
    const contentCurrentPage = ref<Record<string, ICurrentPage>>({});
    const seoMeta = ref<Record<string, ICurrentPageMeta>>({});
    const seoCurrentDescription = ref<string>("");
    const inflight = new Map<string, ReturnType<typeof loadPageContentFromCmsReq>>();
    const noIndex = ref<boolean>(false);

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
            return `${ slug } page is not StaticPages`;
        }

        return;
    }

    // research: what is this and for what it is/it is legacy and maybe we can use `currentStaticPage.metaDescription`
    function setCurrentPageSeoDescription(description: string) {
        seoCurrentDescription.value = description;
    }

    function setNoIndex(noIndexData: boolean) {
        noIndex.value = noIndexData;
    }

    function setStaticPages(pages: IPageCMSPrepare[]) {
        staticPages.value = pages;
    }

    function setSnippets(snippetsData: ISnippetItemCMS[]) {
        snippets.value = snippetsData;
    }

    return {
        staticPages,
        snippets,
        inflight,

        setStaticPages,
        setSnippets,
        setCurrentStaticPage,
        currentStaticPage,
        contentCurrentPage,
        setPageContent,

        setSeoMeta,
        seoMeta,

        getStaticPageBySlug,
        getUnhiddenStaticPages,
        getSeoMainPageFooter,
        ensureStaticIfReady,

        seoCurrentDescription,
        setCurrentPageSeoDescription,

        noIndex,
        setNoIndex,
    };
});
