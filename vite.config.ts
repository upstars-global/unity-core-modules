import { resolve } from "path";
import { defineConfig } from "vite";
import {nodePolyfills} from "vite-plugin-node-polyfills";
import dts from "vite-plugin-dts"

export default defineConfig({
  plugins: [nodePolyfills(), dts()],
  build: {
    lib: {
      entry: {
          main: resolve(__dirname, "src/main.ts"),
          consts: resolve(__dirname, "src/consts/index.ts"),
          controllers: resolve(__dirname, "src/controllers/index.ts"),
          helpers: resolve(__dirname, "src/helpers/index.ts"),
          models: resolve(__dirname, "src/models/index.ts"),
          plugins: resolve(__dirname, "src/plugins/index.ts"),
          services: resolve(__dirname, "src/services/index.ts"),
          store: resolve(__dirname, "src/store/index.ts"),
          types: resolve(__dirname, "src/types/index.ts")
      },
      name: 'UnityCoreModule',
      fileName: (format, entryName) => entryName === "main" ? `${entryName}.${format}.js` : `${entryName}/index.${format}.js`,
    },
    rollupOptions: {
      // TODO: remove aliases after moving files
      external: ["vue", "pinia", /^@front\/core/, /^@consts/, /^@components\//, /^@controllers\//, /^@theme\//, /^@modules\//, /^@store\//],
      output: {
      },
    },
  },
})
