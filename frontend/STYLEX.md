# StyleX Setup Guide

This document explains how StyleX is configured and used in the frontend Next.js application.

## Overview

StyleX is a CSS-in-JS library that provides type-safe, zero-runtime styling for React components. It compiles styles at build time, generating optimized CSS with minimal runtime overhead.

## Installation

The following StyleX packages are installed:

```json
{
  "dependencies": {
    "@stylexjs/nextjs-plugin": "^0.11.1",
    "@stylexjs/stylex": "^0.17.4"
  },
  "devDependencies": {
    "@stylexjs/babel-plugin": "^0.17.4"
  }
}
```

## Configuration Files

### 1. `babel.config.js`

The Babel plugin is configured to transform StyleX code at build time:

```javascript
module.exports = {
  presets: ['next/babel'],
  plugins: [
    [
      '@stylexjs/babel-plugin',
      {
        dev: process.env.NODE_ENV === 'development',
        runtimeInjection: true,
        genConditionalClasses: true,
        treeshakeCompensation: true,
        unstable_moduleResolution: {
          type: 'commonJS',
          rootDir: __dirname,
        },
      },
    ],
  ],
};
```

**Key Options:**
- `dev`: Enables development mode features (source maps, debugging)
- `runtimeInjection`: Injects runtime code for dynamic styles
- `genConditionalClasses`: Generates classes for conditional styling
- `treeshakeCompensation`: Optimizes tree-shaking for unused styles
- `unstable_moduleResolution`: Configures module resolution (CommonJS)

### 2. `stylex.config.mjs`

The StyleX configuration file for Next.js:

```javascript
/** @type {import('@stylexjs/nextjs-plugin').Config} */
export default {
  dev: process.env.NODE_ENV === 'development',
  stylexImports: ['@stylexjs/stylex'],
  useCSSLayers: false,
  classNamePrefix: 'x',
  unstable_moduleResolution: {
    type: 'commonJS',
    rootDir: __dirname,
  },
};
```

**Key Options:**
- `dev`: Development mode flag
- `stylexImports`: Array of StyleX import paths
- `useCSSLayers`: Whether to use CSS layers (disabled in this setup)
- `classNamePrefix`: Prefix for generated class names (default: 'x')
- `unstable_moduleResolution`: Module resolution configuration

### 3. `postcss.config.mjs`

PostCSS is configured for Tailwind CSS, which works alongside StyleX:

```javascript
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
```

**Note:** StyleX and Tailwind CSS can coexist. StyleX handles component-specific styles, while Tailwind handles utility classes.

### 4. `globals.css`

The global CSS file contains Tailwind directives and CSS variables. StyleX styles are automatically injected into the build output and don't need explicit imports in this file.

```css
@import "tailwindcss";
@import "tw-animate-css";

/* CSS variables and theme configuration */
:root {
  --radius: 0.625rem;
  --background: #000000;
  /* ... more variables */
}
```

**Important:** StyleX-generated CSS is automatically added to the build output. You don't need to import it manually in `globals.css`.

### 5. `app/layout.tsx`

The root layout imports `globals.css` to ensure global styles are loaded:

```tsx
import "./globals.css";
// ... other imports

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
```

## Usage in Components

### Basic Import

Import StyleX at the top of your component file:

```tsx
import * as stylex from "@stylexjs/stylex";
```

### Creating Styles

Define styles using `stylex.create()`:

```tsx
const styles = stylex.create({
  container: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    padding: "1rem",
    backgroundColor: "#000000",
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: 600,
    color: "#ffffff",
  },
  // Media queries
  "@media (max-width: 768px)": {
    container: {
      padding: "0.5rem",
      gap: "0.5rem",
    },
  },
});
```

### Applying Styles

Use `stylex.props()` to apply styles to elements:

```tsx
export default function MyComponent() {
  return (
    <div {...stylex.props(styles.container)}>
      <h1 {...stylex.props(styles.title)}>Hello World</h1>
    </div>
  );
}
```

### Conditional Styles

You can combine multiple styles conditionally:

