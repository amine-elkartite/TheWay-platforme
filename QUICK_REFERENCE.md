# TheWay Design System - Quick Reference Card

**Print this or bookmark it!** — Most commonly used CSS variables

---

## 🎨 COLORS - Most Used

```css
/* Primary Actions */
var(--color-primary)           /* #f59e0b - Gold */
var(--color-primary-hover)     /* #d97706 - Dark Gold */

/* Text */
var(--color-text-primary)      /* #1e293b - Main text */
var(--color-text-secondary)    /* #64748b - Secondary text */
var(--color-text-tertiary)     /* #94a3b8 - Light text */

/* Backgrounds */
var(--color-bg-main)           /* #f8fafc - Page background */
var(--color-bg-card)           /* #ffffff - Card background */

/* Borders & Status */
var(--color-border)            /* #e2e8f0 - Default border */
var(--color-success)           /* #22c55e - Success/Green */
var(--color-error)             /* #ef4444 - Error/Red */
var(--color-warning)           /* #f97316 - Warning/Orange */
```

---

## 📐 SPACING - Essential Sizes

```css
var(--space-md)                /* 12px - Default padding */
var(--space-lg)                /* 16px - Standard padding */
var(--space-xl)                /* 20px - Generous padding */
var(--space-2xl)               /* 24px - Section padding */
var(--space-3xl)               /* 32px - Large sections */
```

**Grid:** 8px scale  
**Common Use:** `padding: var(--space-lg)` or `gap: var(--space-md)`

---

## 🔲 RADIUS - Border Corners

```css
var(--radius-sm)               /* 6px - Small elements */
var(--radius-md)               /* 8px - Buttons, inputs */
var(--radius-lg)               /* 12px - Cards, modals */
var(--radius-xl)               /* 16px - Large panels */
var(--radius-full)             /* 9999px - Circles/avatars */
```

---

## 🌑 SHADOWS - Depth Effects

```css
var(--shadow-sm)               /* Light shadow */
var(--shadow-md)               /* Medium shadow */
var(--shadow-lg)               /* Heavy shadow */
```

**Usage:** `box-shadow: var(--shadow-md);`

---

## ⚡ TRANSITIONS - Animation

```css
var(--transition-fast)         /* 0.15s - Quick changes */
var(--transition-base)         /* 0.2s - Default hover */
var(--transition-slow)         /* 0.3s - Slow animations */
```

**Usage:** `transition: all var(--transition-base);`

---

## 📝 TYPOGRAPHY - Font Sizes

```css
var(--font-size-sm)            /* 13px - Small text */
var(--font-size-base)          /* 14px - Default text */
var(--font-size-md)            /* 16px - Medium text */
var(--font-size-lg)            /* 18px - Large text */
var(--font-size-2xl)           /* 24px - Heading */
var(--font-size-3xl)           /* 32px - Title */
var(--font-size-4xl)           /* 36px - Hero */
```

**Font Family:** `var(--font-family)` - Inter, system fonts  
**Font Weights:** `300` (light), `400` (normal), `500` (medium), `600` (semibold), `700` (bold), `800` (extrabold)

---

## 🎯 COMMON PATTERNS

### Button with Hover
```css
.button {
    background: var(--color-primary);
    color: white;
    padding: var(--space-md) var(--space-lg);
    border-radius: var(--radius-md);
    transition: all var(--transition-base);
}
.button:hover {
    background: var(--color-primary-hover);
    box-shadow: var(--shadow-md);
}
```

### Card Component
```css
.card {
    background: var(--color-bg-card);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--space-2xl);
    box-shadow: var(--shadow-sm);
}
```

### Input Field
```css
input {
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--space-md) var(--space-lg);
    font-family: var(--font-family);
}
input:focus {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
}
```

### Flexbox Container
```html
<div class="flex gap-lg">
    <div>Item 1</div>
    <div>Item 2</div>
</div>
```

### Status Badge
```html
<div class="bg-success rounded-md">✓ Success</div>
<div class="bg-error rounded-md">✗ Error</div>
<div class="bg-warning rounded-md">⚠ Warning</div>
```

---

## 📱 RESPONSIVE BREAKPOINTS

```css
Desktop:       1024px and up (full design)
Tablet:        768px - 1023px (optimized)
Mobile:        < 768px (touch-friendly)
Extra Small:   < 480px (minimal)
```

**Media Query:**
```css
@media (max-width: 768px) {
    /* Mobile styles */
}
```

---

## ⌨️ LAYOUT DIMENSIONS

```css
--sidebar-width: 260px         /* Fixed sidebar */
--header-height: 64px          /* Top header */
--container-max-width: 1400px  /* Max container width */
--container-padding: var(--space-2xl)
```

---

## 🔤 SEMANTIC CLASS NAMES

