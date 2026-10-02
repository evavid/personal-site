import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { site } from "./src/config.ts";

export default defineConfig({
  site: site.url,
  integrations: [sitemap()],
  markdown: {
    // Code blocks are styled by global.css (calm, no colour theme).
    syntaxHighlight: false,
  },
});