```tsx
<div {...stylex.props(
  styles.base,
  isActive && styles.active,
  isDisabled && styles.disabled
)}>
  Content
</div>
```

### Pseudo-selectors and States

StyleX supports pseudo-selectors and state selectors:

```tsx
const styles = stylex.create({
  button: {
    padding: "0.5rem 1rem",
    backgroundColor: "#171717",
    ":hover": {
      backgroundColor: "#262626",
    },
    ":focus": {
      outline: "2px solid #ffffff",
    },
    ":active": {
      transform: "scale(0.98)",
    },
  },
});
```

### Media Queries

Media queries are supported at the style definition level:

```tsx
const styles = stylex.create({
  container: {
    display: "flex",
    "@media (max-width: 768px)": {
      flexDirection: "column",
      padding: "0.5rem",
    },
    "@media (min-width: 1024px)": {
      maxWidth: "1200px",
      margin: "0 auto",
    },
  },
});
```

## Example Component

Here's a complete example from the codebase:

```tsx
"use client";

import * as stylex from "@stylexjs/stylex";

const styles = stylex.create({
  container: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    padding: "1rem",
    backgroundColor: "#000000",
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: "#262626",
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: 400,
    color: "#fafafa",
    fontFamily: "var(--font-geist-sans)",
    "@media (max-width: 768px)": {
      fontSize: "1.25rem",
    },
  },
});

export default function Header() {
  return (
    <header {...stylex.props(styles.container)}>
      <h1 {...stylex.props(styles.title)}>Sonotrade</h1>
    </header>
  );
}
```

## Integration with Tailwind CSS

StyleX and Tailwind CSS work together:

- **StyleX**: Use for component-specific, reusable styles
- **Tailwind**: Use for utility classes and global design tokens

You can use both in the same component:

```tsx
<div 
  {...stylex.props(styles.container)}
  className="bg-background text-foreground"
>
  Content
</div>
```

## CSS Variables

You can reference CSS variables defined in `globals.css`:

```tsx
const styles = stylex.create({
  text: {
    fontFamily: "var(--font-geist-sans)",
    color: "var(--foreground)",
  },
});
```

## Development vs Production

- **Development**: StyleX generates source maps and includes debugging information
- **Production**: Styles are optimized, tree-shaken, and minified

The configuration automatically switches based on `NODE_ENV`.

## Best Practices

1. **Component-scoped styles**: Use StyleX for styles specific to a component
2. **Reusable styles**: Create shared style objects for common patterns
3. **Type safety**: StyleX provides TypeScript support for style properties
4. **Performance**: StyleX compiles to CSS at build time, resulting in zero runtime overhead
5. **Media queries**: Define responsive styles using media query objects
6. **CSS variables**: Leverage CSS variables from `globals.css` for theming

## Troubleshooting

### Styles not applying

1. Ensure `babel.config.js` is properly configured
2. Check that `@stylexjs/babel-plugin` is in your `devDependencies`
3. Restart the Next.js dev server after configuration changes

### Build errors

1. Verify `stylex.config.mjs` matches your project structure
2. Ensure `unstable_moduleResolution.rootDir` points to the correct directory
3. Check that all StyleX packages are the same version

### Type errors

1. Ensure TypeScript can resolve `@stylexjs/stylex` types
2. Check `tsconfig.json` includes the necessary type definitions

## File Structure

```
frontend/
├── app/
│   ├── layout.tsx          # Root layout (imports globals.css)
│   └── globals.css          # Global styles and CSS variables
├── components/              # Components using StyleX
│   └── ...
├── babel.config.js          # Babel configuration with StyleX plugin
├── stylex.config.mjs        # StyleX configuration
├── postcss.config.mjs       # PostCSS configuration
└── package.json             # Dependencies
```

## Additional Resources

- [StyleX Documentation](https://stylexjs.com/docs/)
- [StyleX GitHub](https://github.com/facebook/stylex)
- [Next.js with StyleX](https://stylexjs.com/docs/learn/getting-started/nextjs/)
