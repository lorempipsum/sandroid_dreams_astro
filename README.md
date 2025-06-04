# Sandroid Dreams

This is the source for Sandroid's personal website built with [Astro](https://astro.build/).
It mixes Astro and React components and includes GIS data used for experiments.

## Quickstart

```sh
npm ci
npm run dev
```

Shell utilities live in the `scripts/` directory. `npm run build` automatically
runs `npm run check-filenames` to ensure there are no files with spaces in their
names. Format code with `npm run format`.

### Data sources

GeoJSON files and other datasets live in `src/data/`. These are loaded by map
components and are not generated automatically.

## Images

Astro has an <Image> and <Picture> component that can be used as such:

import myImage from "src/path/to/image.jpg";

<Image src={myImage} ..otherProps />
<Picture src={myImage} ..otherProps />

But the annyoing part is that each image has to be imported like above, and these can only be used in an astro component, or passed to a React component as a child.

Currently I just use full sized images everywhere. To help with the old bandwidth I have converted them to webp with ImageMagick.

Convert all images in a directory to a compress .webp: `mogrify -format webp -quality 80 *.jpg` (https://www.bartvandersanden.com/blog/2022/07/03/webp-imagick/)

## I think I had a like an ALBUM_SRC folder somewhere that was synced to this repo? How do I get images to here again?

## Astro Starter Kit: Basics

```sh
npm create astro@latest -- --template basics
```

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/withastro/astro/tree/latest/examples/basics)
[![Open with CodeSandbox](https://assets.codesandbox.io/github/button-edit-lime.svg)](https://codesandbox.io/p/sandbox/github/withastro/astro/tree/latest/examples/basics)
[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/withastro/astro?devcontainer_path=.devcontainer/basics/devcontainer.json)

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

![just-the-basics](https://github.com/withastro/astro/assets/2244813/a0a5533c-a856-4198-8470-2d67b1d7c554)

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   └── Card.astro
│   ├── layouts/
│   │   └── Layout.astro
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
