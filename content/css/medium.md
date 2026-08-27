# CSS - Medium Interview Questions

### Q1: Explain the CSS Multi-Column Layout model.
- **Purpose**: Flows standard text content across multiple vertical columns seamlessly, mimicking newspaper layouts.
- **Properties**:
  - `column-count`: Explicit number of columns to generate.
  - `column-width`: Ideal/target width of each column.
  - `column-gap`: Sets the gutter spacing between columns.
  - `column-rule`: Creates a vertical divider border between columns.

### Q2: What are the CSS mathematical functions `min()`, `max()`, and `clamp()`?
- **`min(val1, val2)`**: Selects the smallest value. Useful for setting fluid elements that shouldn't overflow screen widths (e.g., `width: min(100%, 800px)`).
- **`max(val1, val2)`**: Selects the largest value. Ensures elements don't shrink past a set minimum.
- **`clamp(min, preferred, max)`**: Locks a value between a hard minimum and maximum limit, scaling smoothly with the middle percentage value (e.g., `font-size: clamp(1rem, 2.5vw, 3rem)`).

### Q3: Contrast alignment properties in Flexbox and CSS Grid.
- **`justify-content`**: Aligns flex items/grid columns along the main axis (horizontally).
- **`align-items`**: Aligns flex items/grid tracks along the cross axis (vertically) in a single row.
- **`align-content`**: Aligns multiple rows of flex containers/grid rows along the cross axis when there is extra space.
- **`justify-items`**: *Grid only*. Aligns cell contents horizontally within their individual grid cell area.

### Q4: What is a Block Formatting Context (BFC), and how is it created?
- **Definition**: An isolated layout region of a webpage where block boxes are laid out. Margin collapsing only occurs within the same BFC.
- **BFC prevents**: Collapsing margins with parent elements and floating elements from overflowing their containers.
- **Creation methods**:
  - Setting `overflow: hidden`, `auto`, or `scroll` (other than `visible`).
  - Setting `display: flow-root` (the modern explicit way to create BFC).
  - Floating elements (`float: left/right`).
  - Position values `absolute` or `fixed`.
  - Flex or Grid items.

### Q5: How does the `calc()` function work in CSS?
- **Function**: Performs mathematical calculations directly in CSS property values.
- **Rules**:
  - Supports mixed units (e.g., `width: calc(100% - 40px)`).
  - **Operator Spacing**: Plus (`+`) and minus (`-`) operators *must* be surrounded by white spaces (e.g., `calc(100%-40px)` is invalid) so the parser doesn't mistake them for negative signs. Multiplication (`*`) and division (`/`) do not require spaces.

### Q6: Explain CSS Custom Property fallback syntax.
- **Mechanism**: The `var()` function accepts a second optional parameter representing a fallback value in case the variable is not defined:
  ```css
  button { background-color: var(--brand-blue, #0056b3); }
  ```
- **Nesting**: Fallbacks can be chained (e.g., `var(--primary, var(--secondary, #333))`).

### Q7: Differentiate between `object-fit` and `background-size`.
- **`object-fit`**: Used on native replaced elements like `<img>` or `<video>` to control how their media content scales to fit the element's actual layout box (`cover`, `contain`, `fill`).
- **`background-size`**: Controls the scaling of background image assets defined inside CSS background styles, applied to standard container divs.

### Q8: Explain the roles of `grid-template-areas` and `grid-area` in CSS Grid.
- **`grid-template-areas`**: Provides a visual layout map of grid tracks using literal string names for cells:
  ```css
  grid-template-areas: 
    "header header"
    "sidebar main";
  ```
- **`grid-area`**: Placed on child selectors to bind that element to a named grid area map segment (e.g., `grid-area: header`).

### Q9: Differentiate between `:nth-child` and `:nth-of-type`.
- **`:nth-child(n)`**: Examines *all* sibling elements in order and selects the item at position `n` *only* if it matches the prepended element selector.
- **`:nth-of-type(n)`**: Filters the sibling list to include *only* elements of the matching tag type, then selects the `n`-th element within that targeted subset.
- **Example**: In a container with `<h1>` followed by three `<p>`, `p:nth-child(1)` matches nothing (since child 1 is an `h1`), whereas `p:nth-of-type(1)` matches the first `<p>`.

