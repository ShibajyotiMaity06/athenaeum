# HTML - Hard Interview Questions

### Q1: What is the Critical Rendering Path (CRP), and how does the structure of HTML impact it?
- **Definition**: The sequence of steps the browser takes to convert HTML, CSS, and JS into pixels on the screen: DOM -> CSSOM -> Render Tree -> Layout -> Paint -> Composite.
- **HTML Impact**:
  - The DOM is constructed incrementally. The browser can parse and build the DOM node-by-node.
  - CSS is render-blocking. If `<link>` tags are placed at the bottom, rendering is delayed or causes Flash of Unstyled Content (FOUC).
  - Scripts are parser-blocking. A standard `<script>` halts HTML tokenization immediately to fetch and execute, delaying DOM completion.

### Q2: Detail the lifecycle phases of a custom Web Component.
- **`constructor()`**: Instantiated. Used for initializing state, templates, and shadow DOM. No DOM manipulations or attribute reading should happen here.
- **`connectedCallback()`**: Invoked when the element is appended to the document DOM. Used for setups, listeners, and rendering.
- **`disconnectedCallback()`**: Invoked when the element is removed from the DOM. Used for cleanups (removing event listeners, intervals).
- **`attributeChangedCallback(name, oldVal, newVal)`**: Invoked when an observed attribute is added, removed, or updated. Requires declaring observed properties in `static get observedAttributes()`.
- **`adoptedCallback()`**: Invoked when the element is moved to a new document (e.g., inside an `iframe`).

### Q3: Explain the relationship between HTML accessibility trees, DOM trees, and ARIA Live Regions.
- **A11y Tree**: A subset of the DOM tree constructed by browsers containing elements, states, roles, and properties parsed specifically for assistive technologies (screen readers).
- **Aria Live Regions**: Configured via `aria-live`. Instructs screen readers to announce dynamic content changes immediately without requiring manual user focus.
  - `aria-live="polite"`: Screen reader waits until current announcement/action is completed before speaking changes.
  - `aria-live="assertive"`: Interrupts any active speech immediately to announce changes.

### Q4: Detail how iframes are secured using `sandbox` and `allow` attributes.
- **`sandbox`**: Restricts capabilities of the iframe. By default, `<iframe sandbox>` enforces maximum security (blocks scripts, forms, popups, same-origin storage). Specific clearances are declared explicitly (e.g., `sandbox="allow-scripts allow-forms"`).
- **`allow` (Feature Policy)**: Restricts hardware/browser features inside the iframe (e.g., `allow="camera; microphone; geolocation"`).

### Q5: How do HTML5 Server-Sent Events (SSE) via the `EventSource` API work, and how do they compare to WebSockets?
- **SSE**: Establishing a persistent, unidirectional HTTP connection from server to client using the standard `EventSource` API. Server streams text/event-stream content.
- **Comparison**:
  - **Direction**: SSE is unidirectional (server -> client); WebSockets are bidirectional (client <-> server).
  - **Protocol**: SSE uses standard HTTP; WebSockets require a custom TCP protocol handshake (`ws://` / `wss://`).
  - **Reconnection**: SSE features automatic reconnection built-in; WebSockets require custom JavaScript retry logic.

### Q6: Explain Web Component styling encapsulation using CSS Shadow Parts.
- **Problem**: Shadow DOM isolates custom component styling, making it impossible for external global styles to target inner nodes.
- **Solution (`::part()`)**: Inside the shadow DOM, tag stylable elements with the `part` attribute (e.g., `<button part="submit-btn">`). The outer page can target and style this specific node using `my-component::part(submit-btn) { background: red; }`.

### Q7: Explain the HTML5 Spec Tokenization and Tree Construction phases.
- **Tokenization**: Consumes raw HTML string characters and emits structured tokens (StartTag, EndTag, Character, Comment, DocType).
- **Tree Construction**: A state-machine takes emitted tokens and processes them by maintaining an active element stack. If invalid tags or unclosed nodes are encountered, the parser executes pre-defined recovery rules (e.g., wrapping table rows in implicit table elements, or auto-closing inline tags) to construct a valid DOM tree without throwing syntax errors.

