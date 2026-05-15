# TheWay Design System - Implementation Guide

## 📋 Overview

This document outlines the centralized design system for TheWay. All pages must use `design-system.css` to ensure consistent UI/UX across the application.

## 🎯 Key Principles

1. **Single Source of Truth** - All design tokens defined in `design-system.css`
2. **Consistency** - No inline styles or page-specific CSS variables
3. **Scalability** - Easy to maintain and update globally
4. **Accessibility** - WCAG compliant with proper contrast ratios
5. **Responsiveness** - Mobile-first approach with breakpoints

## 📦 CSS Variables Available

### Colors
```css
/* Primary Colors */
--color-primary: #f59e0b              /* Gold/Amber */
--color-primary-hover: #d97706        /* Darker Gold */
--color-secondary: #6366f1            /* Indigo */

/* Sidebar */
--color-sidebar-bg: #0a1628
--color-sidebar-hover: #132038
--color-sidebar-active: #1a2d4a

/* Text */
--color-text-primary: #1e293b
--color-text-secondary: #64748b
--color-text-tertiary: #94a3b8

/* Status */
--color-success: #22c55e
--color-warning: #f97316
--color-error: #ef4444
--color-info: #3b82f6
```

### Typography
```css
--font-family: 'Inter', system fonts
--font-size-xs: 12px
--font-size-sm: 13px
--font-size-base: 14px
--font-size-md: 16px
--font-size-lg: 18px
--font-size-xl: 20px
--font-size-2xl: 24px
--font-size-3xl: 32px
--font-size-4xl: 36px

--font-weight-light: 300
--font-weight-normal: 400
--font-weight-medium: 500
--font-weight-semibold: 600
--font-weight-bold: 700
--font-weight-extrabold: 800
```

### Spacing Scale
```css
--space-xs: 4px
--space-sm: 8px
--space-md: 12px
--space-lg: 16px
--space-xl: 20px
--space-2xl: 24px
--space-3xl: 32px
--space-4xl: 40px
--space-5xl: 48px
```

### Borders & Shadows
```css
--radius-sm: 6px
--radius-md: 8px
--radius-lg: 12px
--radius-xl: 16px

--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1)
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07)
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1)
```

### Transitions
```css
--transition-fast: 0.15s ease
--transition-base: 0.2s ease
--transition-slow: 0.3s ease
```

## 📱 Responsive Breakpoints

```css
Desktop:  >= 1024px
Tablet:   <= 1023px and >= 768px
Mobile:   < 768px
```

## ✅ Implementation Checklist

For each HTML file:

- [ ] Add `<link rel="stylesheet" href="../../assets/css/design-system.css">` in `<head>`
- [ ] Remove all `:root {}` variable definitions from `<style>` tags
- [ ] Replace custom CSS variables with design system variables
- [ ] Remove duplicate CSS rules (buttons, forms, cards already styled)
- [ ] Update inline styles to use spacing utilities
- [ ] Verify all pages render correctly
- [ ] Test responsive behavior on mobile/tablet

## 🚀 Quick Start

### Step 1: Link Design System
```html
<head>
    <link rel="stylesheet" href="../../assets/css/design-system.css">
    <style>
        /* Page-specific styles only */
    </style>
</head>
```

### Step 2: Use CSS Variables
```css
.sidebar {
    width: var(--sidebar-width);
    background-color: var(--color-sidebar-bg);
    padding: var(--space-lg);
    border-radius: var(--radius-lg);
}

.btn-primary {
    background-color: var(--color-primary);
    padding: var(--space-md) var(--space-lg);
    border-radius: var(--radius-md);
    transition: background var(--transition-base);
}
```

### Step 3: Utility Classes
```html
<!-- Flexbox -->
<div class="flex gap-md">
    <span>Item 1</span>
    <span>Item 2</span>
</div>

<!-- Colors -->
<p class="text-secondary">Secondary text</p>

<!-- Spacing -->
<div class="gap-xl">Content</div>

<!-- Shadows -->
<div class="card shadow-lg">Card</div>
```

## 🎨 Component Examples

### Button
```html
<button class="btn-primary">Click Me</button>
<button class="btn-secondary">Secondary</button>
<button class="btn-ghost">Ghost</button>
```

### Card
```html
<div class="card">
    <h3>Card Title</h3>
    <p class="text-secondary">Card content goes here</p>
</div>
```

### Form Group
```html
<div class="flex-col gap-md">
    <label for="email">Email</label>
    <input type="email" id="email" placeholder="Enter email">
</div>
```

### Status Badge
```html
<div class="bg-success rounded-md">✓ Success</div>
<div class="bg-warning rounded-md">⚠ Warning</div>
<div class="bg-error rounded-md">✗ Error</div>
```

## 🔧 Updating the Design System

To update a color, spacing, or font globally:

1. Edit `/assets/css/design-system.css`
2. Update the CSS variable in `:root {}`
3. All pages automatically reflect the change

**Example:**
```css
/* Change primary color from gold to blue */
--color-primary: #3b82f6;  /* was #f59e0b */
```

## 📋 Files Using Design System

- ✅ `/assets/css/design-system.css` (source)
- 🔄 `/view/public/index.html` (to be updated)
- 🔄 `/view/pannel/dashboard.html` (to be updated)
- 🔄 `/view/pannel/admin/utilisateurs.html` (to be updated)
- 🔄 `/view/pannel/admin/dashboard.html` (to be updated)
- 🔄 `/view/authentification/login.html` (to be updated)

## 🚨 Common Mistakes to Avoid

❌ **DON'T** - Define new CSS variables in page stylesheets
✅ **DO** - Use existing design system variables

❌ **DON'T** - Hardcode colors like `#f59e0b`
✅ **DO** - Use `var(--color-primary)`

❌ **DON'T** - Create page-specific button styles
✅ **DO** - Use `.btn-primary`, `.btn-secondary` classes

❌ **DON'T** - Use inconsistent spacing values
✅ **DO** - Use `var(--space-md)`, `var(--space-lg)` etc.

❌ **DON'T** - Skip responsive design
✅ **DO** - Test on mobile, tablet, and desktop

## 📞 Support

For design system issues or improvements:
1. Check this guide
2. Review `design-system.css`
3. Test changes in browser DevTools first
4. Update design-system.css and verify all pages

---
**Last Updated:** May 2026  
**Version:** 1.0  
**Status:** Active
