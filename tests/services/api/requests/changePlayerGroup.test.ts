import { afterEach, describe, expect, it, vi } from "vitest";

const setupPlayerRequestsModule = async () => {
    vi.resetModules();

    const postMock = vi.fn();
    const logError = vi.fn();

    vi.doMock("../../../../src/controllers/Logger", () => ({
        log: {
            error: logError,
        },
    }));
    vi.doMock("../../../../src/services/api/http", () => ({
        http: vi.fn(() => ({
            post: postMock,
        })),
    }));

    const playerRequestsModule = await import("../../../../src/services/api/requests/player");

    return {
        ...playerRequestsModule,
        postMock,
        logError,
    };
};

afterEach(() => {
    vi.restoreAllMocks();
});

describe("changePlayerGroup", () => {
    it("sends parallel requests for different groups", async () => {
        const { changePlayerGroup, postMock } = await setupPlayerRequestsModule();
        let resolveFirst: (value: { status: number }) => void = () => undefined;
        const firstRequest = new Promise<{ status: number }>((resolve) => {
            resolveFirst = resolve;
        });

        postMock
            .mockImplementationOnce(() => firstRequest)
            .mockResolvedValue({ status: 200 });

        const firstChange = changePlayerGroup(532);
        const secondChange = changePlayerGroup(1401);

        await vi.waitFor(() => {
            expect(postMock).toHaveBeenCalledTimes(2);
        });
        expect(postMock).toHaveBeenCalledWith("/api/player/groups", {
            groups: { add: [ 532 ], remove: [] },
        });
        expect(postMock).toHaveBeenCalledWith("/api/player/groups", {
            groups: { add: [ 1401 ], remove: [] },
        });

        resolveFirst({ status: 200 });
        await Promise.all([ firstChange, secondChange ]);
    });

    it("skips a duplicate in-flight request for the same group", async () => {
        const { changePlayerGroup, postMock } = await setupPlayerRequestsModule();
        let resolveFirst: (value: { status: number }) => void = () => undefined;
        const firstRequest = new Promise<{ status: number }>((resolve) => {
            resolveFirst = resolve;
        });

        postMock.mockImplementationOnce(() => firstRequest);

        const firstChange = changePlayerGroup(1401);
        const duplicateChange = changePlayerGroup(1401);

        await vi.waitFor(() => {
            expect(postMock).toHaveBeenCalledTimes(1);
        });

        resolveFirst({ status: 200 });
        await Promise.all([ firstChange, duplicateChange ]);
        expect(postMock).toHaveBeenCalledTimes(1);
    });

    it("allows the same group again after the previous request finishes", async () => {
        const { changePlayerGroup, postMock } = await setupPlayerRequestsModule();
        postMock.mockResolvedValue({ status: 200 });

        await changePlayerGroup(1401);
        await changePlayerGroup(1401);

        expect(postMock).toHaveBeenCalledTimes(2);
    });
});
