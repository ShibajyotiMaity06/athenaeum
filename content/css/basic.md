# CSS - Basic Interview Questions

### Q1: What is CSS, and how do you link it to an HTML document?
- **CSS**: Cascading Style Sheets. Defines the presentation, design, and layout of an HTML document.
- **Linking Methods**:
  1. **External (Preferred)**: `<link rel="stylesheet" href="styles.css">` inside `<head>`.
  2. **Internal**: Inside a `<style>` block in `<head>`.
  3. **Inline**: Directly inside the HTML element using the `style` attribute (e.g., `<div style="color: red;">`).

### Q2: What are the different types of CSS selectors?
- **Element Selector**: Targets all matching HTML elements (e.g., `p { }`).
- **Class Selector**: Targets elements with a matching class name, prefixed with a dot (e.g., `.card { }`).
- **ID Selector**: Targets a single element with a matching ID, prefixed with a hash (e.g., `#header { }`).
- **Universal Selector**: Targets every element on the page (e.g., `* { }`).
- **Attribute Selector**: Targets elements based on attribute values (e.g., `[type="text"] { }`).

### Q3: Compare class, ID, and element selectors in terms of specificity.
- **ID Selector**: Highest specificity among the three. Represented as `0,1,0,0`.
- **Class Selector**: Moderate specificity. Includes classes, attributes, and pseudo-classes. Represented as `0,0,1,0`.
- **Element Selector**: Lowest specificity. Includes elements and pseudo-elements. Represented as `0,0,0,1`.
- **Result**: ID rules override class rules, and class rules override element rules.

### Q4: Explain the standard CSS Box Model.
- **Definition**: Every element is rendered as a rectangular box consisting of four concentric layers.
- **Layers** (from inside out):
  1. **Content**: The actual text, images, or child elements.
  2. **Padding**: Transparent area surrounding the content, inside the border. Affected by background styles.
  3. **Border**: Outer edge of the padding box.
  4. **Margin**: Transparent space outside the border separating the element from adjacent sibling elements.

### Q5: What does `box-sizing: border-box` do, and why is it preferred?
- **`content-box` (Default)**: Set `width` and `height` apply *only* to the content. Adding padding or borders increases the element's actual physical size on screen (`total width = width + padding + border`).
- **`border-box`**: Set `width` and `height` incorporate the content, padding, and border. Adding padding/border shrinks the content area but keeps the overall box size fixed.
- **Benefit**: Simplifies layout calculations and prevents unexpected design overflows.

### Q6: What is the primary difference between `margin` and `padding`?
- **`padding`**: Space *inside* the element's border. Increases clickable hit areas and inherits background styles.
- **`margin`**: Space *outside* the element's border. Used to position the element relative to surrounding siblings or page edges. Background styles do not apply.

### Q7: What is margin collapsing, and when does it occur?
- **Concept**: The vertical margins of adjacent block elements collapse into a single margin equal to the larger of the two values, rather than adding together.
- **Triggers**:
  - Adjacent sibling blocks (top/bottom margins).
  - Parent and first/last child with no intervening padding, borders, or inline content.
  - Empty blocks with no height, padding, or borders.
- **Note**: Horizontal margins never collapse.

### Q8: What is the difference between CSS reset and CSS normalization?
- **CSS Reset**: Hard-removes all native browser styles (margins, paddings, borders, list bullets), forcing a completely blank baseline across all elements (e.g., setting everything to `0`).
- **CSS Normalize**: Preserves useful native default styles while resolving inconsistencies and bugs across different browsers, creating a uniform, standardized baseline.

### Q9: What are the differences between standard display values?
- **`block`**: Starts on a new line; takes up the full width of its container. Respects width, height, margins, and paddings.
- **`inline`**: Flows with text on the same line. Ignores width/height and vertical margins/paddings.
- **`inline-block`**: Flows on the same line but respects custom width, height, margins, and paddings.
- **`none`**: Removes the element from the document visual layout and access trees; occupies zero space.