### Q8: How does standard browser parsing change when encountering CSS media queries in `<link>` elements?
- **Behavior**: All linked CSS files are fetched concurrently by the browser preload scanner regardless of the `media` attribute query.
- **Render Block**: The stylesheet blocks visual page rendering *only* if the media query matches the current screen configuration (e.g., `<link media="(min-width: 800px)">` blocks rendering only on screens >= 800px). Non-matching stylesheets do not block page rendering.

### Q9: Explain COOP (Cross-Origin Opener Policy) and COEP (Cross-Origin Embedder Policy) headers.
- **COOP**: Restricts cross-origin windows from gaining access to the opening page window reference (`window.opener`). Set to `same-origin` to isolate the page context.
- **COEP**: Requires all nested resources (images, iframes) loaded on the page to explicitly consent to cross-origin resource sharing (CORS) or be blocked.
- **Integration**: Combining both policies enables access to high-performance APIs like `SharedArrayBuffer` and high-resolution timers, protecting against side-channel specter attacks.

### Q10: What is the Web Share API in HTML5, and how is it used?
- **Purpose**: Invokes the mobile device's native sharing hub to share text, URLs, or files directly from the web browser.
- **Syntax**: `navigator.share({ title, text, url })` returns a Promise.
- **Requirements**: Requires HTTPS and must be triggered by an active user interaction (like a `click` event listener).

### Q11: Explain how you handle high-DPI (Retina) scaling on an HTML `<canvas>`.
- **The Issue**: Standard canvases look blurry on high-DPI screens because logical CSS pixels do not match physical screen pixels.
- **The Solution**: Read the device pixel ratio (`window.devicePixelRatio`). Scale the canvas's physical width and height attributes by this ratio, then use CSS to style the canvas's display size back to the original logical width and height. Scale the drawing context using `ctx.scale(ratio, ratio)`.

### Q12: Explain mathematically how `sizes` and `srcset` decide which image is downloaded.
- **Syntax**: `<img srcset="pic-sm.jpg 300w, pic-lg.jpg 1200w" sizes="(max-width: 600px) 100vw, 50vw" src="fallback.jpg">`
- **Steps**:
  1. The browser evaluates screen width. If viewport = 480px, the `(max-width: 600px)` query matches, returning a layout width of `100vw` (480px).
  2. The browser calculates target physical pixels: `Layout Width * devicePixelRatio` (e.g., `480px * 2 (Retina) = 960px`).
  3. The browser examines `srcset` options (`300w`, `1200w`) and picks the smallest size that is >= 960px. It selects `pic-lg.jpg` (1200w).

### Q13: What is HTML Microdata, and how is it used for rich snippets?
- **Purpose**: Machine-readable markup vocabulary integrated into HTML tags to help search engines parse structured data (events, products, authors).
- **Core Attributes**:
  - `itemscope`: Declares a scope containing an entity item.
  - `itemtype`: Specifies the schema schema URL (e.g., `https://schema.org/Product`).
  - `itemprop`: Identifies individual property keys (e.g., `itemprop="name"`).

### Q14: Explain the "First Rule of ARIA" and how ARIA conflicts with native states.
- **First Rule**: "If you can use a native HTML element or attribute with the semantics and behavior you require, instead of re-purposing an element and adding an ARIA role... then do so."
- **Conflict**: If ARIA roles or states contradict native behaviors (e.g., setting `<input type="checkbox" role="button">`), browsers may deliver broken accessibility tree nodes and confuse assistive devices.

### Q15: Why is the use of `document.write()` prohibited in modern pages?
- **Render Blocking**: Forces the parser to stop completely and evaluate the stream content. It can erase the existing document tree if called after the page has finished loading.
- **Performance**: Prevents browser lookahead scanners from pre-loading subsequent resources, causing severe loading delays.

### Q16: How does the HTML5 Page Visibility API work, and why is it useful?
- **Concept**: Detects if the web page is currently active, minimized, or in a background browser tab.
- **Implementation**: Listens to the `visibilitychange` event on the `document` object, and reads the value of `document.visibilityState` (`visible` or `hidden`).
- **Use Case**: Pauses heavy canvas animations, video playbacks, or API polling when the tab is hidden, preserving device battery and reducing bandwidth.

