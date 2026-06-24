// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import remarkFixDashes from './scripts/remark-fix-dashes.mjs';

export default defineConfig({
  // Replace with your website URL (required for sitemap generation)
  site: 'https://abdullahmsultan.me',

  // URL configuration
  trailingSlash: 'never', // Removes trailing slashes from URLs

  // Vite configuration
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      dedupe: ['react', 'react-dom'],
    },
  },

  // Markdown configuration
  markdown: {
    remarkPlugins: [remarkMath, remarkGfm, remarkFixDashes],
    rehypePlugins: [rehypeKatex],
    shikiConfig: {
      theme: 'nord',
      wrap: true,
    },
  },

  // Required integrations
  integrations: [
    react(), // Enables React components
    sitemap({
      // Generates sitemap
      serialize: (item) => {
        const url = item.url.endsWith('/') ? item.url.slice(0, -1) : item.url;
        return { ...item, url };
      },
    }),
  ],

  // Deployment configuration
  output: 'static',
  devToolbar: {
    enabled: false,
  },
});
