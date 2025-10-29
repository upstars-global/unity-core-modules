import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";

import { enableCategoriesPage } from "../../src/consts/cms";
import { CurrentPage } from "../../src/models/CMS";
import {
    loadCMSPagesReq,
    loadCMSSnippetsReq,
    loadPageContentFromCmsReq,
} from "../../src/services/api/requests/CMS";
import { useCMS } from "../../src/store/CMS";

vi.mock("../../src/store/multilang", () => ({
    useMultilangStore: () => ({
        getUserLocale: ref("en"),
    }),
}));

vi.mock("../../src/helpers/staticPages", () => ({
    prepareMapStaticPages: (pages) => pages,
}));

vi.mock("../../src/services/api/requests/CMS", () => ({
    loadCMSPagesReq: vi.fn(),
    loadCMSSnippetsReq: vi.fn(),
    loadPageContentFromCmsReq: vi.fn(),
}));

vi.mock("../../src/helpers/replaceStringHelper", () => ({
    default: vi.fn(({ template }) => template),
}));

vi.mock("../../src/controllers/Logger", () => ({
    log: {
        error: vi.fn(),
    },
}));

vi.mock("@theme/configs/meta", () => ({
    metaDataSSR: vi.fn(() => ({
        title: "SSR Title",
        description: "SSR Description",
        content: "SSR Content",
    })),
}));

vi.mock("@router/routeNames", () => ({
    routeNames: { main: "main" },
}));


