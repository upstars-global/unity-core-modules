import { describe, expect, it, vi } from "vitest";

import { EventBus, eventBusPlugin } from "../../src/plugins/EventBus";

describe("EventBus", () => {
    it("$on + $emit call listener with args", () => {
        const event = `unit.event.${ Date.now() }`;
        const listener = vi.fn();

        EventBus.$on(event, listener);
        EventBus.$emit(event, "payload", 42);
        EventBus.$off(event, listener);

        expect(listener).toHaveBeenCalledOnce();
        expect(listener).toHaveBeenCalledWith("payload", 42);
    });

    it("$off removes listener", () => {
        const event = `unit.event.${ Date.now() }`;
        const listener = vi.fn();

        EventBus.$on(event, listener);
        EventBus.$off(event, listener);
        EventBus.$emit(event, "payload");

        expect(listener).not.toHaveBeenCalled();
    });

    it("$once listener is called only once", () => {
        const event = `unit.event.${ Date.now() }`;
        const listener = vi.fn();

        EventBus.$once(event, listener);
        EventBus.$emit(event, "first");
        EventBus.$emit(event, "second");

        expect(listener).toHaveBeenCalledOnce();
        expect(listener).toHaveBeenCalledWith("first");
    });
});

describe("eventBusPlugin", () => {
    it("install sets $bus in globalProperties", () => {
        const app = {
            config: {
                globalProperties: {},
            },
        };

        eventBusPlugin.install(app);

        expect(app.config.globalProperties.$bus).toBe(EventBus);
    });
});
