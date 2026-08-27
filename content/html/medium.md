# HTML - Medium Interview Questions

### Q1: What is the semantic difference between `<section>`, `<article>`, `<nav>`, `<aside>`, `<header>`, and `<footer>`?
- **`<section>`**: Groups thematic content, usually with a heading. Represents a generic section of a document.
- **`<article>`**: Encapsulates self-contained, independent content that could be distributed/reused standalone (e.g., blog post, forum card).
- **`<nav>`**: Declares a block of major navigation links.
- **`<aside>`**: Identifies auxiliary or tangent content located away from the main text flow (sidebars, callouts).
- **`<header>`**: Wraps introductory content, navigational aid, or branding (logo, title, search).
- **`<footer>`**: Contains footer metadata, copyright details, contact information, or sitemap links.

### Q2: Explain the difference between the `DOMContentLoaded` and window `load` events.
- **`DOMContentLoaded`**: Fired when the HTML document is fully parsed and the DOM tree is built, without waiting for external assets like images, stylesheets, and iframes to finish loading.
- **`load`**: Fired only when the entire page, including all dependent resources (images, stylesheets, subframes), is fully loaded.

### Q3: How does the browser parser handle rendering when it encounters a `<link rel="stylesheet">`?
- **HTML Parsing**: Modern browsers parse HTML in parallel with fetching stylesheets; stylesheets do not block HTML parsing.
- **CSSOM Blocking**: CSS block-renders. The browser halts visual layout and rendering until the **CSSOM** is constructed to prevent "Flash of Unstyled Content" (FOUC).
- **JS Execution**: Stylesheets block JS execution because JS may query style properties that rely on the parsed CSSOM.

### Q4: What is the difference between a shadow DOM and the standard light DOM?
- **Light DOM**: The standard DOM of a document. It is accessible globally via script query selectors and styled easily with global CSS rules.
- **Shadow DOM**: A scoped, encapsulated DOM subtree attached to an element. Styles and scripts defined inside the shadow DOM do not leak out, and global styles/scripts do not penetrate in (unless configured using custom properties/shadow parts).

### Q5: How can you leverage preloading resource hints in HTML?
- **`dns-prefetch`**: Resolves domain IP addresses early in the background to reduce DNS latency.
  - `<link rel="dns-prefetch" href="//example.com">`
- **`preconnect`**: Establishes early connection handshakes (DNS, TCP, TLS) with an external domain.
  - `<link rel="preconnect" href="https://example.com" crossorigin>`
- **`preload`**: Forces browser to download high-priority assets (fonts, hero images) immediately during initial parsing.
  - `<link rel="preload" href="font.woff2" as="font" type="font/woff2" crossorigin>`
- **`prefetch`**: Downloads low-priority assets during idle time, anticipating user navigation to other pages.
  - `<link rel="prefetch" href="next-page.html">`

### Q6: What is the custom elements specification, and how are Web Components defined?
- **Definition**: A web standard allowing developers to define new, reusable, custom HTML tags with their own properties, states, and lifecycle methods.
- **Mechanism**: Registered via `customElements.define('my-element', MyElementClass)`, extending the base `HTMLElement` class in JavaScript.

### Q7: Explain the differences between `localStorage`, `sessionStorage`, and Cookies.
- **`localStorage`**: Persistent client storage (no expiry). Stores up to ~5-10MB. Sent only on demand; never sent automatically in HTTP headers.
- **`sessionStorage`**: Scoped to the browser tab/session; cleared when the tab is closed. Stores up to ~5MB. Not sent in headers.
- **Cookies**: Tiny key-value pairs (~4KB limit). Sent automatically with *every* HTTP request to the domain. Support security flags (`HttpOnly`, `Secure`, `SameSite`) to mitigate XSS and CSRF.

### Q8: Contrast IndexedDB and Web SQL.
- **IndexedDB**: The modern, active web standard for client-side storage of large amounts of structured data, including files/blobs. It uses transactional key-value databases and is asynchronous.
- **Web SQL**: A deprecated relational SQL database system supported in some older browsers. It is no longer supported or maintained as a standard.

### Q9: What is the HTML template element (`<template>`), and how is it used?
- **Purpose**: Declares an inert HTML block that is parsed by the browser but not rendered, executed, or displayed on page load.
- **Usage**: Used in Web Components or JS frameworks. The content is cloned dynamically at runtime using JS via `document.importNode(template.content, true)`.

### Q10: What is the purpose of the `<slot>` element in Web Components?
- **Definition**: A placeholder inside a web component's Shadow DOM where developers can inject their own markup from the Light DOM.
- **Usage**: Enables composability. Named slots (`<slot name="title">`) allow targeted insertion of markup.

