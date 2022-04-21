const path = require("path");
const { defineConfig } = require("vite");

module.exports = defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "react-query-toolkit",
      fileName: (format) => `index.${format}.js`,
      formats: ["es", "umd"],
    },
    minify: "esbuild",
    rollupOptions: {
      external: ["react", "react-dom", "react-query"],
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    coverage: { reporter: ["json"] },
  },
});
