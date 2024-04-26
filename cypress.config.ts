import { defineConfig } from 'cypress';
import createBundler from '@bahmutov/cypress-esbuild-preprocessor';
import { addCucumberPreprocessorPlugin } from '@badeball/cypress-cucumber-preprocessor';
import createEsbuildPlugin from '@badeball/cypress-cucumber-preprocessor/esbuild';

async function addCucumber(on, config) {
  await addCucumberPreprocessorPlugin(on, config); // This is required for the preprocessor to be able to generate JSON reports after each run, and more,
  on(
    'file:preprocessor', //This converts the feature files into js
    createBundler({ plugins: [createEsbuildPlugin(config)] })
  );
}

export default defineConfig({
  projectId: '6oef4g',
  e2e: {
    async setupNodeEvents(on, config) {
      await addCucumber(on, config);
      return config;
    },
    specPattern: '**/*.{feature,cy.ts}',
    viewportHeight: 667, //iphone 8
    viewportWidth: 375, //iphone 8
  },
  env: {
    url: 'http://127.0.0.1:8080',
  },
});