describe("useCMS store", () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
    });

    describe("loadStaticPages", () => {
        it("returns cached staticPages if not reload", async () => {
            const store = useCMS();
            const pages = [ { slug: "test", categories: enableCategoriesPage, hidden: false, url: "test" } ];

            store.staticPages = pages;

            const result = await store.loadStaticPages();

            expect(loadCMSPagesReq).not.toHaveBeenCalled();
            expect(result).toEqual(pages);
        });

        it("loads staticPages from API if not reload and empty cache", async () => {
            const resolvedPages = [ { slug: "api", categories: enableCategoriesPage, hidden: false, url: "api" } ];
            const store = useCMS();
            store.staticPages = [];

            vi.mocked(loadCMSPagesReq)
                .mockResolvedValue(resolvedPages);

            await store.loadStaticPages({ reload: false });

            expect(loadCMSPagesReq).toHaveBeenCalled();
            expect(store.staticPages).toEqual(resolvedPages);
        });

        it("loads staticPages from API if reload", async () => {
            const resolvedPages = [ { slug: "api", categories: enableCategoriesPage, hidden: false, url: "api" } ];
            const store = useCMS();
            store.staticPages = [];

            vi.mocked(loadCMSPagesReq)
                .mockResolvedValue(resolvedPages);

            await store.loadStaticPages({ reload: true });

            expect(store.staticPages).toEqual(resolvedPages);
        });
    });

    describe("getStaticPageBySlug", () => {
        it("returns page by slug", () => {
            const page = { slug: "slug", categories: enableCategoriesPage, hidden: false, url: "slug" };
            const store = useCMS();

            store.staticPages = [ page ];

            expect(store.getStaticPageBySlug("slug")).toEqual(page);
        });

        it("returns undefined for not enabled categories that return by getStaticPages", () => {
            const page = { slug: "slug", categories: [ "other" ], hidden: false, url: "slug" };
            const store = useCMS();

            store.staticPages = [ page ];

            expect(store.getStaticPageBySlug("slug")).toEqual(undefined);
        });
    });

    describe("getUnhiddenStaticPages", () => {
        const pageA = { slug: "a", categories: [], hidden: false, url: "/a" };
        const pageB = { slug: "b", categories: [], hidden: true, url: "/b" };

        it("returns only unhidden pages", () => {
            const store = useCMS();
            store.staticPages = [
                pageA,
                pageB,
            ];

            expect(store.getUnhiddenStaticPages).toEqual([ pageA ]);
        });
    });

    describe("loadCMSSnippets", () => {
        it("returns cached snippets if not reload", async () => {
            const store = useCMS();

            store.snippets = [ { id: "footer-content", content: "test" } ];

            const result = await store.loadCMSSnippets();

            expect(loadCMSSnippetsReq).not.toHaveBeenCalled();
            expect(result).toEqual(store.snippets);
        });

        it("loads snippets from API if reload", async () => {
            const snippets = [ { id: "footer-content", content: "api" } ];
            const store = useCMS();
            store.snippets = [];

            vi.mocked(loadCMSSnippetsReq).mockResolvedValue(snippets);

            await store.loadCMSSnippets({ reload: true });

            expect(loadCMSSnippetsReq).toHaveBeenCalled();
            expect(store.snippets).toEqual(snippets);
        });
    });

    describe("getSeoMainPageFooter", () => {
        it("returns replaced footer content", () => {
            const store = useCMS();
            store.snippets = [ { id: "footer-content", content: "Footer {current_year}" } ];

            expect(store.getSeoMainPageFooter).toBe("Footer {current_year}");
        });
    });

    describe("setSeoMeta", () => {
        it("sets seoMeta if metaTitle exists", () => {
            const store = useCMS();
            store.seoMeta = {};
            store.setSeoMeta({ meta: { metaTitle: "Title", metaDescription: "Desc", json: "" }, url: "/url" });

            expect(store.seoMeta["/url"]).toEqual({ metaTitle: "Title", metaDescription: "Desc", json: "" });
        });

        it("does not set seoMeta if metaTitle missing", () => {
            const store = useCMS();
            store.seoMeta = {};
            store.setSeoMeta({ meta: { metaTitle: "", metaDescription: "Desc", json: "" }, url: "/url" });

            expect(store.seoMeta["/url"]).toBeUndefined();
        });
    });

    describe("loadCurrentStaticPage", () => {
        it("returns not StaticPages if slug not found", async () => {
            const store = useCMS();
            store.staticPages = [ { slug: "a", url: "/a", categories: [], hidden: false } ];

            const result = await store.loadCurrentStaticPage("b");

            expect(result).toBe("b page is not StaticPages");
        });

        it("returns not found if API returns null", async () => {
            const store = useCMS();
            store.staticPages = [ { slug: "a", url: "/a", categories: [], hidden: false } ];

            vi.mocked(loadPageContentFromCmsReq).mockResolvedValue();

            const result = await store.loadCurrentStaticPage("a");

            expect(result).toBe("a page is not found");
        });

        it("sets currentStaticPage and returns page", async () => {
            const page = {
                path: "/a",
                content: "abc",
                meta: {
                    metaTitle: "Title",
                    metaDescription: "Desc",
                    json: "",
                },
                blocks: {
                    "content-main": "",
                },
            };
            const store = useCMS();

            vi.mocked(loadPageContentFromCmsReq).mockResolvedValue(page);

            const result = await store.loadCurrentStaticPage("a");

            expect(store.currentStaticPage).toBeDefined();
            expect(store.contentCurrentPage).toEqual({ a: new CurrentPage(page) });
            expect(result).toBeDefined();
        });
    });

    describe("loadMetaSEO", () => {
        it("returns not StaticPages if slug not found", async () => {
            const store = useCMS();
            store.staticPages = [ { slug: "a", url: "/a", categories: [], hidden: false } ];

            const result = await store.loadMetaSEO({ path: "/b", name: "other" });

            expect(result).toBe("b page is not StaticPages");
        });

        it("returns not found if API returns null", async () => {
            vi.mocked(loadPageContentFromCmsReq).mockResolvedValue();

            const store = useCMS();
            store.staticPages = [ { slug: "a", url: "/a", categories: [], hidden: false } ];

            const result = await store.loadMetaSEO({ path: "/a", name: "other" });

            expect(result).toBe("a page data is not found");
        });

        it("sets meta and pageContent if blocks exist", async () => {
            const store = useCMS();
            store.staticPages = [ { slug: "a", url: "/a", categories: [], hidden: false } ];

            vi.mocked(loadPageContentFromCmsReq).mockResolvedValue({
                blocks: { title: "MetaTitle", description: "MetaDesc", json: "{}" },
                content: "MetaContent",
            });

            const result = await store.loadMetaSEO({ path: "/a", name: "other" });

            expect(result.metaTitle).toBe("MetaTitle");
            expect(store.seoMeta["/a"]).toBeDefined();
        });

        it("sets meta from SSR if blocks missing", async () => {
            const store = useCMS();
            vi.mocked(loadPageContentFromCmsReq).mockResolvedValue({
                blocks: undefined,
                content: "MetaContent",
            });

            store.staticPages = [ { slug: "a", url: "/a", categories: [], hidden: false } ];

            const result = await store.loadMetaSEO({ path: "/a", name: "other" });

            expect(result.metaTitle).toBe("SSR Title");
        });
    });

    describe("setCurrentPageSeoDescription", () => {
        it("sets seoCurrentDescription", () => {
            const store = useCMS();
            store.setCurrentPageSeoDescription("desc");

            expect(store.seoCurrentDescription).toBe("desc");
        });
    });

    describe("setNoIndex", () => {
        it("sets noIndex", () => {
            const store = useCMS();
            store.setNoIndex(true);

            expect(store.noIndex).toBe(true);
        });
    });
});