### Q10: What is the difference between `visibility: hidden` and `display: none`?
- **`display: none`**: Completely removes the element from the rendering tree and page layout. It takes up no space, and child elements are also completely hidden.
- **`visibility: hidden`**: Hides the element visually, but the element remains in the document flow, occupying its original layout space (acting as an invisible gap).

### Q11: Explain CSS Position values.
- **`static`**: Default. Follows normal document layout flow.
- **`relative`**: Positioned relative to its normal document flow position. Offset using `top`, `bottom`, `left`, `right` without affecting surrounding elements.
- **`absolute`**: Removed from normal flow. Positioned relative to its nearest *positioned* ancestor (anything other than `static`).
- **`fixed`**: Removed from flow. Positioned relative to the viewport. Remains locked in place when scrolling.
- **`sticky`**: Hybrid. Behaves like `relative` until a specified scroll offset is reached, then sticks in place like `fixed`.

### Q12: How does absolute positioning determine its target frame of reference?
- **Mechanism**: The browser searches up the DOM tree for the nearest ancestor element that has a `position` property set to `relative`, `absolute`, `fixed`, or `sticky`. If no positioned ancestor exists, it positions itself relative to the initial containing block (usually the `html` element).

### Q13: What is `z-index`, and how does it work?
- **Definition**: Determines the paint stack order of overlapping elements along the virtual Z-axis.
- **Requirements**: Only works on elements that have an explicit `position` other than `static` (and elements inside flex/grid containers).
- **Rule**: Elements with larger `z-index` values render on top of elements with lower values within the same **stacking context**.

### Q14: Differentiate between CSS length units.
- **`px`**: Absolute pixel unit. Fixed size, screen-independent baseline.
- **`em`**: Relative to the font-size of the element itself (or parent if used for `font-size` itself).
- **`rem`**: Relative strictly to the root font-size of the `<html>` document (typically `16px` by default).
- **`vw` / `vh`**: Relative to 1% of the viewport's active width or height.

### Q15: How does style inheritance work in CSS?
- **Concept**: Properties applied to parent elements are automatically passed down to their children.
- **Inherited by default**: Text-formatting properties like `color`, `font-family`, `font-size`, `line-height`, `letter-spacing`, and `text-align`.
- **Not inherited**: Box-model properties like `margin`, `padding`, `border`, `width`, `height`, `background`, and `position`.

### Q16: How is CSS Specificity calculated mathematically?
- **Calculation Formula**: Specificity is represented as a 4-part vector `(Inline, ID, Class/Attribute/Pseudo-class, Element/Pseudo-element)`:
  1. **Inline style (`style="..."`)**: `1,0,0,0`
  2. **ID selectors (`#id`)**: `0,1,0,0`
  3. **Classes, attributes, pseudo-classes (`.class`, `[type]`, `:hover`)**: `0,0,1,0`
  4. **Element & pseudo-element selectors (`div`, `::before`)**: `0,0,0,1`
- **Rule**: Compare vectors column-by-column from left to right. Whichever has a larger number at the first point of difference wins.

### Q17: What is the `!important` rule, and why should you avoid it?
- **Function**: Forces a style declaration to override any other rules, regardless of selector specificity.
- **Pitfalls**: Breaks the cascading nature of CSS, makes debugging and overriding styles incredibly difficult, and leads to CSS bloating. Should only be used to override inline styles from third-party scripts.

### Q18: How do you center a `<div>` both horizontally and vertically using Flexbox?
- **Implementation**: Apply display flex and alignment properties on the **parent** container:
  ```css
  .parent {
    display: flex;
    justify-content: center; /* Horizontally center */
    align-items: center;     /* Vertically center */
  }
  ```

### Q19: Explain the differences between `flex-grow`, `flex-shrink`, and `flex-basis`.
- **`flex-basis`**: Sets the default initial size of a flex item before remaining space is distributed (e.g., `200px` or `auto`).
- **`flex-grow`**: Defines the ability of a flex item to grow if extra space is available in the parent container. Expects a unitless ratio (e.g., `1` to grow proportionally).
- **`flex-shrink`**: Defines the ability of a flex item to shrink if there is insufficient space in the parent container (e.g., `1` to shrink, `0` to resist shrinking).

