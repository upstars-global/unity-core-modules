import { defineStore, storeToRefs } from "pinia";
import { computed, ref } from "vue";

import log from "../controllers/Logger";
import type { ISnippetItemCMS } from "../services/api/DTO/CMS";
import type { TemplateType } from "../helpers/replaceStringHelper";
import replaceStringHelper from "../helpers/replaceStringHelper";
import { prepareMapStaticPages } from "../helpers/staticPages";
import { enableCategoriesPage } from "../consts/cms";
import { CurrentPage, type IPageCMSPrepare, type ICurrentPage } from "../models/CMS";
import { loadCMSPagesReq, loadCMSSnippetsReq, loadMetaSEOReq, loadPageContentFromCmsReq } from "../services/api/requests/CMS";

import { useMultilang } from "@store/multilang";

interface ISeoMeta {
    json: string;
    metaDescription: string;
    metaTitle: string;
    metaKeywords?: string;
    content?: string;
}

function replaceCurrentYearPlaceholder(template: TemplateType) {
    return replaceStringHelper({
        template,
        replaceString: "{current_year}",
        replaceValue: new Date().getFullYear().toString(),
    });
}

export function createCMSStore({ routeNames, metaDataSSR }) {
    return defineStore("CMS", () => {
        const staticPages = ref<IPageCMSPrepare[]>([]);
        const snippets = ref<ISnippetItemCMS[]>([]);
        const { getUserLocale } = storeToRefs(useMultilang());

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

        const currentStaticPage = ref<ICurrentPage | null>();
        const contentCurrentPage = ref<string>("");
        const seoMeta = ref<Record<string, ISeoMeta>>({});
        const pagesContent = ref<Record<string, ICurrentPage>>({});

        function setSeoMeta({ meta, url }: { meta: ISeoMeta, url: string }) {
            if (meta && meta.metaTitle) {
                seoMeta.value = { ...seoMeta.value, [url]: meta };
            }
        }
        function setPageContent({ content, url }: {content: ICurrentPage, url: string}) {
            pagesContent.value = { ...pagesContent.value, [url]: content };
        }

        async function loadCurrentStaticPage(slug: string) {
            currentStaticPage.value = null;

            if (staticPages.value.length && !hasStaticPageInCMS(slug)) {
                return `${slug} page is not StaticPages`;
            }

            try {
                const data = await loadPageContentFromCmsReq(slug, getUserLocale.value);
                if (!data) {
                    return `${slug} page is not found`;
                }

                const page: ICurrentPage = replaceCurrentYearPlaceholder(new CurrentPage(data));

                currentStaticPage.value = page;

                setSeoMeta({ meta: page.meta, url: data.path });

                contentCurrentPage.value = data.content;

                return page;
            } catch (err) {
                log.error("LOAD_CURRENT_STATIC_PAGE", err);
                throw err;
            }
        }

        async function loadMetaSEO(route: { path: string, name: string, meta?: { metaUrl: string } }) {
            let url = route.path;

            if (route.meta && route.meta.metaUrl) {
                url = route.meta.metaUrl;
            }

            if (route.name === routeNames.main) {
                url = "/home";
            }

            let meta = seoMeta.value[url];
            currentStaticPage.value = pagesContent.value[url];
            if (meta) {
                return Promise.resolve(meta);
            }

            const slugPage = url.replace(/\/$/, "");
            if (!hasStaticPageInCMS(slugPage)) {
                return `${slugPage} page is not StaticPages`;
            }

            try {
                const data = await loadMetaSEOReq(url, getUserLocale.value);

                if (!data) {
                    return `${slugPage} page data is not found`;
                }

                const blocks = data.blocks;
                if (blocks) {
                    meta = {
                        metaTitle: blocks.title,
                        metaDescription: blocks.description,
                        content: data.content,
                        json: blocks.json,
                    };
                } else {
                    const metaDataSSRPrepare = metaDataSSR(getUserLocale.value);
                    meta = {
                        metaTitle: metaDataSSRPrepare?.title,
                        metaDescription: metaDataSSRPrepare?.description,
                        content: metaDataSSRPrepare?.content,
                        json: blocks.json,
                    };
                }

                meta = replaceCurrentYearPlaceholder(meta);
                const pageContent = replaceCurrentYearPlaceholder(new CurrentPage(data));

                setSeoMeta({ meta, url });
                setPageContent({ content: pageContent, url });
                currentStaticPage.value = pageContent;

                return meta;
            } catch (err) {
                log.error("LOAD_SEO_META", err);
            }
        }

        // research: what is it and why this is? it is legacy and maybe we can use `currentStaticPage.metaDescription`
        const seoCurrentDescription = ref<string>("");

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
}
