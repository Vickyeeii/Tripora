# Tailwind CSS v4 Configuration

## What Changed

Tailwind CSS v4 uses a new CSS-first configuration approach instead of JavaScript config files.

## Configuration Location

All theme customization is now in `src/index.css` using the `@theme` directive:

```css
@import "tailwindcss";

@theme {
  --font-sans: 'Inter', system-ui, sans-serif;
  
  /* Custom colors defined as CSS variables */
  --color-primary-500: #627d98;
  --color-accent-500: #22c55e;
  --color-neutral-50: #fafaf9;
  /* etc... */
}
```

## Usage in Components

Use colors exactly as before:
- `bg-primary-700`
- `text-neutral-900`
- `border-accent-500`

## Benefits

- No separate config file needed
- CSS-native approach
- Faster build times
- Same utility classes

## Migration Complete

✅ Removed `tailwind.config.js`
✅ Added `@theme` directive to `index.css`
✅ Defined custom colors (primary, accent, neutral)
✅ Set Inter as default font
✅ All components work unchanged
