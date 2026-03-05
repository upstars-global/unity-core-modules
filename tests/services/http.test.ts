import { afterEach, describe, expect, it, vi } from "vitest";

const BUS_EVENTS = {
    AUTH_ERROR: "auth-error",
    MAINTENANCE_MODE: "maintenance-mode",
};

const loadHttpModule = async (isServer: boolean) => {
    vi.resetModules();

    const eventEmit = vi.fn();
    const logError = vi.fn();

    vi.doMock("../../src/helpers/ssrHelpers", () => ({
        isServer,
    }));
    vi.doMock("../../src/plugins/EventBus", () => ({
        BUS_EVENTS,
        EventBus: {
            $emit: eventEmit,
        },
    }));
    vi.doMock("../../src/controllers/Logger", () => ({
        log: {
            error: logError,
        },
    }));

    const mod = await import("../../src/services/api/http");
    return { ...mod, eventEmit, logError };
};

afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
});

describe("http client", () => {
    it("isHttpError validates expected shape", async () => {
        const { isHttpError } = await loadHttpModule(false);

        expect(isHttpError({ message: "x", response: { status: 500 } })).toBe(true);
        expect(isHttpError({ message: "x", config: { url: "/api/test" } })).toBe(true);
        expect(isHttpError({ message: "x" })).toBe(false);
        expect(isHttpError("error")).toBe(false);
    });

    it("builds client URL and parses JSON response", async () => {
        const { http } = await loadHttpModule(false);
        const fetchMock = vi.fn().mockResolvedValueOnce(
            new Response(JSON.stringify({ ok: true }), { status: 200 }),
        );
        vi.stubGlobal("fetch", fetchMock);

        const response = await http({ headers: { "X-Test": "1" } }).get("/api/ping", {
            params: {
                a: 1,
                b: null,
                c: "x",
            },
        });

        const [ url, options ] = fetchMock.mock.calls[0];
        expect(url).toBe("/api/ping?a=1&c=x");
        expect(options.method).toBe("GET");
        expect(options.headers).toMatchObject({
            "Accept": "application/json, text/plain, */*",
            "X-Requested-With": "XMLHttpRequest",
            "X-Test": "1",
        });
        expect(response.data).toEqual({ ok: true });
        expect(response.status).toBe(200);
    });

    it("returns text for non-JSON responses", async () => {
        const { http } = await loadHttpModule(false);
        const fetchMock = vi.fn().mockResolvedValueOnce(new Response("plain text", { status: 200 }));
        vi.stubGlobal("fetch", fetchMock);

        const response = await http().get("/api/plain");
        expect(response.data).toBe("plain text");
    });

    it("returns null for 204 responses", async () => {
        const { http } = await loadHttpModule(false);
        const fetchMock = vi.fn().mockResolvedValueOnce(new Response(null, { status: 204 }));
        vi.stubGlobal("fetch", fetchMock);

        const response = await http().get("/api/empty");
        expect(response.data).toBeNull();
    });

    it("serializes JSON body in post request", async () => {
        const { http } = await loadHttpModule(false);
        const fetchMock = vi.fn().mockResolvedValueOnce(new Response("{}", { status: 200 }));
        vi.stubGlobal("fetch", fetchMock);

        await http().post("/api/player", { id: 1 });

        const [ , options ] = fetchMock.mock.calls[0];
        expect(options.method).toBe("POST");
        expect(options.body).toBe("{\"id\":1}");
        expect(options.headers).toMatchObject({
            "Content-Type": "application/json",
        });
    });

    it("removes Content-Type for FormData body", async () => {
        const { http } = await loadHttpModule(false);
        const fetchMock = vi.fn().mockResolvedValueOnce(new Response("{}", { status: 200 }));
        vi.stubGlobal("fetch", fetchMock);

        const body = new FormData();
        body.append("file", "content");

        await http().post("/api/upload", body, {
            headers: {
                "Content-Type": "application/json",
            },
        });

        const [ , options ] = fetchMock.mock.calls[0];
        expect(options.body).toBe(body);
        expect(options.headers["Content-Type"]).toBeUndefined();
    });

    it("uses absolute URL as is", async () => {
        const { http } = await loadHttpModule(false);
        const fetchMock = vi.fn().mockResolvedValueOnce(new Response("{}", { status: 200 }));
        vi.stubGlobal("fetch", fetchMock);

        await http().get("http://example.com/health");

        const [ url ] = fetchMock.mock.calls[0];
        expect(url).toBe("http://example.com/health");
    });

    it("adds params with existing query string", async () => {
        const { http } = await loadHttpModule(false);
        const fetchMock = vi.fn().mockResolvedValueOnce(new Response("{}", { status: 200 }));
        vi.stubGlobal("fetch", fetchMock);

        await http().get("/api/items?x=1", { params: { y: 2 } });

        const [ url ] = fetchMock.mock.calls[0];
        expect(url).toBe("/api/items?x=1&y=2");
    });

    it("emits AUTH_ERROR on 401", async () => {
        const { http, eventEmit } = await loadHttpModule(false);
        const fetchMock = vi.fn().mockResolvedValueOnce(new Response("{}", { status: 401, statusText: "Unauthorized" }));
        vi.stubGlobal("fetch", fetchMock);

        await expect(http().get("/api/player")).rejects.toThrow("HTTP 401: Unauthorized");
        expect(eventEmit).toHaveBeenCalledWith(BUS_EVENTS.AUTH_ERROR);
    });

    it("emits MAINTENANCE_MODE on 503 with maintenance header", async () => {
        const { http, eventEmit, logError } = await loadHttpModule(false);
        const fetchMock = vi.fn().mockResolvedValueOnce(
            new Response("{}", {
                status: 503,
                statusText: "Service Unavailable",
                headers: {
                    "x-maintenance-mode": "1",
                },
            }),
        );
        vi.stubGlobal("fetch", fetchMock);
        const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {
        });

        await expect(http().get("/api/cms/pages?l=en")).rejects.toThrow("HTTP 503: Service Unavailable");

        expect(eventEmit).toHaveBeenCalledWith(BUS_EVENTS.MAINTENANCE_MODE);
        expect(consoleLogSpy).toHaveBeenCalled();
        expect(logError).toHaveBeenCalledWith("LOAD_CMS_PAGES_ERROR", expect.any(Error));
    });

    it("logs error label for failed request", async () => {
        const { http, logError } = await loadHttpModule(false);
        const fetchMock = vi.fn().mockResolvedValueOnce(
            new Response("{\"error\":true}", { status: 500, statusText: "Internal Error" }),
        );
        vi.stubGlobal("fetch", fetchMock);

        await expect(http().get("/api/player/groups?x=1")).rejects.toThrow("HTTP 500: Internal Error");

        expect(logError).toHaveBeenCalledWith("LOAD_PLAYER_GROUPS_ERROR", expect.any(Error));
    });

    it("retries on client for retryable network errors", async () => {
        vi.useFakeTimers();
        vi.spyOn(Math, "random").mockReturnValue(0);

        const { http } = await loadHttpModule(false);
        const fetchMock = vi.fn()
            .mockRejectedValueOnce(new Error("Network Error"))
            .mockResolvedValueOnce(new Response("{\"ok\":true}", { status: 200 }));
        vi.stubGlobal("fetch", fetchMock);

        const responsePromise = http().get("/api/retry");
        await vi.runAllTimersAsync();
        const response = await responsePromise;

        expect(fetchMock).toHaveBeenCalledTimes(2);
        expect(response.data).toEqual({ ok: true });
    });

    it("does not retry on client for non-retryable errors", async () => {
        const { http } = await loadHttpModule(false);
        const fetchMock = vi.fn().mockRejectedValue(new Error("Boom"));
        vi.stubGlobal("fetch", fetchMock);

        await expect(http().get("/api/retry-stop")).rejects.toThrow("Boom");
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it("does not retry on server", async () => {
        const { http } = await loadHttpModule(true);
        const fetchMock = vi.fn().mockRejectedValue(new Error("Network Error"));
        vi.stubGlobal("fetch", fetchMock);

        await expect(http().get("/api/server-fail")).rejects.toThrow("Network Error");
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it("sets Cookie header from locale on server", async () => {
        const { http } = await loadHttpModule(true);
        const fetchMock = vi.fn().mockResolvedValueOnce(new Response("{}", { status: 200 }));
        vi.stubGlobal("fetch", fetchMock);

        await http({ locale: "en" }).get("/api/cms/pages");

        const [ url, options ] = fetchMock.mock.calls[0];
        expect(url).toBe("http://localhost:2004/api/cms/pages");
        expect(options.headers).toMatchObject({
            Cookie: "locale=ImVuIg==XXX;",
        });
    });

    it("maps AbortError to timeout error on server", async () => {
        const { http } = await loadHttpModule(true);
        const abortError = Object.assign(new Error("aborted"), { name: "AbortError" });
        const fetchMock = vi.fn().mockRejectedValueOnce(abortError);
        vi.stubGlobal("fetch", fetchMock);

        await expect(http().get("/api/timeout")).rejects.toThrow("timeout of 8000ms exceeded");
    });
});
