import { describe, expect, it, vi } from "vitest";

import {
    getCookieValue,
    getStoredMirrorsAutologinRecoveryToken,
    isValidMirrorsAutologinBackUrl,
    setStoredMirrorsAutologinRecoveryToken,
} from "../../src/helpers/mirrorsAutologin";

interface FakeIdbRequest<T = unknown> {
    onerror?: ((event: Event) => void) | null;
    onsuccess?: ((event: Event) => void) | null;
    result?: T;
}

interface FakeIdbOpenRequest extends FakeIdbRequest<IDBDatabase> {
    onupgradeneeded?: ((event: IDBVersionChangeEvent) => void) | null;
}

interface FakeIdbTransaction {
    oncomplete?: ((event: Event) => void) | null;
    onerror?: ((event: Event) => void) | null;
    objectStore(name: string): IDBObjectStore;
}

function createFakeIndexedDb(): IDBFactory {
    const values = new Map<string, unknown>();

    return {
        open: vi.fn(() => {
            const request: FakeIdbOpenRequest = {};
            const db = {
                close: vi.fn(),
                createObjectStore: vi.fn(),
                objectStoreNames: {
                    contains: vi.fn(() => false),
                },
                transaction: vi.fn(() => {
                    const tx: FakeIdbTransaction = {
                        objectStore: vi.fn(() => {
                            return {
                                get: vi.fn((key: string) => {
                                    const getRequest: FakeIdbRequest = {};

                                    queueMicrotask(() => {
                                        getRequest.result = values.get(key);
                                        getRequest.onsuccess?.({} as Event);
                                    });

                                    return getRequest as unknown as IDBRequest;
                                }),
                                put: vi.fn((value: string, key: string) => {
                                    values.set(key, value);
                                    queueMicrotask(() => tx.oncomplete?.({} as Event));
                                }),
                            } as unknown as IDBObjectStore;
                        }),
                    };

                    return tx as unknown as IDBTransaction;
                }),
            };

            queueMicrotask(() => {
                request.result = db as unknown as IDBDatabase;
                request.onupgradeneeded?.({} as IDBVersionChangeEvent);
                request.onsuccess?.({} as Event);
            });

            return request as unknown as IDBOpenDBRequest;
        }),
    } as Partial<IDBFactory> as IDBFactory;
}

describe("mirrorsAutologin", () => {
    it("reads and decodes a cookie value", () => {
        expect(getCookieValue("sso_token", "locale=en; sso_token=token%20123; other=1")).toBe("token 123");
    });

    it("validates relative backUrl values only", () => {
        expect(isValidMirrorsAutologinBackUrl("/games/slots?currency=EUR")).toBe(true);
        expect(isValidMirrorsAutologinBackUrl("https://evil.test/path")).toBe(false);
        expect(isValidMirrorsAutologinBackUrl("//evil.test/path")).toBe(false);
        expect(isValidMirrorsAutologinBackUrl("/\\evil")).toBe(false);
        expect(isValidMirrorsAutologinBackUrl(null)).toBe(false);
    });

    it("stores and reads the recovery token from shared IndexedDB layout", async() => {
        const idb = createFakeIndexedDb();

        expect(await setStoredMirrorsAutologinRecoveryToken("rt-123", idb)).toBe(true);
        expect(await getStoredMirrorsAutologinRecoveryToken(idb)).toBe("rt-123");
    });
});
