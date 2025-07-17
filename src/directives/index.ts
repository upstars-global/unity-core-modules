import type { Plugin } from "vue";

import { filterExcludeNumbers } from "./filterExcludeNumbers";

const plugin: Plugin = {
    install(app) {
        app.directive("filter-exclude-numbers", filterExcludeNumbers);
    },
};

export default plugin;