```html
<!-- Text Colors -->
<p class="text-primary">Primary text</p>
<p class="text-secondary">Secondary text</p>
<p class="text-tertiary">Tertiary text</p>

<!-- Backgrounds -->
<div class="bg-success">Success background</div>
<div class="bg-error">Error background</div>
<div class="bg-info">Info background</div>

<!-- Spacing Utilities -->
<div class="gap-md">Items with 12px gap</div>
<div class="gap-lg">Items with 16px gap</div>

<!-- Radius -->
<div class="rounded-sm">6px corners</div>
<div class="rounded-md">8px corners</div>
<div class="rounded-lg">12px corners</div>

<!-- Shadows -->
<div class="shadow-sm">Light shadow</div>
<div class="shadow-md">Medium shadow</div>
<div class="shadow-lg">Heavy shadow</div>
```

---

## ✅ DO's & DON'Ts

### ✅ DO Use Variables
```css
/* GOOD */
background: var(--color-primary);
padding: var(--space-lg);
color: var(--color-text-primary);
border-radius: var(--radius-md);
```

### ❌ DON'T Hardcode Values
```css
/* BAD */
background: #f59e0b;
padding: 16px;
color: #1e293b;
border-radius: 8px;
```

---

## 🚀 QUICK START

### New Page Template
```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Page Title</title>
    <link rel="stylesheet" href="../../assets/css/design-system.css">
    <style>
        /* Page-specific styles only */
    </style>
</head>
<body>
    <!-- Your content -->
</body>
</html>
```

### New Component
```html
<button class="btn-primary">Click Me</button>

<div class="card">
    <h3>Title</h3>
    <p class="text-secondary">Description</p>
</div>

<input type="text" placeholder="Enter text">
```

---

## 🎨 COLOR PALETTE AT A GLANCE

| Color | Hex | CSS Variable | Use Case |
|-------|-----|-----|----------|
| **Gold** | #f59e0b | `--color-primary` | CTAs, highlights |
| **Dark Gold** | #d97706 | `--color-primary-hover` | Hover state |
| **Indigo** | #6366f1 | `--color-secondary` | Links |
| **Dark Text** | #1e293b | `--color-text-primary` | Main text |
| **Gray Text** | #64748b | `--color-text-secondary` | Secondary |
| **Light Gray** | #94a3b8 | `--color-text-tertiary` | Hints |
| **Off White** | #f8fafc | `--color-bg-main` | Page bg |
| **White** | #ffffff | `--color-bg-card` | Card bg |
| **Border Gray** | #e2e8f0 | `--color-border` | Borders |
| **Green** | #22c55e | `--color-success` | Success |
| **Red** | #ef4444 | `--color-error` | Errors |
| **Orange** | #f97316 | `--color-warning` | Warnings |

---

## 🔗 QUICK LINKS

- **Full System:** `/assets/css/design-system.css`
- **Quick Start:** `DESIGN_SYSTEM.md`
- **Visual Guide:** `DESIGN_VISUAL_REFERENCE.md`
- **Full Report:** `DESIGN_AUDIT_REPORT.md`
- **Summary:** `IMPLEMENTATION_SUMMARY.md`

---

## 💬 NEED HELP?

### Color not appearing?
Use `var(--color-primary)` not `#f59e0b`

### Spacing looks off?
Use scale: `var(--space-lg)` not random values

### Mobile looks broken?
Test at 768px width and use responsive utilities

### Button not styled?
Use `class="btn-primary"` or style with variables

---

## 📋 COPY-PASTE SNIPPETS

### Status Messages
```html
✅ Success: <div class="bg-success rounded-md" style="padding: var(--space-md);">Success message</div>
❌ Error: <div class="bg-error rounded-md" style="padding: var(--space-md);">Error message</div>
⚠️ Warning: <div class="bg-warning rounded-md" style="padding: var(--space-md);">Warning message</div>
ℹ️ Info: <div class="bg-info rounded-md" style="padding: var(--space-md);">Info message</div>
```

### Button Styles
```html
<button class="btn-primary">Primary Button</button>
<button class="btn-secondary">Secondary Button</button>
<button class="btn-ghost">Ghost Button</button>
```

### Flexbox Layout
```html
<div class="flex gap-lg">
    <div style="flex: 1;">Column 1</div>
    <div style="flex: 1;">Column 2</div>
</div>
```

---

**Bookmark this for quick reference!**  
**Last Updated:** May 13, 2026

---

## 📞 SUPPORT

Having issues? Check:
1. Are you using `var(--color-primary)` or hardcoded `#f59e0b`?
2. Is the design-system.css linked in your `<head>`?
3. Are you using the spacing scale (`--space-lg`, etc.)?
4. Have you tested on mobile (< 768px)?

**Everything still not working?** → Refer to `DESIGN_AUDIT_REPORT.md` for detailed troubleshooting