### Q10: What is CSS containment (`contain` property)?
- **Purpose**: Instructs the browser parser that an element's subtree is completely isolated from the rest of the page layout.
- **Benefit**: Optimizes performance. The browser can bypass recalculating layout or repainting the entire document when the element's inner DOM changes.
- **Values**: `layout`, `paint`, `size`, `content`, `strict`.

### Q11: Differentiate between `:focus` and `:focus-visible`.
- **`:focus`**: Matches whenever an element gains focus, regardless of input device (mouse click, screen tap, or keyboard tab). Often displays annoying focus rings on mouse-clicked buttons.
- **`:focus-visible`**: Matches *only* when focus is gained via keyboard navigation or when a visual indicator is genuinely helpful, keeping mouse clicks clean while preserving accessibility.

### Q12: Explain the purpose of the `:focus-within` pseudo-class.
- **Function**: Matches a parent element if that element *or any of its nested children* has active focus.
- **Use Case**: Styling a whole card container or input form field borders when a user begins typing inside a nested input box.

### Q13: What is the CSS `aspect-ratio` property, and how does it prevent CLS?
- **Aspect Ratio**: Sets a target proportion for an element box (e.g., `aspect-ratio: 16 / 9`).
- **CLS Prevention**: Reserves a precise layout placeholder container before images or iframe videos download, preventing content below from shifting abruptly when the media displays.

### Q14: Explain the CSS Grid auto-placement algorithm (`grid-auto-flow: dense`).
- **`grid-auto-flow: row/column`**: Placed elements are stacked sequentially, leaving empty layout holes in rows if subsequent elements are too large to fit in remaining spaces.
- **`dense`**: Instructs the grid algorithm to attempt to fill existing gaps in the grid layout by moving smaller subsequent items backward out of order, optimizing visual space.

### Q15: How does the `cubic-bezier()` timing function work?
- **Concept**: Defines custom transition easing rates using mathematical Bézier curves.
- **Parameters**: `cubic-bezier(x1, y1, x2, y2)` controls the coordinates of two control points shaping a speed curve.
- **Value**: Allows custom speed bounces or deceleration models that standard easing presets (`linear`, `ease-in`) cannot deliver.

### Q16: How do you implement a CSS-only custom tooltip using the `attr()` function?
- **Steps**:
  1. Add a custom attribute to an HTML tag: `<button data-tooltip="Submit Form">Save</button>`.
  2. In CSS, target `:hover::after`.
  3. Use the `content` property paired with the attribute extractor: `content: attr(data-tooltip);`. Style with absolute positioning and backgrounds.

### Q17: Compare `transform: translate()` and absolute offsets (`top`/`left`) for performance.
- **`top` / `left`**: Modifies geometry layout coordinates. Triggers a full browser **reflow** and **repaint**, consuming massive CPU cycles and causing scroll stutter.
- **`transform`**: Handled purely on the GPU compositing layer. Does not trigger layout shifts or repaints, rendering highly fluid animations (60fps).

### Q18: What is the `will-change` property, and when should it be used?
- **Purpose**: Hints to the browser which property is expected to animate in the future, allowing the browser to optimize rendering pipelines in advance.
- **Caution**: Overuse can degrade performance, as the browser reserves system memory for those optimization layers. Use only on elements experiencing rendering lag and remove it after transitions complete.

### Q19: Contrast CSS Transitions vs CSS Keyframe Animations.
- **Transitions**:
  - Requires triggering (e.g., hover, active, or JS class toggles).
  - Interpolates styles simply between a start state and an end state.
- **Keyframe Animations**:
  - Run automatically on page render if configured.
  - Can loop infinitely (`animation-iteration-count`).
  - Supports highly complex, multi-stage sequences using percentage keyframes.

