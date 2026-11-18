import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/services/api/requests/configs", () => ({
    loadMainWidgetConfigReq: vi.fn(),
}));

import { type MainWidgetItem, Widgets } from "../../src/models/mainWidget";
import * as configReqs from "../../src/services/api/requests/configs";
import { loadMainWidgetConfig } from "../../src/services/configs";
import { useCommon } from "../../src/store/common";

describe("loadMainWidgetConfig", () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.mocked(configReqs.loadMainWidgetConfigReq).mockReset();
    });

    it("stores widgets list and full config with preview", async () => {
        const response = {
            preview: [ "wheel" ],
            widgets: [
                { name: "MAIN_WIDGET.WHEEL", type: "wheel", image: "wheel.png", previewImage: "wheel-preview.png", isNew: true },
                { name: "MAIN_WIDGET.QUEST", type: "quest", image: "quest.png", hidden: true },
            ],
        };
        vi.mocked(configReqs.loadMainWidgetConfigReq).mockResolvedValue(response);

        await loadMainWidgetConfig();

        const store = useCommon();
        expect(store.widgetsConfig).toEqual(response.widgets);
        expect(store.mainWidgetConfig).toEqual(response);
    });

    it("keeps store empty when config has no widgets", async () => {
        vi.mocked(configReqs.loadMainWidgetConfigReq).mockResolvedValue({ preview: [ "wheel" ] });

        await loadMainWidgetConfig();

        const store = useCommon();
        expect(store.widgetsConfig).toEqual([]);
        expect(store.mainWidgetConfig).toBeNull();
    });

    it("keeps store empty when request fails", async () => {
        vi.mocked(configReqs.loadMainWidgetConfigReq).mockResolvedValue(undefined);

        await loadMainWidgetConfig();

        const store = useCommon();
        expect(store.widgetsConfig).toEqual([]);
        expect(store.mainWidgetConfig).toBeNull();
    });

    it("returns cached widgets without request when they are already loaded", async () => {
        const store = useCommon();
        const widgets: MainWidgetItem[] = [ { name: "Quest", image: "quest.png", type: Widgets.quest } ];
        store.setMainWidgetConfig(widgets);

        await expect(loadMainWidgetConfig()).resolves.toEqual(widgets);
        expect(configReqs.loadMainWidgetConfigReq).not.toHaveBeenCalled();
    });
});
