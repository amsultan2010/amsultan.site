# abdullah sultan portfolio

Static, motion-led portfolio built with:

- **HTML**, **CSS**, and vanilla **JavaScript**
- **GSAP** + ScrollTrigger
- **Vite** for local development and production builds

Live: [www.amsultan.site](https://www.amsultan.site)

## Layout

- `index.html`, `404.html`: the two pages Vite builds
- `src/`: styles and scripts (`main.js` for page motion, `scroll.js` for Lenis and the scroll lock, `rail` for the draggable rails, `network` for the neural network in the loader and behind the about statement)
- `public/`: images, icons, the resume, and crawler files, served as they are

## Develop

Needs Node 24 (`nvm use` picks it up from `.nvmrc`).

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Environment

No keys are needed to run the site.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Security reports go through [SECURITY.md](SECURITY.md).

## License

The code is [MIT](LICENSE): take the layout, the motion, the build setup, whatever is useful.

The license does not cover:

- My own content: the writing, my name and likeness, photos, the resume, and project images under `public/`. Swap these out if you reuse the site.
- Third-party images and logos under `public/images/` (film and show covers, game characters, brand marks), which belong to their owners.
- Dependencies, which keep their own licenses. GSAP in particular ships under the [GSAP standard license](https://gsap.com/community/standard-license/), not MIT.
