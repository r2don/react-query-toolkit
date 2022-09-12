const path = require("path");
const { defineConfig } = require("vite");

module.exports = defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "react-query-toolkit",
      fileName: (format) => `index.${format}.js`,
      formats: ["es", "cjs"],
    },
    minify: "esbuild",
    rollupOptions: {
      external: ["react", "react-dom", "@tanstack/react-query"],
      output: {
        preserveModules: true,
      },
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    coverage: { reporter: ["json"] },
  },
});