### Q11: Explain the security implications of using `innerHTML` vs `textContent` or `innerText`.
- **`innerHTML`**: Parses the input string as HTML. If the input contains untrusted user data, it can execute malicious scripts, leading to **Cross-Site Scripting (XSS)**.
- **`textContent`/`innerText`**: Treats the input purely as plain text. Any HTML tags or `<script>` tags are rendered literally and not parsed or executed, neutralizing XSS threats.

### Q12: Explain the security attributes `crossorigin` and `integrity` inside `<script>` elements.
- **`integrity`**: Contains a cryptographic hash (Subresource Integrity - SRI) used by the browser to verify that the fetched script hasn't been altered or compromised by a CDN or man-in-the-middle.
- **`crossorigin`**: Instructs the browser how to handle CORS request options. Set to `anonymous` to prevent sending credentials (cookies) to external domains.

### Q13: How does custom form validation work using the HTML5 constraint validation API?
- **Mechanism**: Use JavaScript properties on form fields: `element.validity` (checks rules like `valueMissing`, `patternMismatch`), `element.validationMessage`, and the method `element.setCustomValidity('error message')`.
- **Trigger**: Calling `setCustomValidity()` sets the field as invalid and displays the custom error message on submission. Setting it to an empty string (`""`) resets validity.

### Q14: What is the relationship between the HTML `manifest` attribute and PWAs?
- **Legacy (`manifest` attribute)**: Linked an Application Cache file (`.appcache`) containing off-line resources. Now deprecated due to design flaws.
- **Modern**: Replaced by **Web App Manifests** (`<link rel="manifest" href="/manifest.json">`) which configures app presentation, icons, colors, start URLs, and offline configurations supported by Service Workers.

### Q15: What is the difference between the `hidden` attribute and CSS `display: none`?
- **`hidden` attribute**: A logical/semantic property indicating the element is irrelevant. It applies a default user-agent style of `display: none !important` (which can be easily overridden by a lower-specificity CSS `display` rule).
- **`display: none`**: A presentation-level CSS style that strictly removes the element from the layout flow and visual rendering. It always overrides default UA styles.

### Q16: What is the `<dialog>` element, and what is the difference between `show()` and `showModal()`?
- **`<dialog>`**: A native HTML5 element representing a modal or non-modal dialog box.
- **`show()`**: Opens the dialog as a modeless pop-up. The user can still interact with background content.
- **`showModal()`**: Opens the dialog as a modal window. It prevents interactions with the background, automatically places a semi-transparent backdrop (`::backdrop`), traps keyboard focus, and closes natively when the `Esc` key is pressed.

### Q17: How do you implement native Drag and Drop in HTML?
- **Steps**:
  1. Add `draggable="true"` to the target element.
  2. Handle the `ondragstart` event to store dragging data via `event.dataTransfer.setData(format, data)`.
  3. On the target drop container, handle `ondragover` and call `event.preventDefault()` to allow dropping.
  4. Handle `ondrop` and retrieve data via `event.dataTransfer.getData(format)`.

### Q18: Explain the role and attributes of the `<map>` and `<area>` tags.
- **Purpose**: Creates an interactive image map, allowing you to define multiple clickable spatial regions on a single image.
- **Attributes**:
  - `<map name="mapname">`: Associated with an `<img>` using `usemap="#mapname"`.
  - `<area>`: Nested inside `<map>`. Defines the clickable shape (`rect`, `circle`, `poly`) and coordinates (`coords`), linking to a destination (`href`).

### Q19: What is the `<output>` tag in HTML forms, and when should it be used?
- **Purpose**: Represents the result of a calculation or a user action (e.g., dynamically displaying total checkout price or input range values).
- **Benefit**: Provides semantic clarity and accessibility support, informing screen readers that this element contains calculated data output.

### Q20: Explain the purpose of `<optgroup>` in `<select>` elements.
- **Purpose**: Groups related `<option>` tags inside a dropdown menu.
- **Benefit**: Organizes large dropdown lists with non-selectable, bold section headers, improving user navigation.

### Q21: What is the `download` attribute in the `<a>` tag?
- **Function**: Forces the browser to download the linked file instead of opening and displaying it inside the window.
- **Customization**: Passing a value specifies the downloaded file name (e.g., `download="report-2026.pdf"`). Works only on same-origin or `blob:` / `data:` URLs.

### Q22: What are the pros/cons of inline SVG vs SVG inside an `<img>` tag?
- **Inline SVG**:
  - *Pros*: Scalable, styled/manipulated via CSS/JS, and eliminates a separate HTTP request.
  - *Cons*: bloats HTML file size, not cached separately by browsers.
