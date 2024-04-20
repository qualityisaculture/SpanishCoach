import { defineConfig } from "cypress";

export default defineConfig({
  projectId: "6oef4g",
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },

    viewportHeight: 667, //iphone 8
    viewportWidth: 375, //iphone 8
  },
  env: {
    "url": "http://127.0.0.1:8080"
  }
});
