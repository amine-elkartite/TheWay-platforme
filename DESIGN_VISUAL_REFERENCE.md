# TheWay Design System - Visual Reference Guide

## 🎨 Color Palette

### Primary Colors
```
Accent/Primary
Color: #f59e0b (Gold/Amber)
Hover: #d97706
Dark: #b45309
Usage: CTAs, highlights, primary actions

Secondary
Color: #6366f1 (Indigo)
Usage: Links, alternative actions
```

### Neutral Colors
```
Text Primary: #1e293b (Dark Slate)
Text Secondary: #64748b (Slate)
Text Tertiary: #94a3b8 (Light Slate)
Text Light: #a0aec0 (Muted)

Background Main: #f8fafc (Off White)
Background Card: #ffffff (White)
Background Input: #f1f5f9 (Light Gray)

Border: #e2e8f0 (Light Gray)
Border Light: #f1f5f9 (Very Light)
```

### Status Colors
```
Success: #22c55e (Green) | Background: #f0fdf4
Warning: #f97316 (Orange) | Background: #fff7ed
Error: #ef4444 (Red) | Background: #fef2f2
Info: #3b82f6 (Blue) | Background: #eff6ff
```

### Sidebar Colors
```
Background: #0a1628 (Dark Navy)
Hover State: #132038 (Lighter Navy)
Active State: #1a2d4a (Even Lighter)
```

---

## 📝 Typography

### Font Family
**Inter** - Clean, modern, highly legible
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

### Font Sizes
```
Display (XL):   36px - Hero titles
Display (L):    32px - Main headings
Heading 1:      24px - Page titles (h2)
Heading 2:      20px - Section titles (h3)
Heading 3:      18px - Subsections (h4)
Body Large:     16px - Important text
Body:           14px - Default text
Small:          13px - Secondary info
XSmall:         12px - Captions, hints
```

### Font Weights
```
Light:          300 - Disabled states
Normal:         400 - Body text
Medium:         500 - Labels
Semibold:       600 - Buttons
Bold:           700 - Headings
Extrabold:      800 - Display text
```

### Line Heights
```
Tight:          1.25 (compact headings)
Normal:         1.5  (body text - default)
Relaxed:        1.75 (paragraphs, descriptions)
```

### Letter Spacing
```
Tight:          -0.5px (compressed)
Normal:         0      (default)
Wide:           0.5px  (expanded)
```

---

## 📐 Spacing System (8px Grid)

```
xs:   4px   (micro spacing, gaps)
sm:   8px   (small gaps, internal padding)
md:   12px  (default padding)
lg:   16px  (standard padding, gaps)
xl:   20px  (generous padding)
2xl:  24px  (large padding, card spacing)
3xl:  32px  (section spacing)
4xl:  40px  (large sections)
5xl:  48px  (hero sections)
```

### Common Spacing Patterns
```
Button Padding:       var(--space-md) var(--space-lg)     (12px 16px)
Card Padding:         var(--space-2xl)                    (24px)
Section Padding:      var(--space-3xl)                    (32px)
Input Padding:        var(--space-md) var(--space-lg)     (12px 16px)
Sidebar Padding:      var(--space-lg)                     (16px)
Header Padding:       var(--space-lg) var(--space-2xl)    (16px 24px)
```

---

## 🔲 Border Radius

```
Small (sm):         6px   (small badges, pills)
Medium (md):        8px   (buttons, inputs, tags)
Large (lg):         12px  (cards, modals, panels)
Extra Large (xl):   16px  (large containers)
2XL:                20px  (hero sections)
Full:               9999px (avatars, circles)
```

### Component Examples
```
Buttons:            --radius-md (8px)
Input fields:       --radius-md (8px)
Cards:              --radius-lg (12px)
Modals:             --radius-lg (12px)
Badges:             --radius-sm (6px)
Avatars:            --radius-full (circle)
```

---

## 🌑 Shadows