### Q17: Explain the `<input type="file">` attributes: `accept`, `multiple`, and `webkitdirectory`.
- **`accept`**: Restricts the file picker to specific file types (e.g., `accept="image/*,application/pdf"`).
- **`multiple`**: Allows users to select more than one file in the file explorer dialog.
- **`webkitdirectory`**: Allows the user to select an entire folder/directory (and recursively parses all nested files).

### Q18: Compare the accessibilities of `tabindex="0"`, `tabindex="-1"`, and `tabindex="1"`.
- **`tabindex="0"`**: Inserts an element into the natural keyboard tabbing order based on its position in the DOM. Essential for custom interactive widgets.
- **`tabindex="-1"`**: Removes an element from the keyboard tabbing order but allows it to be focused programmatically via JavaScript (`element.focus()`).
- **`tabindex="1"` (Positive integer)**: Forces a manual tab order. Considered a major anti-pattern because any DOM updates break the keyboard loop.

### Q19: What does the HTML `ismap` attribute do on image elements?
- **Concept**: Declares a server-side image map.
- **Mechanism**: When nested inside an `<a>` link, clicking on the image appends the exact click coordinate to the anchor URL path query (e.g., `href.html?x=45&y=112`) and redirects the user.

### Q20: Explain the role of `<link rel="canonical">` in SEO.
- **Function**: Declares the preferred, master version URL of a webpage when duplicate or highly similar content is reachable on multiple paths (like tracking UTM parameters or search query variants).
- **SEO Value**: Prevents duplicate content penalties by merging search indexing signals and ranking weights onto the primary canonical URL.

### Q21: What is the `fetchpriority` attribute, and how does it optimize resource loading?
- **Purpose**: Instructs the browser's preload scanner on the relative download priority of an asset.
- **Values**: `high` (e.g., prioritizes LCP images), `low` (e.g., deprioritizes non-visible images or third-party widgets), or `auto` (default).
- **Example**: `<img src="hero.jpg" fetchpriority="high">`.

### Q22: Explain the recursive evaluation of nested `<object>` tag fallbacks.
- **Mechanism**: The browser attempts to render the outermost `<object>` using its target MIME type. If the browser cannot parse or load that asset (e.g., missing plugin), it falls back recursively, evaluating nested inner elements (other objects, images, or plain text fallback tags) until a valid render target is resolved.

### Q23: How does `table-layout: fixed` optimize HTML table rendering speed?
- **Default (`auto`)**: The browser must download and parse *all* row data across the table to calculate column widths based on the widest content.
- **Fixed (`fixed`)**: The browser renders the column widths based strictly on the layout rules of the first row cells. It paints the table progressively, row-by-row, dramatically boosting speed for large datasets.

### Q24: Explain the significance of the `nonce` attribute in Content Security Policies (CSP).
- **Mechanism**: A dynamic, cryptographically strong random token ("number used once") declared on a `<script>` or `<style>` tag that matches the active CSP HTTP header value.
- **Security**: Prevents XSS. Even if an attacker injects a malicious `<script>` tag, the browser will refuse to execute it because it lacks the valid, single-use secret `nonce` value.

### Q25: Why must image tags declare `width` and `height` dimensions in HTML5?
- **Core Reason**: Prevents **Cumulative Layout Shift (CLS)**.
- **Mechanism**: Modern browsers calculate the aspect ratio of the image early from these attributes. It reserves placeholder layout box sizing on screen *before* the image file is actually downloaded, preventing adjacent content from shifting abruptly once loaded.

### Q26: What is the Web Speech API?
- **Components**:
  - **SpeechSynthesis**: Converts text strings to spoken audio output using native browser voices (`speechSynthesis.speak()`).
  - **SpeechRecognition**: Converts captured microphone audio streams into text transcripts. Requires network communication on some browsers.

### Q27: How do you bypass native validation to perform form handling completely in JavaScript?
- **Implementation**: Add the `novalidate` attribute to the `<form>` tag.
- **JS Integration**: Handle form submission via `form.addEventListener('submit', (e) => { e.preventDefault(); ... })`. Manually call `form.checkValidity()` or parse `validity` objects on individual fields to render custom error elements.