### Q20: What is CSS Grid, and how does it differ from Flexbox?
- **CSS Grid**: A 2-dimensional layout system. Excels at structuring columns *and* rows simultaneously. Best for overall page skeletons.
- **Flexbox**: A 1-dimensional layout system. Aligns elements along a single axis (either row *or* column). Best for component-level UI flows and simple stacks.

### Q21: How do you create a basic 3-column grid layout using CSS Grid?
- **Implementation**: Set the parent grid templates:
  ```css
  .grid-parent {
    display: grid;
    grid-template-columns: repeat(3, 1fr); /* 3 columns of equal fraction width */
    gap: 16px;                            /* Space between cells */
  }
  ```

### Q22: What are CSS pseudo-classes? Give three examples.
- **Definition**: Keywords appended to a selector that style elements based on their special state or user interaction without manual class additions.
- **Examples**:
  - `:hover`: Triggers when the user pointers over an element.
  - `:focus`: Triggers when an element (like an input) gains keyboard focus.
  - `:active`: Triggers when an element is actively clicked/pressed.

### Q23: What are CSS pseudo-elements, and how do they differ from pseudo-classes?
- **Definition**: Keywords prefixed with double colons (`::`) used to style specific parts of an element, or inject decorative virtual content.
- **Pseudo-classes vs Pseudo-elements**: Pseudo-classes target *states* of an entire element; pseudo-elements target or construct *portions* of an element (e.g., `::first-letter`, `::before`, `::after`).

### Q24: How do you declare and use CSS Variables (Custom Properties)?
- **Declaration**: Declared under a selector (often `:root` for global scope), prefixed with double dashes:
  ```css
  :root { --primary-color: #007bff; }
  ```
- **Usage**: Referenced using the `var()` function:
  ```css
  button { background-color: var(--primary-color); }
  ```

### Q25: Compare standard CSS color models: Hex, RGB, RGBA, HSL, and HSLA.
- **Hex**: Hexadecimal string (`#RRGGBB`). Simple, standard.
- **RGB**: Functional notation based on Red, Green, Blue levels (`rgb(255, 0, 0)`).
- **RGBA**: RGB with an Alpha channel (`rgba(red, green, blue, alpha)`) to adjust transparency (0.0 to 1.0).
- **HSL**: Hue (0-360), Saturation (0%-100%), Lightness (0%-100%) model. Intuitive for styling shade variations.
- **HSLA**: HSL with an Alpha transparency channel.

### Q26: What is the difference between `opacity` and an RGBA background color?
- **`opacity`**: Applies transparency to the entire element, including its content, text, and any nested child elements.
- **RGBA background**: Applies transparency *only* to the element's background. Nested child elements and overlay text remain fully opaque.

### Q27: What is a CSS Transition, and what are its key sub-properties?
- **Definition**: Smooths out property changes over a given duration, instead of making abrupt visual jumps.
- **Properties**:
  - `transition-property`: Target CSS property to animate (e.g., `background-color`, `opacity`).
  - `transition-duration`: Animation runtime length (e.g., `0.3s`).
  - `transition-timing-function`: Easing rate curve (e.g., `ease-in-out`, `linear`).
  - `transition-delay`: Wait time before the animation starts.

### Q28: How does the CSS `transform` property work?
- **Concept**: Modifies the visual coordinate space of an element without altering the surrounding document layout flow (does not trigger reflows).
- **Functions**:
  - `translate(x, y)`: Moves the element.
  - `rotate(deg)`: Spins the element.
  - `scale(x, y)`: Shrinks or enlarges the element.
  - `skew(x-deg, y-deg)`: Slants the element.

### Q29: What are CSS Media Queries?
- **Definition**: Syntactic filters used to apply distinct CSS styles depending on physical device capabilities (like screen width, height, resolution, or orientation).
- **Usage**:
  ```css
  @media (max-width: 768px) {
    .sidebar { display: none; } /* Applies only on screens <= 768px */
  }
  ```

