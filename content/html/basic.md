# HTML - Basic Interview Questions

### Q1: What is the HTML DocType declaration, and why is it needed?
- **Definition**: `<!DOCTYPE html>` is a preamble that instructs the browser about the version of HTML the page is written in.
- **Purpose**: It prevents the browser from entering **quirks mode** (which emulates bugs of older browsers) and forces it to render the document in **standards mode** according to W3C specifications.
- **Syntax**: In HTML5, it is extremely compact and case-insensitive: `<!DOCTYPE html>`.

### Q2: What are semantic elements, and why are they preferred over non-semantic elements?
- **Definition**: **Semantic elements** clearly describe their meaning to both the browser and the developer (e.g., `<header>`, `<article>`, `<nav>`), whereas **non-semantic elements** say nothing about their content (e.g., `<div>`, `<span>`).
- **Benefits**:
  - **Accessibility (a11y)**: Screen readers can easily build the document outline and let users jump to sections.
  - **SEO**: Search engine web crawlers prioritize content inside relevant semantic tags.
  - **Maintainability**: Creates a cleaner, more readable code structure for development teams.

### Q3: Explain the difference between block-level and inline elements.
- **Block-level**:
  - **Flow**: Starts on a new line and takes up the full width of its parent container.
  - **Box Model**: Respects vertical and horizontal `margin`, `padding`, `width`, and `height`.
  - **Examples**: `<div>`, `<p>`, `<h1>`-`<h6>`, `<ul>`, `<article>`.
- **Inline**:
  - **Flow**: Does not start on a new line; fits horizontally next to other inline elements.
  - **Box Model**: Ignores `width` and `height`. Horizontal `margin` and `padding` work, but vertical ones do not affect surrounding element flow.
  - **Examples**: `<span>`, `<a>`, `<strong>`, `<em>`, `<img>`.

### Q4: What is the difference between inline and inline-block display values?
- **`display: inline`**: Elements flow inline. Custom `width`, `height`, and vertical `margin`/`padding` are ignored.
- **`display: inline-block`**: Elements flow inline but behave like block-level elements. They respect custom `width`, `height`, and vertical `margin`/`padding`.

### Q5: What does the `alt` attribute do in an `<img>` tag, and why is it essential?
- **Function**: Specifies an alternate text description for an image if it fails to load.
- **Accessibility**: Screen readers read this text to visually impaired users, making the website accessible.
- **SEO**: Search engines index the `alt` text to understand the image content, improving search visibility.

### Q6: How does lazy loading work in HTML5, and how is it implemented?
- **Mechanism**: Defers the loading of off-screen images/iframes until the user scrolls near them, reducing initial load time and bandwidth.
- **Implementation**: Add `loading="lazy"` attribute directly to `<img>` or `<iframe>` tags.
- **Value**: Native support eliminates the need for external heavy JavaScript libraries.

### Q7: What are the key differences between HTML and XHTML?
- **HTML**: Forgiving parser; elements do not need to be closed (`<br>`), tag names are case-insensitive, and attribute values can be unquoted. It is an application of SGML (or its own standard in HTML5).
- **XHTML**: Stricter XML-based markup; all tags must be closed (`<br />`), tag names must be lowercase, attributes must be quoted, and elements must nest correctly.

### Q8: Explain the purpose of the `<head>` element and what tags typically reside inside it.
- **Purpose**: A container for metadata (data about data) that isn't directly visible to end-users on the webpage, but configuration details for the browser and search engines.
- **Contents**: Includes `<title>`, `<meta>` (charset, viewport, SEO description), `<link>` (CSS files, favicons), `<script>` (JS files), and `<style>` (internal styles).

### Q9: What is the difference between `<b>`/`<i>` and `<strong>`/`<em>` tags?
- **`<b>` and `<i>`**: Purely physical/presentational tags; make text **bold** or *italic* without conveying any semantic weight.
- **`<strong>` and `<em>`**: Semantic/logical tags; denote strong importance or emphasized text, which screen readers speak with different pitch or emphasis.

### Q10: What is the role of the `<meta>` viewport tag, and what is its standard configuration?
- **Role**: Controls the dimensions and scaling of the viewport to ensure the webpage is responsive and renders properly on mobile devices.
- **Standard Syntax**: `<meta name="viewport" content="width=device-width, initial-scale=1.0">`
- **Breakdown**: `width=device-width` matches screen width; `initial-scale=1.0` sets the default zoom level.

