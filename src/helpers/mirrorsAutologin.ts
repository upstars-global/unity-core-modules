export const MIRRORS_AUTOLOGIN_DB_NAME = "SERVICE_WORKER";
export const MIRRORS_AUTOLOGIN_STORE_NAME = "redirectModule";
export const MIRRORS_AUTOLOGIN_RECOVERY_TOKEN_KEY = "rt";
export const MIRRORS_AUTOLOGIN_COOKIE_NAME = "sso_token";
export const MIRRORS_AUTOLOGIN_HANDOVER_PATH = "/handover";
export const MIRRORS_AUTOLOGIN_REDEEM_PATH = "/api/sso/redeem";
export const MIRRORS_AUTOLOGIN_ACCEPT_HEADER = "application/vnd.s.v1+json";

function getIndexedDb(): IDBFactory | null {
    return typeof indexedDB === "undefined" ? null : indexedDB;
}

function openAutologinDb(idb: IDBFactory): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = idb.open(MIRRORS_AUTOLOGIN_DB_NAME, 1);

        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(MIRRORS_AUTOLOGIN_STORE_NAME)) {
                db.createObjectStore(MIRRORS_AUTOLOGIN_STORE_NAME);
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function putRecoveryToken(db: IDBDatabase, recoveryToken: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const tx = db.transaction(MIRRORS_AUTOLOGIN_STORE_NAME, "readwrite");

        tx.objectStore(MIRRORS_AUTOLOGIN_STORE_NAME).put(recoveryToken, MIRRORS_AUTOLOGIN_RECOVERY_TOKEN_KEY);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

function getRecoveryToken(db: IDBDatabase): Promise<string> {
    return new Promise((resolve) => {
        const tx = db.transaction(MIRRORS_AUTOLOGIN_STORE_NAME, "readonly");
        const request = tx.objectStore(MIRRORS_AUTOLOGIN_STORE_NAME).get(MIRRORS_AUTOLOGIN_RECOVERY_TOKEN_KEY);

        request.onsuccess = () => {
            resolve(typeof request.result === "string" ? request.result : "");
        };
        request.onerror = () => resolve("");
    });
}

export function getCookieValue(name: string, cookieSource = typeof document === "undefined" ? "" : document.cookie): string {
    const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const match = cookieSource.match(new RegExp(`(?:^|; )${ escapedName }=([^;]*)`));

    return match ? decodeURIComponent(match[1]) : "";
}

export async function setStoredMirrorsAutologinRecoveryToken(
    recoveryToken: string,
    idb: IDBFactory | null = getIndexedDb(),
): Promise<boolean> {
    if (!idb || !recoveryToken) {
        return false;
    }

    let db: IDBDatabase | null = null;

    try {
        db = await openAutologinDb(idb);
        await putRecoveryToken(db, recoveryToken);

        return true;
    } catch {
        return false;
    } finally {
        db?.close();
    }
}

export async function getStoredMirrorsAutologinRecoveryToken(
    idb: IDBFactory | null = getIndexedDb(),
): Promise<string> {
    if (!idb) {
        return "";
    }

    let db: IDBDatabase | null = null;

    try {
        db = await openAutologinDb(idb);

        return await getRecoveryToken(db);
    } catch {
        return "";
    } finally {
        db?.close();
    }
}

export async function persistMirrorsAutologinRecoveryToken(): Promise<boolean> {
    const recoveryToken = getCookieValue(MIRRORS_AUTOLOGIN_COOKIE_NAME);

    return setStoredMirrorsAutologinRecoveryToken(recoveryToken);
}

export function isValidMirrorsAutologinBackUrl(value: string | null): boolean {
    if (!value || typeof value !== "string") {
        return false;
    }

    try {
        const parsedUrl = new URL(value);

        return parsedUrl.protocol === "";
    } catch {
        return value.startsWith("/") && !value.startsWith("//") && !value.includes("\\");
    }
}