### Q20: Explain CSS `animation-fill-mode` values.
- **`none` (Default)**: Animation styles do not affect the element before or after the animation executes.
- **`forwards`**: The element retains the style rules defined in the final keyframe (`100%`) after the animation completes.
- **`backwards`**: The element immediately applies styles defined in the first keyframe (`0%`) during the animation delay wait period.
- **`both`**: Applies both rules (applies `0%` during delay, retains `100%` on completion).

### Q21: What is a Stacking Context, and how is it created?
- **Definition**: A three-dimensional conceptual grouping of elements along the Z-axis. Specificity of `z-index` is scoped to its containing stacking context.
- **Triggers**:
  - The root element (`html`).
  - Element with `position: relative/absolute` and an explicit `z-index` other than `auto`.
  - Element with `position: fixed/sticky`.
  - Elements with `opacity` less than `1`.
  - Elements with `transform`, `filter`, or `perspective` properties applied.

### Q22: What are CSS logical properties, and why are they useful?
- **Concept**: Physical properties (like `margin-left`, `padding-top`) are mapped to screen geometry. Logical properties map to content flows (`margin-inline-start`, `padding-block-end`).
- **Value**: Automatic layout adjustment when web pages are localized to right-to-left (RTL) reading languages like Arabic or vertical scripts, eliminating layout overrides.

### Q23: Compare the `:empty` and `:blank` pseudo-classes.
- **`:empty`**: Matches an element *only* if it contains absolutely zero children, text characters, or even blank spaces.
- **`:blank`**: Matches an element if it is physically empty or contains purely empty whitespace/breaks, rendering it much more forgiving in editor templates.

### Q24: Explain CSS `@supports` feature queries.
- **Purpose**: Checks browser support for specific CSS property-value pairs before applying styled overrides, allowing progressive enhancement.
- **Usage**:
  ```css
  @supports (display: grid) {
    .container { display: grid; }
  }
  ```

### Q25: Explain the `:not()` pseudo-class and its specificity rule.
- **Purpose**: A functional negation selector that targets elements that do not match the inner selector (e.g., `li:not(.active)`).
- **Specificity**: `:not()` itself carries zero weight. However, the specificity weight of the selector passed inside its parentheses is added to the overall selector calculation.

### Q26: What is `font-display: swap`?
- **Purpose**: Solves performance issues with external web fonts loading slowly.
- **Mechanism**: Instructs the browser to render fallback system fonts immediately on page load, and then "swap" to the custom web font the moment it finishes downloading. This prevents blank page displays (Flash of Invisible Text - FOIT).

### Q27: Compare `mix-blend-mode` vs `background-blend-mode`.
- **`mix-blend-mode`**: Controls how an element's entire content blends and merges colors with the HTML elements located beneath it.
- **`background-blend-mode`**: Blends a container's multiple background images, or blends background images with the container's solid `background-color`.

### Q28: Compare `filter: drop-shadow()` vs `box-shadow`.
- **`box-shadow`**: Creates a rectangular shadow matching the element's exact box model outline, ignoring transparent gaps.
- **`filter: drop-shadow()`**: Creates a shadow that traces the actual visible graphical shape outline of the element, including transparent PNG images, SVGs, or clipped masks.

### Q29: What does `@media (prefers-color-scheme)` do?
- **Purpose**: Detects whether the user's system preferences or OS settings are configured to use a dark theme or light theme, enabling automated style themes.
- **Options**: `light`, `dark`.

### Q30: What is CSS `scroll-behavior: smooth`, and what are its constraints?
- **Purpose**: Smoothly animates scrolling when users click anchor links linking to elements on the same page.
- **Constraints**: Ignored when scrolling is triggered programmatically via standard script offsets unless written specifically.

### Q31: How does flexbox wrapping (`flex-wrap: wrap`) affect heights?
- **Mechanism**: Forces overflowing items onto new rows. By default, items on a row align their heights to match the tallest sibling on that specific row, not across all rows.

### Q32: What is the purpose of `backdrop-filter`, and how does it differ from `filter`?
- **`filter`**: Applies visual effects (like blur, contrast, grayscale) to the element itself and all its nested children.
- **`backdrop-filter`**: Applies visual effects to the graphical area *behind* the element. Often used for frosted-glass styles, requiring semi-transparent backgrounds to be visible.

