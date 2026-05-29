---
name: Digital Memory Book System
colors:
  surface: '#fdf8f7'
  surface-dim: '#ddd9d8'
  surface-bright: '#fdf8f7'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f7f3f1'
  surface-container: '#f1edeb'
  surface-container-high: '#ebe7e6'
  surface-container-highest: '#e5e2e0'
  on-surface: '#1c1b1b'
  on-surface-variant: '#474740'
  inverse-surface: '#31302f'
  inverse-on-surface: '#f4f0ee'
  outline: '#78776f'
  outline-variant: '#c9c6bd'
  surface-tint: '#5f5f58'
  primary: '#5f5f58'
  on-primary: '#ffffff'
  primary-container: '#f5f2e9'
  on-primary-container: '#6f6e67'
  inverse-primary: '#c9c6be'
  secondary: '#49607e'
  on-secondary: '#ffffff'
  secondary-container: '#c1d9fd'
  on-secondary-container: '#485f7d'
  tertiary: '#5e5e62'
  on-tertiary: '#ffffff'
  tertiary-container: '#f3f1f5'
  on-tertiary-container: '#6d6d71'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e5e2da'
  primary-fixed-dim: '#c9c6be'
  on-primary-fixed: '#1c1c17'
  on-primary-fixed-variant: '#474741'
  secondary-fixed: '#d3e4ff'
  secondary-fixed-dim: '#b1c8eb'
  on-secondary-fixed: '#011c38'
  on-secondary-fixed-variant: '#314865'
  tertiary-fixed: '#e3e2e6'
  tertiary-fixed-dim: '#c7c6ca'
  on-tertiary-fixed: '#1a1b1e'
  on-tertiary-fixed-variant: '#46474a'
  background: '#fdf8f7'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e0'
typography:
  display-lg:
    fontFamily: Literata
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Literata
    fontSize: 36px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Literata
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-sm:
    fontFamily: Literata
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-caps:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: 0.1em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  container-max: 1120px
  gutter: 24px
---

## Brand & Style

This design system is built to evoke the bittersweet nostalgia of adolescence while maintaining the crisp functionality of a modern digital archive. The brand personality is reflective, warm, and archival—designed to feel less like a database and more like a curated collection of personal artifacts.

The aesthetic blends **Minimalism** with **Tactile/Skeuomorphic** accents. While the interface remains clean and structured, specific elements—like photo containers—utilize physical metaphors (Polaroid-style frames) to trigger emotional resonance. It is a sophisticated take on the "school scrapbook," replacing cluttered stickers with intentional whitespace and elegant transitions.

## Colors

The palette is centered around three distinct environmental states that users can toggle to change the mood of their memory book:

1.  **Memory Cream (#F5F2E9):** The default state. It mimics high-quality, aged paper. Use this for a warm, literary, and daytime storytelling feel.
2.  **Classic Blue (#2A415E):** Inspired by traditional school uniforms and varsity blazers. This mode provides a more formal, institutional, yet trustworthy atmosphere.
3.  **Dark Slate (#1A1B1E):** A deep, midnight grey for "After Hours" or "Yearbook Signatures" vibes. This mode emphasizes focus and makes photography pop.

Text colors should dynamically adjust: Use a deep charcoal (#2D2D2D) over Cream, and pure white (#FFFFFF) or light silver (#E0E0E0) over Blue and Slate.

## Typography

The typography strategy relies on the contrast between a "storyteller" serif and a "functional" sans-serif.

*   **Literata** (Serif): Used for all headlines and display text. Its warm, bookish character reinforces the feeling of reading a personal journal or a published yearbook.
*   **Hanken Grotesk** (Sans-Serif): Used for body copy, descriptions, and UI labels. It provides a contemporary, sharp counterpoint to the serif, ensuring the platform feels like a modern tool rather than a vintage relic.

Maintain generous line-height for body text to ensure high readability during long-form storytelling. Use `label-caps` for metadata like dates, locations, or school names to create a "catalogued" look.

## Layout & Spacing

The layout follows a **Fixed Grid** model on desktop to mimic the physical constraints of a book page, centering the content with wide margins to create focus. 

*   **Grid:** A 12-column system with a 24px gutter.
*   **Max Width:** The main content container is capped at 1120px to prevent line lengths from becoming unreadable.
*   **Mobile Adaption:** On mobile, margins reduce to 16px, and the layout collapses to a single-column stack. Photos should maintain a slightly larger margin than text to emphasize their "inserted" appearance.
*   **Rhythm:** Use the 8px base unit for all component-level spacing. Use larger `xl` (80px) vertical padding between chronological sections to represent "chapters."

## Elevation & Depth

This design system uses **Ambient Shadows** and **Tonal Layers** to create a sense of physical objects resting on a surface.

*   **The Page:** The main background (the chosen theme color) acts as the desk surface.
*   **The Cards:** Memory cards use a very subtle, low-opacity shadow (4% - 8% alpha) with a large blur radius to feel like thick cardstock rather than digital plastic.
*   **The Polaroid:** Images are elevated one level higher than the cards. They feature a crisp 1px "inner stroke" to simulate the edge of photographic paper and a slightly more pronounced shadow than the base card.
*   **Interactive State:** Upon hover, elements should lift slightly (translate -4px Y-axis) and the shadow should expand and soften, mimicking the action of a hand moving to pick up a photo.

## Shapes

The shape language is consistently **Rounded (Level 2)**. 

*   **Standard UI (Buttons, Inputs):** 0.5rem (8px) corner radius. This feels approachable without becoming overly "bubbly" or childish.
*   **Containers & Cards:** 1rem (16px) corner radius for larger sections to soften the overall grid.
*   **Polaroids:** While the outer frame has an 8px radius, the internal image container should have a smaller 2px radius to mimic how photos were traditionally mounted.

## Components

### Polaroid Frames
Photos are never displayed raw. They are always encased in a "Polaroid" component: a white frame with a thicker bottom margin for "captions." On hover, these should rotate slightly (1-2 degrees) to mimic a scattered pile of memories.

### Memory Cards
The primary container for posts. These should have a subtle background tint slightly lighter or darker than the main theme color to create a "layered paper" effect.

### Buttons
*   **Primary:** Solid color (Classic Blue in Cream mode) with white text.
*   **Secondary:** Outlined with a 1px stroke. 
*   **Navigation:** Use serif typography for menu items to keep the storytelling vibe consistent.

### Input Fields
Inputs should feel like "blanks" in a form. Use a simple bottom border or a very light solid fill. Avoid heavy borders; keep the look "pen-on-paper."

### Chips/Tags
Small, pill-shaped markers for "Class of XXXX" or "Field Trip." Use low-saturation background colors to avoid distracting from the photography.

### Smooth Hover Transitions
All interactive elements must transition over 300ms using a `cubic-bezier(0.4, 0, 0.2, 1)` curve. This "slow-motion" feel adds to the dreamlike, nostalgic quality of the interface.