### Q28: Describe the roles of `<colgroup>` and `<col>` in HTML tables.
- **Purpose**: Groups one or more table columns together to apply shared styles, widths, or structural attributes.
- **Performance**: Applying styles (like background color or width) on a single `<col>` element is much more efficient than applying classes across hundreds of individual `<td>` cells.

### Q29: What is the `ping` attribute on anchor elements?
- **Concept**: A space-separated list of URLs to which the browser sends a small POST request with the body `PING` when the user clicks the hyperlink.
- **Use Case**: Used for tracking user click analytics and redirects asynchronously without delaying navigation.

### Q30: What are the UX and accessibility pitfalls of the `autofocus` attribute?
- **Pitfalls**:
  - **Focus Hijacking**: Automatically scrolls the page on load, disorienting keyboard users.
  - **Screen Reader Interruption**: Screen readers immediately announce the focused input, cutting off the page title and introductory header text announcements.

### Q31: What is the technical mechanism behind password autofill in browsers?
- **Autofill Hook**: Browsers detect form patterns (e.g., an `<input type="password">` preceding an `<input type="text">` or `<input type="email">`).
- **Security**: Managed by credential storage vaults. Script access to the autocompleted password value is blocked in some browsers until the user explicitly interacts with the page or form.

### Q32: Explain the use of the `enterkeyhint` attribute on text inputs.
- **Function**: Configures the label display text of the "Enter/Submit" action key on soft/on-screen virtual keyboards on mobile devices.
- **Values**: `enter`, `done`, `go`, `next`, `previous`, `search`, `send`.

### Q33: How does the `<wbr>` tag differ from the `&shy;` character?
- **`<wbr>` (Word Break Opportunity)**: Indicates where a browser is allowed to break a long word or URL if wrapping is required, without inserting any character.
- **`&shy;` (Soft Hyphen)**: Indicates where a word can be broken and wrapped. The browser automatically inserts a hyphen character (`-`) if the word wraps at that point.

### Q34: Contrast `location.replace()` vs `location.assign()` inside scripts.
- **`location.assign(url)`**: Loads the new document and adds the URL to the browser's navigation history stack. The user can click "Back" to return to the original page.
- **`location.replace(url)`**: Overwrites the current page entry in the navigation history stack with the new URL. The "Back" button skips the original page.

### Q35: What is the purpose of the `referrerpolicy` attribute?
- **Purpose**: Controls how much referrer information (the page URL where the click originated) is sent along in the HTTP headers when loading resources or clicking links.
- **Values**: `no-referrer`, `origin`, `same-origin`, `strict-origin-when-cross-origin`.

### Q36: What is the `inert` attribute in HTML5, and how does it simplify accessibility?
- **Concept**: A global boolean attribute that instructs the browser to ignore the element and all of its nested children.
- **Impact**: It blocks all keyboard focus, click events, and hides elements from the screen reader's accessibility tree, making it incredibly easy to trap focus inside open modals or sidebars.

### Q37: How do you make the `<mark>` element accessible?
- **The Issue**: Many screen readers do not announce high-lighted `<mark>` text by default.
- **The Solution**: Use CSS generated content or ARIA roles to explicitly announce highlighted states (e.g., wrapping in an element styled with custom accessible descriptive text).

### Q38: Explain how the browser's preloader lookahead parser works.
- **Mechanism**: A fast, lightweight sub-parser that scans the HTML document ahead of the primary DOM construction engine, identifying external resources (stylesheets, scripts, images) and initiating network requests immediately. This prevents the browser from idling while waiting for preceding files to execute.

### Q39: What is the purpose of the `capture` attribute on `<input type="file">`?
- **Function**: On mobile devices, it directly invokes native media capture sensors (camera or microphone) to upload a brand new asset instead of opening the local file storage directory.
- **Values**: `user` (front-facing camera/microphone), `environment` (rear-facing camera).

### Q40: How does browser tokenization handle unclosed elements?
- **Resolution**: The HTML parser maintains a "list of active formatting elements." If a start tag lacks an end tag, or is malformed, the parser reconstructs formatting nodes dynamically inside subsequent sibling branches, correcting errors transparently.