### Q33: How does the browser handle font fallback mechanisms via `font-family`?
- **Mechanism**: Parsed left-to-right. The browser scans the comma-separated list, checks local system storage or active `@font-face` links, and loads the first matched font. A generic font family (e.g., `sans-serif`) must always be specified last.

### Q34: What is the `resize` CSS property?
- **Function**: Allows users to dynamically resize a container block manually.
- **Values**: `horizontal`, `vertical`, `both`, `none`.
- **Requirement**: Only works on elements that have an explicit `overflow` property set to something other than `visible` (like `auto` or `hidden`).

### Q35: Compare `:first-of-type` vs `:first-child`.
- **`:first-child`**: Selects an element only if it is the absolute first sibling child of its parent.
- **`:first-of-type`**: Selects the first element of its tag type among its siblings, regardless of its chronological index position.

### Q36: Explain the shorthand `grid-template: repeat(2, 1fr) / repeat(3, 1fr)`.
- **Syntax**: Merges row and column layouts: `grid-template: [row templates] / [column templates]`.
- **Result**: Generates a grid container layout containing exactly 2 rows of equal height fraction (`1fr`) and 3 columns of equal width fraction (`1fr`).

### Q37: What is the CSS `currentColor` keyword?
- **Definition**: A dynamic keyword representing the active value of the element's `color` property.
- **Benefit**: Simplifies style inheritance. If you want SVG borders or icons to match text colors, apply `border: 1px solid currentColor` or `fill: currentColor`.

### Q38: Contrast `mask` vs `clip-path` in CSS.
- **`clip-path`**: A vector-based path clipping tool. It cuts away portions of an element along coordinates or shapes (`circle()`, `polygon()`). Area outside the path is transparent and clicks pass through.
- **`mask`**: Alpha-channel raster masking. It uses transparent-to-opaque images or gradients to blend parts of elements, controlling pixel transparency levels.

### Q39: What is the `@media (prefers-reduced-motion)` query?
- **Purpose**: Detects if the user has enabled OS setting preferences to minimize decorative motion and animations (often due to vestibular disorders or motion sickness).
- **Use**: Best practice is to disable scaling transforms and fast scrolls when matched.

### Q40: How does the browser parse selector matching?
- **Parsing Direction**: Parsed from **right to left** (key selector to ancestor).
- **Reason**: Performance efficiency. If searching `.container ul li`, the browser instantly finds all `<li>` elements, then checks which ones are nested inside `<ul>`, and finally checks if those reside inside `.container`. This minimizes node evaluations.

### Q41: Explain the parent selector `:has()`.
- **Role**: Allows styling parent elements or preceding siblings based on what child elements reside inside them.
- **Example**: `card:has(img) { padding: 0; }` applies style to the card container *only* if it contains an image tag inside.

### Q42: What is the difference between `min-height: 100vh` and `height: 100vh`?
- **`height: 100vh`**: Hard-locks the container's height to the viewport height. Content overflowing this viewport size will break out of the box and overlap siblings.
- **`min-height: 100vh`**: Ensures the container is at least viewport height, but allows the box to expand vertically if long content or text requires more space.

### Q43: What is the role of `:root` in managing stylesheets?
- **Usage**: Since `:root` matches the `<html>` element but has higher specificity, it is the industry-standard location for defining global CSS custom variables, theme mappings, and reset baseline variables.

---

### Q44: [Coding Challenge] Glassmorphism Component Layout
- **Objective**: Create a modern translucent card overlay utilizing backdrop blurring.
- **Implementation**:
```css
.glass-card {
  width: 320px;
  padding: 24px;
  border-radius: 12px;
  background-color: rgba(255, 255, 255, 0.15); /* Semi-transparent base */
  border: 1px solid rgba(255, 255, 255, 0.25);  /* Shiny translucent border */
  
  /* Backdrop styling */
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);         /* Safari Support */
  
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.2);
  color: #ffffff;
}
```

