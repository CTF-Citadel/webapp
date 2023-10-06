import { defineConfig } from 'astro/config';
import svelte from "@astrojs/svelte";
import tailwind from "@astrojs/tailwind";
import deno from "@astrojs/deno";

// https://astro.build/config
export default defineConfig({
  image: {
    service: {
        entrypoint: "./src/components/void.ts",
    }
  },
  integrations: [svelte(), tailwind()],
  output: "server",
  adapter: deno(),
  experimental: {
    viewTransitions: true
  }
});