### Q41: Explain how `window.devicePixelRatio` impacts canvas sizing.
- **Equation**: If screen DPI is high, the browser maps multiple physical pixels to one CSS pixel.
- **Adjustment**:
  ```js
  const ratio = window.devicePixelRatio || 1;
  canvas.width = cssWidth * ratio;
  canvas.height = cssHeight * ratio;
  canvas.style.width = `${cssWidth}px`;
  canvas.style.height = `${cssHeight}px`;
  ```

### Q42: How do CSS variables cross the Shadow DOM barrier?
- **Mechanism**: CSS Custom Properties (`--my-variable`) are inherited. They penetrate the shadow DOM boundary, allowing parent or global documents to define theme variables that the encapsulated component accesses natively.

### Q43: What is the semantic role of the `<dialog>` backdrop pseudo-element?
- **Definition**: The `::backdrop` pseudo-element matches the full-viewport background styled natively when a `<dialog>` is rendered using `showModal()`. It isolates the modal visually and prevents clicks from bubbling to background elements.

---

### Q44: [Coding Challenge] Modal Overlay with Focus Trap using Inert
- **Objective**: Create an accessible modal. When opened, all other page content is disabled using the `inert` attribute to trap keyboard focus.
- **Implementation**:
```html
<main id="page-content">
  <h1>Main Page Content</h1>
  <button id="open-btn">Open Dialog</button>
  <p>Some interactive elements: <a href="#">Link 1</a>, <input type="text"></p>
</main>

<div id="modal-wrapper" style="display: none;">
  <div role="dialog" aria-modal="true" aria-labelledby="title">
    <h2 id="title">User Confirmation</h2>
    <p>Please confirm your action.</p>
    <button id="close-btn">Cancel</button>
    <button id="submit-btn">Confirm</button>
  </div>
</div>

<script>
  const mainContent = document.getElementById('page-content');
  const modalWrapper = document.getElementById('modal-wrapper');
  const openBtn = document.getElementById('open-btn');
  const closeBtn = document.getElementById('close-btn');

  openBtn.addEventListener('click', () => {
    modalWrapper.style.display = 'block';
    mainContent.setAttribute('inert', ''); // Traps keyboard and hides page-content from screen readers
    closeBtn.focus();
  });

  const closeModal = () => {
    modalWrapper.style.display = 'none';
    mainContent.removeAttribute('inert'); // Restores interactivity
    openBtn.focus();
  };

  closeBtn.addEventListener('click', closeModal);
</script>
```

### Q45: [Coding Challenge] Canvas Retina Scaled Animation Loop
- **Objective**: Implement a crisp, responsive, high-DPI scaled canvas drawing animation loop.
- **Implementation**:
```html
<canvas id="anim-canvas" style="width: 300px; height: 150px; background: #222;"></canvas>

<script>
  const canvas = document.getElementById('anim-canvas');
  const ctx = canvas.getContext('2d');
  
  function resizeCanvas() {
    const ratio = window.devicePixelRatio || 1;
    const width = 300;
    const height = 150;
    
    // Scale canvas buffer size
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    
    // Restore styling dimension
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    
    // Reset context scale
    ctx.scale(ratio, ratio);
  }
  
  let posX = 0;
  function draw() {
    ctx.clearRect(0, 0, 300, 150);
    
    // Crisp circle render
    ctx.beginPath();
    ctx.arc(posX, 75, 20, 0, Math.PI * 2);
    ctx.fillStyle = '#00ffcc';
    ctx.fill();
    
    posX = (posX + 2) % 300;
    requestAnimationFrame(draw);
  }
  
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
  draw();
</script>
```

### Q46: [Coding Challenge] Microdata Semantic Event Metadata
- **Objective**: Code a semantic event representation with rich microdata targeting search indexing engines.
- **Implementation**:
```html
<article itemscope itemtype="https://schema.org/Event">
  <header>
    <h1 itemprop="name">Global Web Standards Summit 2026</h1>
    <p itemprop="description">Join us to discuss semantic layouts, PWAs, and high-performance HTML APIs.</p>
  </header>
  
  <section>
    <h3>Schedule & Location</h3>
    <p>Starts: <time itemprop="startDate" datetime="2026-10-15T09:00">October 15, 2026 at 9:00 AM</time></p>
    <p>Ends: <time itemprop="endDate" datetime="2026-10-17T17:00">October 17, 2026 at 5:00 PM</time></p>
    
    <div itemprop="location" itemscope itemtype="https://schema.org/Place">
      <span itemprop="name">Metropolitan Convention Center</span>
      <div itemprop="address" itemscope itemtype="https://schema.org/PostalAddress">
        <span itemprop="streetAddress">123 Tech Blvd</span>,
        <span itemprop="addressLocality">San Francisco</span>,
        <span itemprop="addressRegion">CA</span>
      </div>
    </div>
  </section>
  
  <footer>
    <p>Ticket Price: 
      <span itemprop="offers" itemscope itemtype="https://schema.org/Offer">
        <meta itemprop="priceCurrency" content="USD" />
        <span itemprop="price">299.00</span>
        <link itemprop="availability" href="https://schema.org/InStock" />Online
      </span>
    </p>
  </footer>
</article>
```