### Q30: How do you style text alignment, line height, and letter spacing?
- **`text-align`**: Sets horizontal alignment of text (`left`, `right`, `center`, `justify`).
- **`line-height`**: Controls vertical space between text rows. Unitless values (e.g., `1.5`) are preferred because they scale relative to the active font-size.
- **`letter-spacing`**: Controls horizontal space between characters (e.g., `0.1em`).

### Q31: Compare `word-break: break-all` vs `overflow-wrap: break-word`.
- **`word-break: break-all`**: Forces long words to break and wrap at *any* character point, even if the word could fit unbroken on the next line.
- **`overflow-wrap: break-word` (formerly `word-wrap`)**: Wraps words naturally. It only breaks a massive word at an arbitrary character if it cannot fit inside its container without overflowing.

### Q32: How do you make an image responsive to its container width?
- **Implementation**: Apply fluid max-width constraints:
  ```css
  img {
    max-width: 100%; /* Scales down to fit parent width, never scales up larger than raw source */
    height: auto;    /* Preserves original aspect ratio */
  }
  ```

### Q33: Compare linear gradients and radial gradients.
- **Linear Gradient**: Transitions color smoothly along a straight straight line direction (e.g., top-to-bottom or 45-degree angle).
- **Radial Gradient**: Transitions color outwards in circular or elliptical patterns from a central focal point.

### Q34: What is the `float` property, and how do you clear floats?
- **`float`**: Shifts an element to the `left` or `right` of its container, allowing text and inline elements to wrap around it.
- **Clearing**: To restore standard block container flows, clear floats using the CSS `clear` property on a subsequent block:
  ```css
  .clear-element { clear: both; }
  ```
  Or apply the "clearfix" hack on the parent container using `::after`.

### Q35: What is the `overflow` property, and what are its options?
- **Purpose**: Controls how a container displays nested content that is larger than the container's physical dimensions.
- **Options**:
  - `visible` (Default): Content overflows outside the container edges.
  - `hidden`: Overlapping content is clipped and hidden.
  - `scroll`: Always renders scrollbars, even if content fits.
  - `auto`: Renders scrollbars only if the content actually overflows.

### Q36: How does the `:nth-child(n)` selector work?
- **Definition**: Matches an element based on its exact index sibling position among its brothers.
- **Syntaxes**:
  - `:nth-child(2)`: Matches the second child element.
  - `:nth-child(odd)` / `:nth-child(even)`: Matches alternating odd/even nodes.
  - `:nth-child(3n+1)`: Mathematical step iteration matching children 1, 4, 7, 10, etc.

### Q37: What is the purpose of the CSS `pointer-events` property?
- **Usage**: Controls how an element responds to graphical mouse, pointer, or touch interactions.
- **Value `pointer-events: none`**: Makes the element completely transparent to pointer clicks, causing click events to trigger on underlying elements instead.

### Q38: How do you style form input placeholders?
- **Implementation**: Target the input using the `::placeholder` pseudo-element:
  ```css
  input::placeholder {
    color: #999;
    font-style: italic;
  }
  ```

### Q39: Compare `text-shadow` vs `box-shadow`.
- **`text-shadow`**: Applies a drop shadow to raw typographic characters (`text-shadow: offset-x offset-y blur-radius color`).
- **`box-shadow`**: Applies a drop shadow to the element's rectangular physical box model, respecting border-radii.

### Q40: How do you create a perfect circle with CSS?
- **Implementation**: Set equal `width` and `height` dimensions to form a square, and apply `border-radius: 50%`.

### Q41: Explain the `@keyframes` rule.
- **Definition**: Defines stages and key moments of a custom CSS animation loop using percentage key points (`0%` to `100%` or `from` / `to`).
- **Usage**: Combined with the `animation` property on a selector to execute the sequence.