### Shadow System
```
Extra Small (xs):   0 1px 2px rgba(0, 0, 0, 0.05)
Small (sm):         0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)
Medium (md):        0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.05)
Large (lg):         0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)
Extra Large (xl):   0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04)
```

### Component Usage
```
Default cards:      --shadow-sm
Elevated cards:     --shadow-md
Floating elements:  --shadow-lg
Modals:             --shadow-lg
Dropdowns:          --shadow-md
Hover buttons:      --shadow-md
```

---

## ⚡ Transitions & Animations

### Duration
```
Fast:               0.15s
Base (default):     0.2s
Slow:               0.3s
```

### Easing
```
All transitions use: ease
Creating natural, smooth movements
```

### Predefined Animations
```
Fade In:            Smooth opacity transition
Slide Up:           Enter from bottom with fade
Slide Down:         Enter from top with fade
```

### Usage Examples
```css
/* Hover effect */
transition: background var(--transition-base);

/* Button press */
transition: transform var(--transition-fast);

/* Modal entrance */
animation: slideInUp var(--transition-base) ease-in-out;
```

---

## 🔘 Component Styles

### Buttons

#### Primary Button
```
Background:    var(--color-primary) #f59e0b
Color:         White
Padding:       var(--space-md) var(--space-lg)
Border Radius: var(--radius-md)
Hover:         Background: var(--color-primary-hover) #d97706
               Shadow: var(--shadow-md)
Transition:    all var(--transition-base)
```

#### Secondary Button
```
Background:    var(--color-bg-input) #f1f5f9
Color:         var(--color-text-primary) #1e293b
Border:        1px solid var(--color-border) #e2e8f0
Padding:       var(--space-md) var(--space-lg)
Border Radius: var(--radius-md)
Hover:         Background: var(--color-border-light) #f1f5f9
```

#### Ghost Button
```
Background:    Transparent
Color:         var(--color-text-primary)
Border:        1px solid var(--color-border)
Padding:       var(--space-md) var(--space-lg)
Border Radius: var(--radius-md)
Hover:         Background: var(--color-bg-input)
```

### Form Elements

#### Input Field
```
Border:        1px solid var(--color-border) #e2e8f0
Border Radius: var(--radius-md)
Padding:       var(--space-md) var(--space-lg)
Background:    var(--color-bg-card) #ffffff
Color:         var(--color-text-primary)
Focus:         Border: var(--color-primary)
               Box Shadow: 0 0 0 3px rgba(245, 158, 11, 0.1)
```

### Cards

#### Card Component
```
Background:    var(--color-bg-card) #ffffff
Border:        1px solid var(--color-border) #e2e8f0
Border Radius: var(--radius-lg)
Padding:       var(--space-2xl)
Shadow:        var(--shadow-sm)
Hover Shadow:  var(--shadow-md)
Transition:    all var(--transition-base)
```

---

## 📱 Responsive Breakpoints

### Desktop
```
Width >= 1024px
Full sidebar: 260px
Main content: Full width
All features visible
```

### Tablet (768px - 1023px)
```
Width: 768px - 1023px
Sidebar: 260px (adjustable)
Container padding: var(--space-xl)
Optimized touch targets
```

### Mobile (< 768px)
```
Width < 768px
Sidebar: Hidden or collapsed to 80px
Container padding: var(--space-lg)
Simplified navigation
Larger touch targets
Single column layouts
```

### Extra Small (< 480px)
```
Width < 480px
Minimal spacing
Optimized for small screens
Font sizes reduced
```

---

## 🎯 Layout Dimensions

### Sidebar
```
Full Width:     260px
Collapsed:      80px (on mobile)
Position:       Fixed, left: 0, top: 0
Height:         100vh
```

### Header/Top Bar
```
Height:         64px
Position:       Sticky (or fixed)
Z-index:        var(--z-fixed) = 30
Padding:        var(--space-lg) var(--space-2xl)
```

### Container
```
Max Width:      1400px
Padding:        var(--container-padding)
Desktop:        var(--space-2xl) = 24px
Tablet:         var(--space-xl) = 20px
Mobile:         var(--space-lg) = 16px
```

