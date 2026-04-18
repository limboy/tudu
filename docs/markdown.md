---
summary: "Details about how Markdown is rendered in Tudu, including supported features like math formulas and GFM."
read_when:
  - You are adding new markdown formats or plugins.
  - You need to style markdown output in the UI.
title: "Markdown Rendering"
---

# Markdown Rendering

Tudu uses `react-markdown` to render formatted text in flashcards securely and robustly. The primary component for displaying this content is `MarkdownView` (`src/components/cards/MarkdownView.tsx`).

## Supported Features

### GitHub Flavored Markdown (GFM)
Built-in support for GFM using `remark-gfm`. This allows you to use features like:
- Tables
- Task lists
- Strikethrough
- Autolinks

### Math Formulas
Math equations are fully supported and rendered beautifully using KaTeX, via `remark-math` and `rehype-katex`.
- **Inline Math**: Wrap formulas with single dollar signs (e.g., `$E=mc^2$`).
- **Block Math**: Wrap formulas with double dollar signs (e.g., `$$E=mc^2$$`).

You can review how this works or change styles in `src/components/cards/MarkdownView.tsx`. KaTeX styles are imported globally where math rendering occurs.

## Custom Styling
Styling for all markdown elements is managed via customized Tailwind utility classes directly within the `MarkdownView` component to closely match Tudu's branding and interface design without relying on bulky external prose libraries.
