import log from "../Logger";
import { IndexedDBEvents } from "./consts";

type keyType = string | number;

const DEFAULT_TTL = 2 * 60 * 60 * 1000;

export default class IndexedDBController<T> {
    private db: IDBDatabase | undefined;
    eventTarget = new EventTarget();

    constructor(private dbName: string, private storeName: string) {
        if (typeof indexedDB !== "undefined") {
            this.openDB();
        } else {
            log.error("INDEXEDDB_ERROR", "indexedDB is not supported");
        }
    }

    private notifyDataChange(eventName: IndexedDBEvents = IndexedDBEvents.deleteData) {
        const event = new Event(eventName);
        this.eventTarget.dispatchEvent(event);
    }

    private openDB() {
        const request = indexedDB.open(this.dbName);

        request.onupgradeneeded = (event) => {
            this.db = (event.target as IDBOpenDBRequest).result;
            this.db.createObjectStore(this.storeName, { keyPath: "id" });
        };

        request.onsuccess = (event) => {
            this.db = (event.target as IDBOpenDBRequest).result;
        };

        request.onerror = (event) => {
            log.error("OPENING_INDEXEDDB_ERROR", event);
        };

        setTimeout(() => this.scheduleMessageDeletion(), DEFAULT_TTL);
    }

    async saveData(key: keyType, data: T, ttl: number = DEFAULT_TTL) {
        const transaction = this.db?.transaction(this.storeName, "readwrite");
        const store = transaction?.objectStore(this.storeName);

        const existingDataRequest = store?.get(key);
        existingDataRequest?.addEventListener("success", () => {
            if (!existingDataRequest.result) {
                const dataToStore: T & { expiry: number } = { ...data, id: key, expiry: Date.now() + ttl };
                store?.add(dataToStore);
                setTimeout(() => this.deleteData(key), ttl);
            }
        });
    }

    async getData(key: keyType): Promise<T | undefined> {
        const transaction = this.db?.transaction(this.storeName, "readonly");
        const store = transaction?.objectStore(this.storeName);
        const request = store?.get(key);

        return new Promise((resolve, reject) => {
            request?.addEventListener("success", (event) => {
                resolve((event.target as IDBRequest).result);
            });

            request?.addEventListener("error", (event) => {
                reject((event.target as IDBRequest).error);
            });
        });
    }

    async getAllData(): Promise<T[] | undefined> {
        await this.scheduleMessageDeletion();

        const transaction = this.db?.transaction(this.storeName, "readonly");
        const store = transaction?.objectStore(this.storeName);
        const request = store?.getAll();

        return new Promise(async (resolve, reject) => {
            request?.addEventListener("success", (event) => {
                resolve((event.target as IDBRequest).result);
            });

            request?.addEventListener("error", (event) => {
                reject((event.target as IDBRequest).error);
            });
        });
    }

    async deleteData(key: keyType): Promise<void> {
        const transaction = this.db?.transaction(this.storeName, "readwrite");
        const store = transaction?.objectStore(this.storeName);
        if (!store || !transaction) {
            return;
        }

        store.delete(key);
        await new Promise<void>((resolve) => {
            transaction.oncomplete = () => resolve();
            this.notifyDataChange(IndexedDBEvents.deleteData);
        });
    }

    async clearAllData(): Promise<void> {
        const transaction = this.db?.transaction(this.storeName, "readwrite");
        const store = transaction?.objectStore(this.storeName);
        store?.clear();
    }

    async scheduleMessageDeletion(): Promise<void> {
        const transaction = this.db?.transaction(this.storeName, "readwrite");
        const store = transaction?.objectStore(this.storeName);

        if (!store || !transaction) {
            return;
        }
        const now = new Date().getTime();

        store.openCursor().onsuccess = (event: unknown) => {
            const cursor = event.target.result;
            if (cursor) {
                const expirationTime = cursor.value.expiry || 0;
                if (expirationTime <= now) {
                    store.delete(cursor.value.id);
                }
                cursor.continue();
            }
        };

        await new Promise<void>((resolve) => {
            transaction.oncomplete = () => resolve();
        });
    }
}