### Q11: How do you link an external CSS file and a JavaScript file in HTML?
- **CSS Link**: Uses the `<link>` tag in the `<head>` section.
  - `<link rel="stylesheet" href="styles.css">`
- **JS Link**: Uses the `<script>` tag, usually placed at the bottom of the `<body>` or in the `<head>` with optimization attributes.
  - `<script src="script.js"></script>`

### Q12: What is the difference between `<script>`, `<script async>`, and `<script defer>`?
- **`<script>`**: Blocks HTML parsing. The browser stops, fetches the script, executes it, and then resumes HTML parsing.
- **`<script async>`**: Fetches the script asynchronously in parallel with HTML parsing, but executes it the moment it finishes downloading, which blocks HTML parsing during execution. Execution order is not guaranteed.
- **`<script defer>`**: Fetches the script in parallel with HTML parsing, but defers execution until the HTML parsing is completely finished. Execution order is guaranteed as they appear in the HTML.

### Q13: What is an anchor tag, and what is the function of the `target="_blank"` attribute?
- **Anchor Tag**: `<a href="url">` creates hyperlinks to navigate to other pages.
- **`target="_blank"`**: Instructs the browser to open the linked document in a new tab or window.

### Q14: What security vulnerability is associated with `target="_blank"`, and how do you prevent it?
- **Vulnerability**: The newly opened page gets access to the original page's `window.opener` object, allowing it to redirect the original tab to a malicious URL (**reverse tabnabbing**).
- **Prevention**: Always pair `target="_blank"` with `rel="noopener"` or `rel="noreferrer"`.

### Q15: What are the main types of lists supported in HTML?
- **Ordered List (`<ol>`)**: Numbered/alphabetic items.
- **Unordered List (`<ul>`)**: Bulleted/styled icon items.
- **Description List (`<dl>`)**: Key-value pairs using `<dt>` (description term) and `<dd>` (description details).

### Q16: How do you create a table in HTML? Mention the basic tags involved.
- **Structure**: Tables organize tabular data.
- **Core Tags**:
  - `<table>`: Wrapper element.
  - `<thead>`, `<tbody>`, `<tfoot>`: Semantic structural wrappers.
  - `<tr>`: Table row.
  - `<th>`: Header cell (bold and centered by default).
  - `<td>`: Standard data cell.

### Q17: What are self-closing (void) elements? Give some examples.
- **Definition**: Elements that cannot have any child elements or inner text. They do not require a closing tag.
- **Examples**: `<img>`, `<input>`, `<br>` (line break), `<hr>` (horizontal rule), `<meta>`, `<link>`.

### Q18: What is the difference between a `class` and an `id` attribute?
- **`id`**: Unique identifier. Must be unique within a single document; a element can have only one ID, and a page can have only one element with that ID. High CSS specificity.
- **`class`**: Reusable identifier. Can be used on multiple elements, and a single element can have multiple classes (space-separated). Lower CSS specificity.

### Q19: What is the purpose of the `<form>` element, and what are its common attributes?
- **Purpose**: Creates an interactive section to collect user inputs and submit them to a server.
- **Attributes**:
  - `action`: Server endpoint where data is sent.
  - `method`: HTTP method used to send data (`GET` or `POST`).
  - `enctype`: Encoding type for the form data (e.g., `multipart/form-data` for file uploads).

### Q20: Explain the difference between `GET` and `POST` form methods.
- **`GET`**: Appends form data to the URL in query parameters (`?key=val`). Visible to users, bookmarked, cached, limited in size, and insecure for sensitive data.
- **`POST`**: Sends data inside the HTTP request body. Private, non-cachable, unlimited size, and used for sensitive input or modifying server-side state.

### Q21: What are HTML5 input types, and why are they beneficial?
- **Types**: `email`, `url`, `tel`, `number`, `date`, `color`, `range`.
- **Benefits**:
  - Native client-side data validation.
  - Displays optimized input controls (e.g., numeric keypads on mobile screens, native calendar datepickers).

### Q22: How do you create an email link or a telephone link in HTML?
- **Email Link**: `<a href="mailto:support@example.com">Contact Support</a>`
- **Phone Link**: `<a href="tel:+1234567890">Call Us</a>`

