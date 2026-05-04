---
name: Industrial Pixel Logic
colors:
  surface: '#121318'
  surface-dim: '#121318'
  surface-bright: '#38393f'
  surface-container-lowest: '#0d0e13'
  surface-container-low: '#1a1b21'
  surface-container: '#1e1f25'
  surface-container-high: '#292a2f'
  surface-container-highest: '#34343a'
  on-surface: '#e3e1e9'
  on-surface-variant: '#b9cbbc'
  inverse-surface: '#e3e1e9'
  inverse-on-surface: '#2f3036'
  outline: '#849587'
  outline-variant: '#3a4a3f'
  surface-tint: '#00e38d'
  primary: '#f4fff4'
  on-primary: '#00391f'
  primary-container: '#00ff9f'
  on-primary-container: '#007144'
  inverse-primary: '#006d41'
  secondary: '#ffdb9d'
  on-secondary: '#412d00'
  secondary-container: '#feb700'
  on-secondary-container: '#6b4b00'
  tertiary: '#fffbff'
  on-tertiary: '#000da4'
  tertiary-container: '#dcddff'
  on-tertiary-container: '#3f4dec'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#55ffa9'
  primary-fixed-dim: '#00e38d'
  on-primary-fixed: '#002110'
  on-primary-fixed-variant: '#005230'
  secondary-fixed: '#ffdea8'
  secondary-fixed-dim: '#ffba20'
  on-secondary-fixed: '#271900'
  on-secondary-fixed-variant: '#5e4200'
  tertiary-fixed: '#e0e0ff'
  tertiary-fixed-dim: '#bec2ff'
  on-tertiary-fixed: '#000569'
  on-tertiary-fixed-variant: '#1927d1'
  background: '#121318'
  on-background: '#e3e1e9'
  surface-variant: '#34343a'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.02em
  header-md:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  data-mono:
    fontFamily: Fira Code
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 16px
  label-caps:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 12px
    letterSpacing: 0.1em
spacing:
  unit: 4px
  px-1: 4px
  px-2: 8px
  px-4: 16px
  px-8: 32px
  gutter: 16px
  margin: 24px
---

## Brand & Style
The design system embodies a high-fidelity, industrial pixel-art aesthetic tailored for technical DeFi automation. It merges the precision of modern FinTech with the evocative, layered visual language of classic high-end workstation interfaces. 

The style is characterized by a "Strict Pixel" approach: every line, border, and icon must align perfectly to a virtual pixel grid. We avoid the playfulness of traditional pixel art in favor of a "Technical Brutalism" that emphasizes reliability and performance. Visual depth is achieved through layered panels and hard-edged shadows rather than organic blurs, reflecting the immutable and structured nature of blockchain transactions.

## Colors
This design system utilizes a high-contrast dark palette designed for long-duration technical monitoring. 
- **Deep Space Blue (#0a0b10):** The foundational void. Used for the primary background.
- **System Mint (#00ff9f):** The "Active" state. Used for successful triggers, terminal prompts, and primary actions.
- **System Amber (#ffb800):** The "Warning" state. Reserved for gas spikes, pending transactions, and high-risk parameters.
- **Surface Elevation:** Subtle variations in blue-grays are used to differentiate nested pixel-blocks, often incorporating a 10% vertical gradient to simulate a backlit glass effect.

## Typography
Typography is split between functional readability and data precision. 
- **Inter** is the workhorse for navigation, headers, and instructional text, providing a modern, neutral contrast to the pixelated environment.
- **Fira Code** is mandatory for all dynamic data, including wallet addresses, transaction hashes, gas prices, and logic operators.
- **Alignment:** All text should be rendered with 'crisp' anti-aliasing to maintain the pixel-perfect theme. Monospaced elements must align to the pixel grid to ensure that columns of data are vertically synchronized.

## Layout & Spacing
The layout follows a strict 4px grid system, ensuring all elements are divisible by 4 to maintain pixel integrity. 
- **Fixed Grid Philosophy:** Workspaces use a modular panel system. Panels snap to a 12-column grid within the main viewport.
- **The "Logic Rail":** A dedicated vertical lane for automation triggers, maintaining a consistent width of 64px (16 units).
- **Guttering:** 16px gutters are mandatory between UI blocks to prevent the "pixel soup" effect and maintain an industrial, airy clarity.

## Elevation & Depth
Depth is created through "Mechanical Stacking" rather than lighting physics.
- **Borders:** Every container has a 1px solid border (#2d3142).
- **Drop Shadows:** 2px offsets (Right 2px, Down 2px) with 0 blur. The shadow color is consistently a darker shade of the background (#050508).
- **Inner Glow:** Active elements (System Mint) feature a 1px inner-inset shadow to simulate a recessed, glowing physical button.
- **Z-Indexing:** High-priority modals or tooltips use a secondary 1px border of System Mint to signify they are the "Active Layer."

## Shapes
In accordance with the pixel-art direction, the roundedness is set to 0. All corners are 90-degree angles. This reinforces the technical, grid-based nature of the DeFi stack. For buttons that require a "softer" feel, a "stepped" corner (removing a single 1x1 pixel from the absolute corner) is used to create a 45-degree chamfered look without using true curves.

## Components
- **Action Buttons:** Large rectangular blocks with a 2px hard shadow. The "hover" state involves the shadow moving to 0px and the button translating 2px down and right to simulate a physical "click."
- **Status Chips:** Small, monospaced labels with a solid background. Success = System Mint background with Black text; Warning = System Amber background with Black text.
- **Data Tables:** Zebra-striping is forbidden. Instead, use 1px horizontal lines between rows. All numeric data must be right-aligned in monospaced font.
- **The "Node" Connector:** In the automation builder, triggers and actions are connected by 2px wide orthogonal lines (elbow connectors) that only move at 90-degree angles, strictly following the pixel grid.
- **Input Fields:** Recessed appearance using a darker background than the surface and a 1px inset border on the top and left to simulate depth.