### Main Content
```
Margin Left:    260px (account for sidebar)
Min Height:     100vh
Flex:           1 (grows to fill space)
```

---

## ♿ Accessibility Features

### Focus States
```
All interactive elements have:
Outline: 2px solid var(--color-primary)
Outline Offset: 2px
```

### Contrast Ratios
```
Text on Background: 7:1 (AAA - Excellent)
Buttons:            4.5:1 (AA - Good)
Secondary Text:     4.5:1 (AA - Good)
```

### Visual Indicators
```
Disabled buttons:   opacity 0.6
Active states:      color or background change
Loading states:     visual feedback (spinner, pulse)
Error states:       red border + error message
```

### Keyboard Navigation
```
Tab Order:         Logical, left-to-right
Focus Visible:     Always visible outline
Skip Links:        Available for main content
Keyboard Shortcuts: Documented
```

---

## 🎨 Theme Color Reference

### Usage Guidelines

#### When to Use Primary Color (#f59e0b)
- ✓ Call-to-action buttons
- ✓ Important highlights
- ✓ Focus states
- ✓ Active navigation items
- ✓ Brand-related elements

#### When to Use Secondary Color (#6366f1)
- ✓ Alternative CTAs
- ✓ Links in content
- ✓ Information boxes
- ✓ Alternative actions

#### When to Use Status Colors
- ✓ Success: Confirmations, valid states
- ✓ Warning: Cautions, important info
- ✓ Error: Validation errors, failures
- ✓ Info: Notifications, helpful info

---

## 📋 Z-Index Hierarchy

```
Tooltip:            70  (highest - appears on top)
Toast/Notification: 60  (notifications)
Modal:              50  (modal content)
Modal Backdrop:     40  (semi-transparent overlay)
Fixed:              30  (fixed headers, sidebars)
Sticky:             20  (sticky headers)
Dropdown:           10  (dropdown menus)
Content:            1   (default)
Negative:          -1   (backgrounds)
```

---

## 🔄 Common Patterns

### Button with Hover Effect
```css
.btn-primary {
    background-color: var(--color-primary);
    transition: all var(--transition-base);
}

.btn-primary:hover {
    background-color: var(--color-primary-hover);
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
}
```

### Card with Hover Elevation
```css
.card {
    border: 1px solid var(--color-border);
    box-shadow: var(--shadow-sm);
    transition: all var(--transition-base);
}

.card:hover {
    box-shadow: var(--shadow-md);
    border-color: var(--color-primary);
}
```

### Responsive Container
```css
.container {
    width: 100%;
    max-width: var(--container-max-width);
    padding: 0 var(--container-padding);
    margin: 0 auto;
}
```

---

## 🎓 Implementation Checklist

- [ ] All colors use CSS variables
- [ ] All spacing uses 8px grid scale
- [ ] Border radius uses defined scale
- [ ] Shadows follow professional scale
- [ ] Transitions use base 0.2s duration
- [ ] Z-index follows hierarchy
- [ ] Mobile breakpoint implemented
- [ ] Focus states visible on all interactive elements
- [ ] Contrast ratios meet WCAG AA
- [ ] Font sizes follow typographic scale

---

## 📞 Quick Code Snippets

### Create a New Button
```html
<button class="btn-primary">Click Me</button>
```

### Create a Card
```html
<div class="card">
    <h3>Card Title</h3>
    <p class="text-secondary">Card description</p>
</div>
```

### Responsive Flexbox Container
```html
<div class="flex gap-lg">
    <div>Item 1</div>
    <div>Item 2</div>
</div>
```

### Status Badge
```html
<div class="bg-success rounded-md">✓ Success</div>
```

### Spaced Section
```html
<div style="padding: var(--space-3xl);">
    Section content
</div>
```

---

**Last Updated:** May 13, 2026  
**Version:** 1.0  
**Designer:** Senior Web Design AI