### Q23: What is the purpose of the `<label>` tag, and how do you associate it with an input?
- **Purpose**: Associates a text label with a form control. Improves hit-areas (clicking the label focuses the input) and accessibility.
- **Association Methods**:
  1. Wrap the input inside the label: `<label>Name: <input type="text"></label>`.
  2. Use the `for` attribute matching the input's `id`: `<label for="username">User:</label> <input id="username" type="text">`.

### Q24: Explain the difference between the `placeholder` and `value` attributes in inputs.
- **`placeholder`**: A temporary hint text displayed in the input when it is empty. It is not submitted with the form.
- **`value`**: The actual content/data stored inside the input field. It is submitted with the form.

### Q25: What is the `<canvas>` element, and how does it differ from SVG?
- **`<canvas>`**: Raster-based, script-driven (manipulated via JavaScript). Great for complex, real-time pixel rendering (games, video processing). Does not scale gracefully without losing quality.
- **`SVG`**: Vector-based (XML file structure). Fully interactive, supports CSS styling, and scales infinitely without loss of sharpness. Ideal for logos, icons, and diagrams.

### Q26: How do you embed a video and audio in HTML5 without plugins?
- **Video**: `<video src="movie.mp4" controls width="400">Your browser does not support the video tag.</video>`
- **Audio**: `<audio src="song.mp3" controls></audio>`
- **Note**: The nested text acts as a fallback for browsers that do not support the elements.

### Q27: What is the purpose of the `<iframe>` element, and how do you secure it?
- **Purpose**: Embeds another HTML document inside the current page.
- **Security**: Use the `sandbox` attribute to restrict permissions (e.g., `sandbox="allow-scripts allow-same-origin"`). Use `referrerpolicy` and `allow` for fine-grained feature policies.

### Q28: What are HTML entities, and when do we use them?
- **Definition**: Reserved characters or symbols that cannot be rendered directly in text because they clash with HTML syntax or are unavailable on standard keyboards.
- **Syntax**: Begins with `&` and ends with `;`.
- **Examples**: `&lt;` for `<`, `&gt;` for `>`, `&amp;` for `&`, `&nbsp;` for a non-breaking space.

### Q29: What is the role of ARIA attributes in HTML?
- **Definition**: **Accessible Rich Internet Applications** attributes.
- **Role**: Enhances accessibility when native semantic elements are insufficient. They define custom controls, states, or dynamic updates (e.g., `aria-label`, `aria-hidden="true"`, `role="button"`).

### Q30: What is the `<fieldset>` and `<legend>` tag used for?
- **`<fieldset>`**: Groups related input fields and form elements together semantically.
- **`<legend>`**: Provides a visible caption or label for the corresponding `<fieldset>`.

### Q31: What is the difference between the `<section>` and `<article>` semantic elements?
- **`<article>`**: Represents a self-contained, independent piece of content that could be distributed or syndicated on its own (e.g., blog post, product card, forum comment).
- **`<section>`**: Represents a thematic grouping of content, typically with a heading. It is part of a larger whole.

### Q32: What is the `<aside>` element, and when should it be used?
- **Definition**: Represents content that is tangentially related to the surrounding content (like a sidebar, callout box, advertising area, or biographical details).
- **Positioning**: It does not need to be on the left or right; its placement is semantic, not visual.

### Q33: What is the `<main>` element, and can there be multiple `<main>` elements in a document?
- **Definition**: Wraps the unique, central content of the document.
- **Rule**: There must be only one visible `<main>` element per document. Any secondary `<main>` elements must have the `hidden` attribute.

### Q34: What are data attributes (`data-*`), and how do you access them?
- **Purpose**: Stores custom, private data on HTML elements without using non-standard attributes.
- **Syntax**: Prefixed with `data-` (e.g., `data-user-id="123"`).
- **Access**: In JavaScript, accessed via the `dataset` property (e.g., `element.dataset.userId`). In CSS, accessed via `attr(data-user-id)`.

### Q35: How do you define a dropdown selection menu in HTML?
- **Syntax**: Use the `<select>` wrapper tag with nested `<option>` tags representing choices.
- **Example**:
  ```html
  <select name="city">
    <option value="ny">New York</option>
    <option value="la">Los Angeles</option>
  </select>
  ```