- **SVG in `<img>`**:
  - *Pros*: Cached by browsers, clean HTML.
  - *Cons*: No direct CSS customization or JS interactivity from the host page.

### Q23: What are interactive ARIA state attributes like `aria-expanded`, `aria-checked`, and `aria-selected`?
- **`aria-expanded`**: Communicates whether a collapsible element (like a dropdown or accordion) is currently expanded (`true`) or collapsed (`false`).
- **`aria-checked`**: Indicates the state of a checkbox or radio button (`true`, `false`, `mixed`).
- **`aria-selected`**: Indicates the current selection state of tabs, grid-cells, or option listings.

### Q24: Explain the difference between `role="presentation"` and `aria-hidden="true"`.
- **`role="presentation"`**: Removes the semantic meaning of an element but keeps its textual content visible and readable to screen readers. Often used to clean up layout tables.
- **`aria-hidden="true"`**: Completely hides the element and all its children from screen readers, even if they remain visually visible on screen.

### Q25: How do you implement skip-to-content links for accessibility?
- **Concept**: A keyboard-accessible link at the top of the body that allows screen reader and keyboard-only users to bypass main menu bars and jump straight to the unique content.
- **Implementation**: Create `<a href="#main" class="skip-link">Skip to Main Content</a>`. Style class with off-screen positioning unless focused (`:focus`).

### Q26: What is the benefit of `target="iframe_name"` on anchor tags?
- **Concept**: Instructs the browser to load the destination URL of the clicked hyperlink inside a nested `<iframe>` with `name="iframe_name"` on the same page, preventing a full browser redirect.

### Q27: What is the purpose of the `<object>` and `<embed>` tags, and are they still relevant?
- **Purpose**: Used to embed external multimedia, interactive plugins, or documents (PDFs, Flash, active-X).
- **Relevance**: Mostly obsolete. Replaced by modern HTML5 elements (`<video>`, `<audio>`), inline SVGs, and security-controlled `<iframe>` containers.

### Q28: What is the purpose of the `<kbd>`, `<samp>`, and `<code>` tags?
- **`<code>`**: Marks up a snippet of computer code.
- **`<kbd>`**: Identifies keyboard inputs, keystrokes, or voice input instructions (e.g., `<kbd>Ctrl</kbd> + <kbd>C</kbd>`).
- **`<samp>`**: Represents sample output from a computer program, script, or system.

### Q29: How do you control browser auto-filling using the `autocomplete` attribute?
- **Usage**: Add `autocomplete` to inputs to help browsers auto-fill entries or to disable autofilling.
- **Values**: Set `autocomplete="off"` to prevent storage. Use values like `autocomplete="current-password"`, `autocomplete="cc-number"` (credit card), or `autocomplete="new-password"` for customized auto-fills.

### Q30: Explain the difference between Service Workers and Application Cache.
- **Application Cache (AppCache)**: An obsolete declarative cache strategy using a text manifest. Very rigid, difficult to update, and prone to breaking pages.
- **Service Workers**: JavaScript network proxies running in the background. They intercept every HTTP fetch request, enabling developers to write highly robust, custom programmatic cache strategies (e.g., Cache-first, Network-first).

### Q31: How does the HTML5 Geolocation API work?
- **Usage**: Request the browser for user's geographic location coordinates via `navigator.geolocation.getCurrentPosition(successCallback, errorCallback)`.
- **Security**: Requires secure origins (`HTTPS`) and explicit user permission.

### Q32: What is the `<canvas>` state stack (context save and restore)?
- **`ctx.save()`**: Pushes the current canvas configuration state (styles, transformations, clipping path) onto a stack.
- **`ctx.restore()`**: Pops the last saved state from the stack and restores the canvas coordinates and style context, preventing drawing styles from polluting subsequent renders.

### Q33: Explain the difference between `event.preventDefault()` and `event.stopPropagation()`.
- **`event.preventDefault()`**: Prevents the browser's default behavior for that event (e.g., stops a form from submitting, or an anchor link from redirecting). Does not stop event bubbling.
- **`event.stopPropagation()`**: Stops the event from bubbling up the DOM tree, preventing parent handlers from intercepting the event. Does not prevent browser default behaviors.

### Q34: What is Event Delegation in the context of DOM manipulation?
- **Concept**: Attaching a single event listener to a parent element instead of attaching multiple listeners to separate child elements.
- **Benefits**:
  - Reduces memory usage.
  - Automatically handles dynamically added elements (since the parent listener intercepts everything bubbling up).