### Q45: [Coding Challenge] Fluid Sized Responsive Typography
- **Objective**: Implement a single typography rule that scales text from 16px to 32px depending on viewport width.
- **Implementation**:
```css
.responsive-title {
  /* clamp(minimum, preferred-relative, maximum) */
  /* Preferred is 1rem (16px) + 2% of viewport width */
  font-size: clamp(1rem, 1rem + 2vw, 2rem);
  line-height: 1.3;
}
```

### Q46: [Coding Challenge] Custom-Styled Interactive Checkbox
- **Objective**: Code customized checkbox indicators without losing semantic form submissions.
- **Implementation**:
```html
<label class="custom-checkbox">
  <input type="checkbox" class="hidden-input">
  <span class="custom-indicator"></span>
  Accept Terms
</label>

<style>
  .custom-checkbox { display: inline-flex; align-items: center; cursor: pointer; gap: 8px; }
  
  /* Hide native input completely */
  .hidden-input { position: absolute; opacity: 0; width: 0; height: 0; }
  
  /* Visual styling of indicator */
  .custom-indicator {
    width: 20px; height: 20px;
    border: 2px solid #ccc;
    border-radius: 4px;
    transition: all 0.2s ease;
  }
  
  /* Check state style changes */
  .hidden-input:checked + .custom-indicator {
    background-color: #007bff;
    border-color: #007bff;
  }
</style>
```

### Q47: [Coding Challenge] CSS-Only Custom Button Tooltip
- **Objective**: Build tooltips triggered on hover using pseudo-elements and the `attr()` function.
- **Implementation**:
```css
.tooltip-btn {
  position: relative;
  padding: 10px 20px;
  cursor: pointer;
}

.tooltip-btn::after {
  content: attr(data-tooltip); /* Pull tool-tip string dynamically */
  position: absolute;
  bottom: 125%; left: 50%;
  transform: translateX(-50%) scale(0.8);
  background-color: #333333;
  color: #ffffff;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: all 0.2s ease-in-out;
}

/* Hover state overrides */
.tooltip-btn:hover::after {
  opacity: 1;
  transform: translateX(-50%) scale(1);
}
```

### Q48: [Coding Challenge] Auto-Fitting Grid Skeletons
- **Objective**: Implement CSS Grid columns that dynamically adjust their counts based on parent width.
- **Implementation**:
```css
.auto-grid {
  display: grid;
  /* repeat(auto-fit, minmax(min-allowed, max-allowed)) */
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  padding: 20px;
}

.grid-item {
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  padding: 16px;
  border-radius: 6px;
}
```

### Q49: [Coding Challenge] CSS Loading Progress Animation
- **Objective**: Create a growing visual progress bar that runs instantly on page rendering.
- **Implementation**:
```html
<div class="progress-container">
  <div class="progress-bar-fill"></div>
</div>

<style>
  .progress-container { width: 100%; height: 16px; background-color: #e0e0e0; border-radius: 8px; overflow: hidden; }
  
  .progress-bar-fill {
    height: 100%;
    background-color: #28a745;
    width: 0%;
    /* animation: name duration timing-function fill-mode */
    animation: fillProgress 2s ease-out forwards;
  }
  
  @keyframes fillProgress {
    0% { width: 0%; }
    100% { width: 100%; }
  }
</style>
```

### Q50: [Coding Challenge] Automated Light and Dark Theme Switching
- **Objective**: Implement dark mode styling support based on user device configuration preferences.
- **Implementation**:
```css
:root {
  /* Default light theme colors */
  --bg-color: #ffffff;
  --text-color: #1a1a1a;
  --card-bg: #f5f5f7;
}

/* Media query checking OS preferences */
@media (prefers-color-scheme: dark) {
  :root {
    --bg-color: #121212;
    --text-color: #f5f5f7;
    --card-bg: #1e1e1e;
  }
}

body {
  background-color: var(--bg-color);
  color: var(--text-color);
  font-family: sans-serif;
  transition: background-color 0.3s ease;
}

.theme-card {
  background-color: var(--card-bg);
  padding: 20px;
  border-radius: 8px;
}
```
