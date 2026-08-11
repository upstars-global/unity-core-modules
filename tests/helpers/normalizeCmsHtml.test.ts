import { afterEach, describe, expect, it, vi } from "vitest";

async function loadNormalizeCmsHtml(isServer: boolean) {
    vi.resetModules();
    vi.doMock("../../src/helpers/ssrHelpers", () => ({ isServer }));

    return (await import("../../src/helpers/normalizeCmsHtml")).normalizeCmsHtml;
}

describe("normalizeCmsHtml", () => {
    afterEach(() => {
        vi.doUnmock("../../src/helpers/ssrHelpers");
    });

    it("closes malformed CMS markup using HTML5 parsing rules on the server", async () => {
        const normalizeCmsHtml = await loadNormalizeCmsHtml(true);
        const html = '<div class="bonus-page"><div gap-row-s><p>Content</p></div>';

        await expect(normalizeCmsHtml(html)).resolves.toBe(
            '<div class="bonus-page"><div gap-row-s=""><p>Content</p></div></div>',
        );
    });

    it("keeps CMS HTML unchanged on the client", async () => {
        const normalizeCmsHtml = await loadNormalizeCmsHtml(false);
        const html = '<div class="bonus-page"><div gap-row-s><p>Content</p></div>';

        await expect(normalizeCmsHtml(html)).resolves.toBe(html);
    });

    it("preserves CMS component placeholders", async () => {
        const normalizeCmsHtml = await loadNormalizeCmsHtml(true);
        const html = "<div>#PromotionList[bannersList=bannersList]#</div>";

        await expect(normalizeCmsHtml(html)).resolves.toBe(html);
    });

    it("is idempotent", async () => {
        const normalizeCmsHtml = await loadNormalizeCmsHtml(true);
        const normalizedHtml = await normalizeCmsHtml("<ul><li>First<li>Second</ul>");

        await expect(normalizeCmsHtml(normalizedHtml)).resolves.toBe(normalizedHtml);
    });
});