### Q35: What is the purpose of the `is` attribute on HTML elements?
- **Usage**: Used to instantiate a customized built-in element (part of Web Components).
- **Example**: `<button is="fancy-button">Submit</button>`. Extends a native element's built-in behaviors while retaining its default accessibility and features.

### Q36: What is the function of the `<base>` tag in the `<head>`?
- **Function**: Establishes a base URL and target window configuration for all relative links, images, and form targets inside the document.
- **Caution**: Only one `<base>` tag can exist in a document. It must be declared inside the `<head>`.

### Q37: Contrast Client-Side Rendering (CSR) vs Server-Side Rendering (SSR) HTML delivery.
- **CSR**: Server delivers a skeletal HTML file containing a single root element and a heavy bundle script. The script compiles and renders the DOM on the client's device. Slow initial paint, bad for SEO.
- **SSR**: Server compiles the final HTML string with full data content and sends it to the client. Faster initial paint, excellent for SEO, but increases server computational load.

### Q38: What is a Web Worker, and how is it initialized?
- **Purpose**: Runs a JavaScript script in a background thread, isolated from the main UI thread, to process heavy mathematical operations without locking the browser's UI.
- **Initialization**: Created via `new Worker('worker.js')`. Communicates with the main script using `postMessage()` and the `onmessage` event listener.

### Q39: What are custom HTML5 global attributes? List at least 5.
- **Definition**: Attributes that can be used on any HTML element, regardless of tag specification.
- **Examples**: `class`, `id`, `style`, `title`, `dir` (text direction), `tabindex`, `contenteditable`, `draggable`, `hidden`, `lang`.

### Q40: Explain the difference between the `<bdi>` and `<bdo>` elements.
- **`<bdi>` (Bi-Directional Isolation)**: Isolates a text segment that might be formatted in a different direction (e.g., Hebrew or Arabic) from the surrounding text, preventing layout corruption.
- **`<bdo>` (Bi-Directional Override)**: Explicitly overrides and reverses the current text direction (using `dir="rtl"` or `dir="ltr"`).

### Q41: What is the `contenteditable` attribute?
- **Function**: A global attribute that transforms a standard HTML element (like `<div>` or `<p>`) into an interactive, editable text area directly in the browser.
- **Values**: `true` (editable), `false` (read-only), `plaintext-only` (prevents rich formatting paste).

### Q42: What is the significance of the `spellcheck` attribute?
- **Function**: A global attribute indicating if the element's editable content should have its grammar and spelling checked by the browser's native spell checker (`true` or `false`). Works on text inputs, textareas, or contenteditable elements.

### Q43: How do nested lists represent hierarchical levels correctly?
- **Rules**: A child `<ul>` or `<ol>` cannot be placed directly as a child of a parent list element. It must be nested inside a specific `<li>` element to comply with W3C standards.

---

### Q44: [Coding Challenge] Accessible Modal Dialog
- **Objective**: Implement a semantic `<dialog>` modal with custom styled backdrop and modal trigger script.
- **Implementation**:
```html
<!-- Trigger Button -->
<button id="open-btn">Open Modal Dialog</button>

<!-- Modal Dialog -->
<dialog id="custom-modal">
  <h3>Terms & Conditions</h3>
  <p>Do you accept our terms and conditions to proceed with your user registration?</p>
  <form method="dialog">
    <button value="cancel">Cancel</button>
    <button id="confirm-btn" value="confirm">Accept</button>
  </form>
</dialog>

<script>
  const modal = document.getElementById('custom-modal');
  document.getElementById('open-btn').addEventListener('click', () => {
    modal.showModal(); // Opens natively and intercepts background click
  });
  modal.addEventListener('close', () => {
    console.log(`User Action: ${modal.returnValue}`);
  });
</script>
```

### Q45: [Coding Challenge] Progressive Web App Service Worker Script Integration
- **Objective**: Write the script that registers a service worker on page load with offline-capable logging.
- **Implementation**:
```html
<script>
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('ServiceWorker registered with scope: ', registration.scope);
        })
        .catch((error) => {
          console.error('ServiceWorker registration failed: ', error);
        });
    });
  }
</script>
```

