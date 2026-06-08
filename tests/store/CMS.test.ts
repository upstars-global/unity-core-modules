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
import {
    loadCMSSnippets,
    loadCurrentStaticPage,
    loadStaticPages,
} from "../../src/services/CMS";
import { useCMS } from "../../src/store/CMS";

vi.mock("../../src/store/multilang", () => ({
    useMultilangStore: () => ({
        getUserLocale: ref("en"),
    }),
}));

vi.mock("../../src/helpers/staticPages", () => ({
    prepareMapStaticPages: (pages) => pages,
    resolveUrlFromRoute: (route) => route?.meta?.metaUrl || route?.path || "",
    normalizeUrl: (url) => url.replace(/^\/+|\/+$/g, ""),
}));

vi.mock("../../src/services/api/requests/CMS", () => ({
    loadCMSPagesReq: vi.fn(),
    loadCMSSnippetsReq: vi.fn(),
    loadPageContentFromCmsReq: vi.fn(),
}));

vi.mock("../../src/helpers/replaceStringHelper", () => ({
    default: vi.fn(({ template }) => template),
    replaceCurrentYearPlaceholder: vi.fn((template) => template),
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

vi.mock("@config/banners", () => ({
    BANNER_CATEGORY_TERMS_CONDITIONS: "terms",
}));

vi.mock("@i18n", () => ({
    default: () => ({}),
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

            const result = await loadStaticPages();

            expect(loadCMSPagesReq).not.toHaveBeenCalled();
            expect(result).toEqual(pages);
        });

        it("loads staticPages from API if not reload and empty cache", async () => {
            const resolvedPages = [ { slug: "api", categories: enableCategoriesPage, hidden: false, url: "api" } ];
            const store = useCMS();
            store.staticPages = [];

            vi.mocked(loadCMSPagesReq)
                .mockResolvedValue(resolvedPages);

            await loadStaticPages({ reload: false });

            expect(loadCMSPagesReq).toHaveBeenCalled();
            expect(store.staticPages).toEqual(resolvedPages);
        });

        it("loads staticPages from API if reload", async () => {
            const resolvedPages = [ { slug: "api", categories: enableCategoriesPage, hidden: false, url: "api" } ];
            const store = useCMS();
            store.staticPages = [];

            vi.mocked(loadCMSPagesReq)
                .mockResolvedValue(resolvedPages);

            await loadStaticPages({ reload: true });

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

            const result = await loadCMSSnippets();

            expect(loadCMSSnippetsReq).not.toHaveBeenCalled();
            expect(result).toEqual(store.snippets);
        });

        it("loads snippets from API if reload", async () => {
            const snippets = [ { id: "footer-content", content: "api" } ];
            const store = useCMS();
            store.snippets = [];

            vi.mocked(loadCMSSnippetsReq).mockResolvedValue(snippets);

            await loadCMSSnippets({ reload: true });

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

            const result = await loadCurrentStaticPage("b");

            expect(result).toBe("b page is not StaticPages");
        });

        it("returns not found if API returns null", async () => {
            const store = useCMS();
            store.staticPages = [ { slug: "a", url: "/a", categories: [], hidden: false } ];

            vi.mocked(loadPageContentFromCmsReq).mockResolvedValue();

            const result = await loadCurrentStaticPage("a");

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

            const result = await loadCurrentStaticPage("a");

            expect(store.currentStaticPage).toBeDefined();
            expect(store.contentCurrentPage).toEqual({ a: new CurrentPage(page) });
            expect(result).toBeDefined();
        });

        it("accepts route and stores seo meta by resolved route url", async () => {
            const store = useCMS();
            store.staticPages = [ { slug: "home", url: "/home", categories: [], hidden: false } ];

            vi.mocked(loadPageContentFromCmsReq).mockResolvedValue({
                blocks: { title: "Home title", description: "Home desc", json: "{}" },
                content: "Home content",
            });

            const result = await loadCurrentStaticPage({ path: "/ignored", name: "other", meta: { metaUrl: "/home" } });

            expect(loadPageContentFromCmsReq).toHaveBeenCalledWith("home", "en");
            expect(result).toBeDefined();
            expect(store.contentCurrentPage.home).toBeDefined();
            expect(store.seoMeta["/home"]).toEqual({
                metaTitle: "Home title",
                metaDescription: "Home desc",
                content: "Home content",
                json: "{}",
            });
        });

        it("accepts explicit slug and seo url for entity pages", async () => {
            const store = useCMS();
            store.staticPages = [
                { slug: "tournaments/frontend-id", url: "/tournaments/frontend-id", categories: [], hidden: false },
            ];

            vi.mocked(loadPageContentFromCmsReq).mockResolvedValue({
                blocks: { title: "Tournament title", description: "Tournament desc", json: "{}" },
                content: "Tournament content",
            });

            const result = await loadCurrentStaticPage({
                slug: "tournaments/frontend-id",
                seoUrl: "/tournaments/route-slug",
            });

            expect(loadPageContentFromCmsReq).toHaveBeenCalledWith("tournaments/frontend-id", "en");
            expect(result).toBeDefined();
            expect(store.contentCurrentPage["tournaments/frontend-id"]).toBeDefined();
            expect(store.seoMeta["/tournaments/route-slug"]).toEqual({
                metaTitle: "Tournament title",
                metaDescription: "Tournament desc",
                content: "Tournament content",
                json: "{}",
            });
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
