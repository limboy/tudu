# Changelog

All notable changes to this project are documented here.
This file is generated automatically from [Conventional Commits](https://www.conventionalcommits.org/) — run `npm run changelog` to regenerate.

## Unreleased

### Features

- add script to list and validate documentation metadata ([a9a57a1](https://github.com/limboy/tudu/commit/a9a57a19d00700675fcde504a166329361f8b632))
- configure electron-builder for macOS production release and notarization ([3b3dec3](https://github.com/limboy/tudu/commit/3b3dec36bbefeee85a51ec5413797a0728cd46b0))
- add .env.example template for Apple service configuration ([345203c](https://github.com/limboy/tudu/commit/345203cc91cde7445aae57a09c260bf6a2350a2d))
- add application icon and favicon support for desktop and web interfaces ([777eb1d](https://github.com/limboy/tudu/commit/777eb1d40e305a47b47b7053c58195629febbe5a))
- highlight overdue card due dates in orange in CardsTable ([337cc32](https://github.com/limboy/tudu/commit/337cc32e456767d8c07e6df20c5ab9a805de57d8))
- add optional created date column to cards table ([0041992](https://github.com/limboy/tudu/commit/00419921ad9debe00556b3b3494c3443369465fa))
- add periodic refresh to update relative times in CardsTable every minute ([6eae3c5](https://github.com/limboy/tudu/commit/6eae3c59633a11bbbad494b11647c73702b97c27))
- persist visible columns state in localStorage for CardsTable ([48c7b2c](https://github.com/limboy/tudu/commit/48c7b2c9b0bbad58efffdccd26f819e59a9be47b))
- add window drag support and layout adjustments to StudyView header ([d18ef28](https://github.com/limboy/tudu/commit/d18ef2869c05c451758d6b714cdffa043732f52b))
- add Switch component and replace column visibility checkboxes with switches in CardsTable ([ef2fde3](https://github.com/limboy/tudu/commit/ef2fde399a38fe239fa35492aaa632af92f48e3d))
- add column visibility toggle to CardsTable using dropdown menu ([fc46163](https://github.com/limboy/tudu/commit/fc461635d530eed37218f260ccbb9b004a2a68a4))
- add deck import and export functionality via JSON files ([e7f03af](https://github.com/limboy/tudu/commit/e7f03afb4d720a66b27cdd96deecdaa134381b7f))
- add background bars and minimum point size to ReviewsChart for improved visibility ([fb38b85](https://github.com/limboy/tudu/commit/fb38b85c6eb2ada4068263e113deaeeefed32cdf))
- add tabs to DeckStatsPanel and update ThreePane right panel styling ([7f3e82b](https://github.com/limboy/tudu/commit/7f3e82b50da3cf94064016a2b66f0a8185249558))
- add window drag support, resizable layout panels, and a simplified card filter dropdown ([29ecc3c](https://github.com/limboy/tudu/commit/29ecc3cb3c3c26e19797a6f3a0c1ca0a95dcaf0f))
- build flashcard app with decks, FSRS study, and SQLite persistence ([b2adb0f](https://github.com/limboy/tudu/commit/b2adb0fabdb129329484ccc5583ef3ec79ce9089))
- initialize project with React, Electron, Vite, and shadcn/ui components ([f28d37c](https://github.com/limboy/tudu/commit/f28d37cd5dc4f9d0d6682a8d630a18446d549f5f))

### Performance

- disable animation in ReviewsChart to improve rendering performance ([ba7d748](https://github.com/limboy/tudu/commit/ba7d748031e59cb3e16eacd3d1e7d1ae6b9c11e9))

### Refactoring

- standardize UI dimensions using Tailwind spacing utilities and improve Electron main process stability ([61e391c](https://github.com/limboy/tudu/commit/61e391c2adeb67bc9fe9f9fd2b2a4fb5f661ed04))
- replace standard buttons with custom styled components for grade selection ([cd93d40](https://github.com/limboy/tudu/commit/cd93d40828c478ae4dc2c602b8963555b209f02f))
- simplify DeckStatsPanel layout and update StatCell styling for improved readability ([4d17b62](https://github.com/limboy/tudu/commit/4d17b623696197336ffd3fa24cadb9a4ffd20c02))
- update ThreePane resizer constraints, state handling, and z-index layering ([287ecfa](https://github.com/limboy/tudu/commit/287ecfa516e1344a9fa17c77bcac5ff6c45523ef))
- move Add and Study actions from TopBar to CardsFilters component ([9340616](https://github.com/limboy/tudu/commit/9340616a105b89cb022da4ce5432f89a780afed0))

### Documentation

- add AGENTS.md and CLAUDE.md to provide project guidelines for AI agents ([9a23105](https://github.com/limboy/tudu/commit/9a23105bba66f4f02db1769ab1c82747e8bd6461))
- add technical documentation for algorithm, architecture, build process, and data model ([c6e0ccc](https://github.com/limboy/tudu/commit/c6e0cccc4b6e8f9cc870dec9c72bb5f1f04aba27))
- add project README with setup, installation, and tech stack details ([c03e11b](https://github.com/limboy/tudu/commit/c03e11bd21b949efb35cd61652eefce733032dcc))

### Styles

- fix column widths and alignment in CardsTable for consistent layout ([383e54d](https://github.com/limboy/tudu/commit/383e54d486c4ba8b11affc85c4a9ab03fccc9e04))
- adjust sidebar width constraints and default right pane width ([6b85990](https://github.com/limboy/tudu/commit/6b85990f8c72640f1ea1992039185c9e6347f7d3))
- adjust resize handle margin to -mr-1 for better hit area alignment ([1b7c2da](https://github.com/limboy/tudu/commit/1b7c2da642ae89219df3d713d6106d0644bbfe6b))
- add horizontal padding to table columns for better alignment ([3d8bb5a](https://github.com/limboy/tudu/commit/3d8bb5a9e7396c0e2b9acc3208fc150d6747e817))

### CI

- add GitHub Actions workflow to build, sign, and publish macOS releases ([6dd6975](https://github.com/limboy/tudu/commit/6dd697546e643428ec04d04c03a2b9f9525f3e85))

### Chores

- optimize electron-builder to exclude build-time dependencies ([b14b0c0](https://github.com/limboy/tudu/commit/b14b0c044378faf1dc1c315595a53a8aff5bff77))
- standardize build output directory to dist and update electron-builder configuration ([ed9e1f2](https://github.com/limboy/tudu/commit/ed9e1f216dbe4995955a35030d8385606476e575))