### Q42: What is the difference between `:root` and `html` selectors?
- **`:root`**: Matches the highest element in the document tree. In HTML, this is the `<html>` element, but `:root` has a higher CSS specificity than the standard `html` element selector. It is the standard home for declaring custom variables.

### Q43: What is the `content` property, and when is it used?
- **Purpose**: Injects anonymous text or visual assets into a page dynamically.
- **Rule**: Can *only* be used inside `::before` and `::after` pseudo-elements.

---

### Q44: [Coding Challenge] Horizontal and Vertical Centering with Flexbox
- **Objective**: Center a nested child inside a fixed-height parent.
- **Implementation**:
```css
.flex-parent {
  display: flex;
  justify-content: center; /* Align horizontally */
  align-items: center;     /* Align vertically */
  height: 300px;           /* Fixed container height */
  background-color: #f0f0f0;
}

.flex-child {
  width: 100px;
  height: 100px;
  background-color: #007bff;
}
```

### Q45: [Coding Challenge] Horizontal and Vertical Centering with CSS Grid
- **Objective**: Center a nested child using CSS Grid shorthand.
- **Implementation**:
```css
.grid-parent {
  display: grid;
  place-items: center; /* Shorthand for align-items & justify-items */
  height: 300px;
  background-color: #f0f0f0;
}

.grid-child {
  width: 100px;
  height: 100px;
  background-color: #28a745;
}
```

### Q46: [Coding Challenge] Responsive 3-Column Column Layout
- **Objective**: Code columns that sit next to each other on desktop and stack vertically on mobile.
- **Implementation**:
```css
.row {
  display: flex;
  flex-direction: row;
  gap: 16px;
}

.column {
  flex: 1; /* Distribute horizontal space equally */
  background-color: #ddd;
  padding: 16px;
}

/* Mobile responsive override */
@media (max-width: 600px) {
  .row {
    flex-direction: column; /* Stacks columns vertically */
  }
}
```

### Q47: [Coding Challenge] Button Hover Animation
- **Objective**: Implement a smooth hover scale-up and color transition on a button element.
- **Implementation**:
```css
.btn-animated {
  background-color: #007bff;
  color: #ffffff;
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  
  /* Configure transition properties */
  transition: background-color 0.3s ease, transform 0.3s ease;
}

.btn-animated:hover {
  background-color: #0056b3;
  transform: scale(1.05); /* Scales button up by 5% */
}
```

### Q48: [Coding Challenge] Circular Profile Card with Border and Shadow
- **Objective**: Code a perfectly circular avatar image container with standard border-radius and styling shadows.
- **Implementation**:
```css
.avatar-container {
  width: 120px;
  height: 120px;
  border-radius: 50%;          /* Enforces perfect circle */
  border: 4px solid #ffffff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  overflow: hidden;            /* Clips nested image to circular shape */
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;           /* Fits image without stretching aspect ratio */
}
```

### Q49: [Coding Challenge] Equal-Height Flexbox Cards
- **Objective**: Align cards in a row, ensuring they automatically stretch to equal heights even if they have different text lengths.
- **Implementation**:
```css
.card-row {
  display: flex;
  flex-direction: row;
  gap: 20px;
  align-items: stretch; /* Enforces equal-height children natively */
}

.card {
  flex: 1;
  background-color: #ffffff;
  border: 1px solid #ccc;
  padding: 20px;
  display: flex;
  flex-direction: column; /* Allows nested elements like footer to push to bottom */
}

.card-content {
  flex-grow: 1; /* Fills empty space, pushing card footer down */
}
```

### Q50: [Coding Challenge] Variable-Driven Primary Theme Button
- **Objective**: Create a themeable button using declared CSS custom properties.
- **Implementation**:
```css
:root {
  --theme-primary: #ff5722;
  --theme-text: #ffffff;
  --button-padding: 10px 20px;
}

.theme-button {
  background-color: var(--theme-primary);
  color: var(--theme-text);
  padding: var(--button-padding);
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.theme-button:hover {
  /* Override opacity of variable backgrounds easily */
  filter: brightness(90%);
}
```
