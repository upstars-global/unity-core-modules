import type { Plugin } from "vue";

import { filterNumbers } from "./filterNumbers";

const plugin: Plugin = {
    install(app) {
        app.directive("filter-numbers", filterNumbers);
    },
};

export default plugin;