### Q47: [Coding Challenge] Responsive Image with Srcset and Sizes Calculation
- **Objective**: Deliver a banner image optimized for desktop, tablet, and mobile with high-pixel density screens.
- **Implementation**:
```html
<img 
  srcset="/images/banner-300.webp 300w, 
          /images/banner-600.webp 600w, 
          /images/banner-1200.webp 1200w"
  sizes="(max-width: 480px) 100vw, 
         (max-width: 1024px) 50vw, 
         1200px"
  src="/images/banner-default.jpg" 
  alt="Advanced Responsive Image Delivery" 
  loading="lazy" 
  width="1200" 
  height="600"
>
```

### Q48: [Coding Challenge] Custom Reactive Web Component with Attributes
- **Objective**: Create a reactive custom element that dynamically updates internal shadow DOM when registered attributes change.
- **Implementation**:
```html
<progress-badge percent="45"></progress-badge>

<script>
  class ProgressBadge extends HTMLElement {
    static get observedAttributes() {
      return ['percent'];
    }
    
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this.shadowRoot.innerHTML = `
        <style>
          .badge { display: inline-block; padding: 4px 8px; border-radius: 12px; font-weight: bold; background: #e0e0e0; }
        </style>
        <span class="badge">Progress: <span id="num">0</span>%</span>
      `;
    }
    
    attributeChangedCallback(name, oldVal, newVal) {
      if (name === 'percent') {
        const badgeSpan = this.shadowRoot.getElementById('num');
        if (badgeSpan) badgeSpan.textContent = newVal;
      }
    }
  }
  customElements.define('progress-badge', ProgressBadge);
</script>
```

### Q49: [Coding Challenge] Server-Sent Events Dynamic Progress Bar
- **Objective**: Implement client-side connection using EventSource updating a semantic `<progress>` element.
- **Implementation**:
```html
<section>
  <h3>Task Import Progress</h3>
  <progress id="task-progress" max="100" value="0"></progress>
  <p id="status-label">Connecting to server...</p>
</section>

<script>
  const progressBar = document.getElementById('task-progress');
  const statusLabel = document.getElementById('status-label');
  
  // Establish unidirectional SSE stream connection
  const eventSource = new EventSource('/api/task-progress-stream');
  
  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    progressBar.value = data.percentage;
    statusLabel.textContent = `Processing step ${data.step}: ${data.percentage}%`;
    
    if (data.percentage >= 100) {
      statusLabel.textContent = "Task Import Complete!";
      eventSource.close(); // Terminate server-sent stream gracefully
    }
  };
  
  eventSource.onerror = (err) => {
    console.error("SSE Connection Failed: ", err);
    statusLabel.textContent = "Failed to fetch progress updates.";
    eventSource.close();
  };
</script>
```

### Q50: [Coding Challenge] Frame Isolation Sandbox Policy
- **Objective**: Load an untrusted external script dashboard securely inside an isolation iframe.
- **Implementation**:
```html
<iframe 
  src="https://thirdparty-analytics.com/dashboard" 
  name="secure-iframe"
  width="100%" 
  height="400"
  style="border: 0;"
  sandbox="allow-scripts" 
  allow="geolocation 'none'; camera 'none'; microphone 'none';" 
  referrerpolicy="no-referrer"
  loading="lazy"
>
  <p>Your browser does not support embedded frames. <a href="https://thirdparty-analytics.com/dashboard">Link to Dashboard</a></p>
</iframe>
```