### Q36: What does the `<figure>` and `<figcaption>` elements do?
- **`<figure>`**: Encapsulates self-contained media (images, diagrams, code listings) that are referenced in the main text.
- **`<figcaption>`**: Represents a caption or explanation for the rest of the contents of the parent `<figure>`.

### Q37: What is the `<details>` and `<summary>` element?
- **`<details>`**: An disclosure widget that allows the user to expand or collapse content.
- **`<summary>`**: Acts as the visible, interactive label or heading for the `<details>` widget.

### Q38: What is the `<time>` tag, and why is it useful?
- **Purpose**: Displays human-readable dates/times while providing machine-readable values using the `datetime` attribute.
- **SEO/a11y**: Helps calendar crawlers, search engines, and screen readers parse timestamps accurately.
- **Example**: `<time datetime="2026-08-26">August 26, 2026</time>`.

### Q39: What is character encoding (e.g., UTF-8), and why is it defined in the `<head>`?
- **Definition**: A mapping of numeric values to physical letters and symbols.
- **UTF-8**: The standard encoding supporting almost all world characters.
- **Importance**: Declaring `<meta charset="utf-8">` prevents browsers from rendering corrupt text ("mojibake") and should be specified near the top of `<head>`.

### Q40: What is the difference between absolute and relative URLs?
- **Absolute**: Contains the complete address including protocol, domain name, and path (e.g., `https://example.com/images/logo.png`). Used for external links.
- **Relative**: Specifies the location relative to the current file's directory (e.g., `/images/logo.png` or `../styles.css`). Used for internal assets.

### Q41: What is the function of the `<noscript>` tag?
- **Function**: Displays alternative HTML content to users who have disabled JavaScript in their browser settings or whose browsers do not support JS scripts.

### Q42: How does the `<progress>` tag differ from the `<meter>` tag?
- **`<progress>`**: Represents completion progress of a task (e.g., downloading progress, task status). It is dynamic.
- **`<meter>`**: Represents a scalar measurement within a known range, or a fractional value (e.g., disk usage, battery level, temperature).

### Q43: What is DOM (Document Object Model), and how is it related to HTML?
- **Relation**: HTML is the raw source string representing the structure of a webpage. The **DOM** is the object-oriented, tree-like representation of that HTML generated in memory by the browser. Script languages (JS) use the DOM to dynamically manipulate the webpage elements.

---

### Q44: [Coding Challenge] Semantic HTML5 Layout for a Blog Article
- **Objective**: Create a semantic layout representing a blog article.
- **Implementation**:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Understanding Semantic HTML5</title>
</head>
<body>
  <header>
    <h1>Web Development Journal</h1>
    <nav>
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/blog">Blog</a></li>
      </ul>
    </nav>
  </header>
  <main>
    <article>
      <header>
        <h2>The Power of Semantic HTML5 Elements</h2>
        <p>Published: <time datetime="2026-08-26">August 26, 2026</time> by Jane Doe</p>
      </header>
      <section>
        <h3>Introduction</h3>
        <p>Semantic elements improve structure, readability, accessibility, and search ranking.</p>
      </section>
      <footer>
        <p>Categories: Web Standards, Frontend</p>
      </footer>
    </article>
    <aside>
      <h3>About the Author</h3>
      <p>Jane Doe is an engineer specializing in accessible frontend layouts.</p>
    </aside>
  </main>
  <footer>
    <p>&copy; 2026 Web Development Journal. All rights reserved.</p>
  </footer>
</body>
</html>
```

### Q45: [Coding Challenge] Fully Validated User Registration Form
- **Objective**: Create a user registration form with native HTML validation attributes.
- **Implementation**:
```html
<form action="/api/register" method="POST">
  <fieldset>
    <legend>Account Information</legend>
    
    <label for="username">Username:</label>
    <input id="username" name="username" type="text" minlength="4" required placeholder="User123">
    
    <label for="email">Email Address:</label>
    <input id="email" name="email" type="email" required placeholder="name@domain.com">
    
    <label for="password">Password (min 8 chars, 1 number):</label>
    <input id="password" name="password" type="password" minlength="8" pattern="^(?=.*[0-9]).{8,}$" required>
    
    <label for="experience">Years of Experience:</label>
    <input id="experience" name="experience" type="number" min="0" max="50" default="1">
    
    <label for="tos">
      <input id="tos" name="tos" type="checkbox" required> I accept the terms of service.
    </label>
    
    <button type="submit">Register</button>
  </fieldset>
