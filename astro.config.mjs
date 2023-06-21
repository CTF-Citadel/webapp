import { defineConfig } from 'astro/config';
import svelte from "@astrojs/svelte";
import deno from "@astrojs/deno";
import tailwind from "@astrojs/tailwind";

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  integrations: [svelte(), tailwind(), react()],
  output: "server",
  adapter: deno()
});