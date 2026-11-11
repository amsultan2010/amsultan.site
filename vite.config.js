import { resolve } from "node:path";
import { defineConfig } from "vite";

const ORIGIN = "https://abdullahsultan.tech";
const ROUTES = ["/", "/resume", "/links"];

function sitemapXml() {
  const urls = ROUTES.map(
    (path) => `  <url><loc>${ORIGIN}${path === "/" ? "/" : path}</loc></url>`,
  ).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

function rewrite(req) {
  const [path, query] = (req.url || "/").split("?");
  const bare = path.replace(/\/$/, "") || "/";
  if (bare === "/work" || bare === "/life") return { redirect: bare === "/life" ? "/#life" : "/" };
  if (bare === "/resume") return { url: "/resume.html" + (query ? `?${query}` : "") };
  if (bare === "/links") return { url: "/links.html" + (query ? `?${query}` : "") };
  if (path === "/sitemap.xml") return { sitemap: true };
  return null;
}

function siteRoutes() {
  const handle = (req, res, next) => {
    const hit = rewrite(req);
    if (!hit) return next();
    if (hit.redirect) {
      res.statusCode = 308;
      res.setHeader("Location", hit.redirect);
      res.end();
      return;
    }
    if (hit.sitemap) {
      res.setHeader("Content-Type", "application/xml");
      res.end(sitemapXml());
      return;
    }
    req.url = hit.url;
    next();
  };
  return {
    name: "site-routes",
    configureServer(server) {
      server.middlewares.use(handle);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handle);
    },
    generateBundle() {
      this.emitFile({ type: "asset", fileName: "sitemap.xml", source: sitemapXml() });
    },
  };
}

export default defineConfig({
  appType: "mpa",
  plugins: [siteRoutes()],
  build: {
    sourcemap: false,
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, "index.html"),
        links: resolve(import.meta.dirname, "links.html"),
        notFound: resolve(import.meta.dirname, "404.html"),
        resume: resolve(import.meta.dirname, "resume.html"),
      },
    },
  },
});