</form>
```

### Q46: [Coding Challenge] Accessible and Semantic Data Table
- **Objective**: Code a data table optimized for readability and screen readers.
- **Implementation**:
```html
<table>
  <caption>Annual Team Performance Metrics</caption>
  <thead>
    <tr>
      <th scope="col">Employee Name</th>
      <th scope="col">Department</th>
      <th scope="col">Q1 Revenue</th>
      <th scope="col">Q2 Revenue</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">Alice Johnson</th>
      <td>Sales</td>
      <td>$12,000</td>
      <td>$15,500</td>
    </tr>
    <tr>
      <th scope="row">Bob Smith</th>
      <td>Marketing</td>
      <td>$8,500</td>
      <td>$9,200</td>
    </tr>
  </tbody>
  <tfoot>
    <tr>
      <th scope="row" colspan="2">Total Revenue</th>
      <td>$20,500</td>
      <td>$24,700</td>
    </tr>
  </tfoot>
</table>
```

### Q47: [Coding Challenge] Adaptive Media Player with Multiple Fallbacks
- **Objective**: Implement a video tag serving responsive formats, captions, and fallback support.
- **Implementation**:
```html
<video width="640" height="360" controls poster="/assets/poster.jpg" preload="metadata">
  <!-- Preferred modern format -->
  <source src="/assets/trailer.webm" type="video/webm">
  <!-- Highly compatible fallback format -->
  <source src="/assets/trailer.mp4" type="video/mp4">
  
  <!-- Accessibility English captions -->
  <track src="/assets/captions_en.vtt" kind="captions" srclang="en" label="English" default>
  
  <!-- Fallback message for older browsers -->
  <p>Your browser doesn't support HTML5 video. <a href="/assets/trailer.mp4">Download the video file instead</a>.</p>
</video>
```

### Q48: [Coding Challenge] Responsive Image Delivery using Picture
- **Objective**: Implement screen-size responsive image delivery to optimize layout shift and bandwidth.
- **Implementation**:
```html
<picture>
  <!-- Desktop screen size -->
  <source media="(min-width: 1024px)" srcset="/images/banner-desktop.webp 1x, /images/banner-desktop@2x.webp 2x" type="image/webp">
  <!-- Tablet screen size -->
  <source media="(min-width: 768px)" srcset="/images/banner-tablet.webp" type="image/webp">
  <!-- Default / Mobile fallback -->
  <img src="/images/banner-mobile.jpg" alt="Company Promotional Banner" loading="lazy" width="400" height="250">
</picture>
```

### Q49: [Coding Challenge] Pure HTML Interactive Accordion FAQ
- **Objective**: Build an interactive accordion interface without utilizing JavaScript.
- **Implementation**:
```html
<section>
  <h2>Frequently Asked Questions</h2>
  
  <details open>
    <summary>What is your return policy?</summary>
    <p>We offer a 30-day money-back guarantee on all orders, no questions asked.</p>
  </details>
  
  <details>
    <summary>Do you offer international shipping?</summary>
    <p>Yes, we ship to over 120 countries worldwide. International shipping fees apply.</p>
  </details>
  
  <details>
    <summary>How can I track my shipment?</summary>
    <p>Once processed, an email containing your carrier tracking ID will be dispatched.</p>
  </details>
</section>
```

### Q50: [Coding Challenge] Form with Dynamic Suggestion List
- **Objective**: Implement an input text field linked to an autocomplete suggestions dropdown.
- **Implementation**:
```html
<form action="/search" method="GET">
  <label for="skill-search">Select Tech Skill:</label>
  <input id="skill-search" name="skill" type="text" list="tech-skills" placeholder="Type a technology...">
  
  <datalist id="tech-skills">
    <option value="HTML5"></option>
    <option value="CSS3"></option>
    <option value="JavaScript"></option>
    <option value="ReactJS"></option>
    <option value="TypeScript"></option>
    <option value="Node.js"></option>
  </datalist>
  
  <button type="submit">Search</button>
</form>
```