### Q46: [Coding Challenge] Form with Auto-Calculating Output
- **Objective**: Create a range slider and number input that dynamically calculates and shows outputs.
- **Implementation**:
```html
<form oninput="total.value = parseInt(price.value) * parseInt(quantity.value)">
  <fieldset>
    <legend>Dynamic Cost Calculator</legend>
    
    <label for="price">Unit Price ($):</label>
    <input id="price" type="range" min="1" max="100" value="25">
    <output for="price" id="price-val">25</output>
    
    <br><br>
    
    <label for="quantity">Quantity:</label>
    <input id="quantity" type="number" min="1" value="2">
    
    <hr>
    
    <strong>Total Price: $</strong>
    <output name="total" for="price quantity">50</output>
  </fieldset>
</form>

<script>
  // Sync slider label separately
  const slider = document.getElementById('price');
  const sliderVal = document.getElementById('price-val');
  slider.addEventListener('input', () => {
    sliderVal.textContent = slider.value;
  });
</script>
```

### Q47: [Coding Challenge] Custom Web Component (Custom Element)
- **Objective**: Implement a custom element with Shadow DOM encapsulating its content and style.
- **Implementation**:
```html
<!-- Register custom element template -->
<template id="user-card-template">
  <style>
    .card { background: #f4f4f9; border-left: 5px solid #0056b3; padding: 10px; border-radius: 4px; }
  </style>
  <div class="card">
    <h4><slot name="username">Default Name</slot></h4>
    <p>Role: <slot name="role">Guest</slot></p>
  </div>
</template>

<user-card>
  <span slot="username">John Doe</span>
  <span slot="role">Lead Engineer</span>
</user-card>

<script>
  class UserCard extends HTMLElement {
    constructor() {
      super();
      const template = document.getElementById('user-card-template');
      const shadowRoot = this.attachShadow({ mode: 'open' });
      shadowRoot.appendChild(template.content.cloneNode(true));
    }
  }
  customElements.define('user-card', UserCard);
</script>
```

### Q48: [Coding Challenge] Native HTML5 Drag and Drop Containers
- **Objective**: Build two boxes allowing interactive dragging of a text block from one to another.
- **Implementation**:
```html
<style>
  .dropzone { width: 200px; height: 100px; border: 2px dashed #999; margin: 10px; display: inline-block; vertical-align: top; }
  .draggable-item { padding: 8px; background: #333; color: #fff; cursor: grab; }
</style>

<div id="zone-1" class="dropzone" ondragover="allowDrop(event)" ondrop="drop(event)">
  <div id="drag-item" class="draggable-item" draggable="true" ondragstart="drag(event)">Drag Me!</div>
</div>

<div id="zone-2" class="dropzone" ondragover="allowDrop(event)" ondrop="drop(event)"></div>

<script>
  function allowDrop(ev) {
    ev.preventDefault(); // Required to let drop happen
  }
  function drag(ev) {
    ev.dataTransfer.setData("text_id", ev.target.id);
  }
  function drop(ev) {
    ev.preventDefault();
    const dataId = ev.dataTransfer.getData("text_id");
    const targetElement = ev.target;
    // Ensure we are dropping into the dropzone container itself
    if (targetElement.classList.contains('dropzone')) {
      targetElement.appendChild(document.getElementById(dataId));
    }
  }
</script>
```

### Q49: [Coding Challenge] Optimized Vector Icon Reuse using SVG Symbols
- **Objective**: Define SVG templates inside a document and display them using clean, reusable icons.
- **Implementation**:
```html
<!-- Hidden SVG asset definitions (best placed near top or bottom of page) -->
<svg style="display: none;">
  <symbol id="icon-check" viewBox="0 0 24 24">
    <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
  </symbol>
  <symbol id="icon-warning" viewBox="0 0 24 24">
    <path fill="currentColor" d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
  </symbol>
</svg>

<!-- Display instances with CSS-driven size & color -->
<div class="status-msg success" style="color: green;">
  <svg width="24" height="24"><use href="#icon-check"></use></svg>
  <span>Task Completed Successfully!</span>
</div>

<div class="status-msg warning" style="color: orange;">
  <svg width="24" height="24"><use href="#icon-warning"></use></svg>
  <span>Warning: Disk space is running low.</span>
</div>
```

### Q50: [Coding Challenge] HTML5 Resource Preload Configuration
- **Objective**: Write an optimized `<head>` showing early pre-connection and prioritized asset fetching.
- **Implementation**:
```html
<head>
  <meta charset="utf-8">
  <title>High Performance Site</title>
  
  <!-- Warm up connections to critical third-party APIs -->
  <link rel="preconnect" href="https://api.example.com">
  <link rel="dns-prefetch" href="https://api.example.com">
  
  <!-- Preload high-priority hero layout image immediately -->
  <link rel="preload" href="/images/hero-banner.webp" as="image" type="image/webp">
  
  <!-- Preload essential branding font files before layout paint -->
  <link rel="preload" href="/fonts/brand-light.woff2" as="font" type="font/woff2" crossorigin="anonymous">
</head>
```
