import { isServer } from "../../helpers/ssrHelpers";
import type { INotification } from "../../models/WSnotices";
import { IndexedDBNames, IndexedDBStoreNames } from "./consts";
import IndexedDBController from "./indexedDBCreator";

export function useNotificationDB() {
    let notificationDB: IndexedDBController<INotification> | undefined = undefined;
    if (!isServer) {
        notificationDB = new IndexedDBController<INotification>(
            IndexedDBNames.notifications,
            IndexedDBStoreNames.notifyList,
        );
    }

    return {
        notificationDB,
    };
}
