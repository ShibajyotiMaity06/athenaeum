# Express - Basic Interview Questions

## Theory Questions & Answers

### Q1: What is Express.js, and why is it used?
* **Definition:** Express.js is a minimal, flexible, and lightweight web application framework for Node.js.
* **Why it's used:** It provides robust routing tables, handles request/response manipulation cleanly, simplifies middleware integration, and abstracts away the complexities of Node's raw `http` module.

### Q2: What is the relation between Node.js and Express.js?
* **Runtime vs Framework:** Node.js is the underlying runtime environment that executes JavaScript. Express.js is a software framework built *on top* of Node's native HTTP capabilities to streamline backend development.

### Q3: How do you initialize a basic Express application?
* **Setup:** Import the express module, invoke the library to initialize an application instance, configure routes, and call `app.listen()` on a port.
  ```javascript
  const express = require('express');
  const app = express();
  app.listen(3000, () => console.log('Listening on 3000'));
  ```

### Q4: What is Middleware in Express?
* **Definition:** Middleware consists of function chains executed sequentially during the request-response cycle.
* **Capabilities:** Middleware can execute any code, modify the request (`req`) and response (`res`) objects, end the request-response cycle, or call the next middleware in the stack.

### Q5: Explain the structure of an Express middleware function.
* **Arguments:** Middleware functions receive three primary arguments: `req` (the request object), `res` (the response object), and `next` (a callback function to pass execution to the subsequent middleware).
  ```javascript
  function myMiddleware(req, res, next) {
    // Action code
    next(); // Transfer control
  }
  ```

### Q6: What is the purpose of the `next()` function in middleware?
* **Flow Control:** If the current middleware does not end the request-response cycle (e.g., by sending a response), it *must* call `next()` to pass control to the next middleware. Otherwise, the request will hang indefinitely.

### Q7: How do you serve static files in Express?
* **Method:** Use the built-in `express.static` middleware.
* **Example:**
  ```javascript
  app.use(express.static('public')); // Serves files out of /public folder
  ```

### Q8: Explain standard HTTP methods supported by Express routing.
* **Routing Methods:** Express supports direct route handlers corresponding to standard HTTP verbs: `app.get()`, `app.post()`, `app.put()`, `app.delete()`, `app.patch()`, and `app.options()`.

### Q9: What is the purpose of the `app.all()` method?
* **Definition:** A routing method that matches all HTTP request methods (GET, POST, PUT, DELETE, etc.) for a specified path. Useful for setting global headers or locks on specific paths.

### Q10: What is the difference between `app.use()` and `app.get()`?
* **`app.use()`:** Mounts the specified middleware function(s) at the path. Matches any path starting with the prefix (e.g., `/user` matches `/user/profile`).
* **`app.get()`:** Specifically listens for GET HTTP requests on an *exact* path match.

### Q11: How do you retrieve route parameters in Express?
* **Mechanism:** Access properties on the `req.params` object.
* **Syntax:**
  ```javascript
  app.get('/users/:userId', (req, res) => {
    const id = req.params.userId;
  });
  ```

### Q12: How do you retrieve query string parameters in Express?
* **Mechanism:** Access properties on the `req.query` object. Express parses query parameters automatically.
* **Example:** `/search?term=node` $\rightarrow$ `req.query.term` returns `'node'`.

### Q13: How do you access POST request body data in Express?
* **Mechanism:** Access properties on the `req.body` object.
* **Requirement:** Must include body-parsing middleware like `express.json()` or `express.urlencoded()` in your app before route definitions.

### Q14: What is the purpose of `express.json()` and `express.urlencoded()`?
* **`express.json()`:** Built-in middleware that parses incoming requests containing JSON payloads.
* **`express.urlencoded()`:** Parses incoming requests containing URL-encoded (form data) payloads.

### Q15: How do you send a JSON response in Express?
* **Method:** Use the `res.json()` method. It automatically serializes the passed object and sets the `Content-Type` header to `application/json`.
* **Example:**
  ```javascript
  res.json({ message: "Hello World" });
  ```

### Q16: How do you set HTTP response status codes in Express?
* **Method:** Use the `res.status(code)` method. It supports chaining with response-sending methods.
* **Example:**
  ```javascript
  res.status(201).json({ created: true });
  ```

### Q17: What is the difference between `res.send()`, `res.json()`, and `res.end()`?
* **`res.send()`:** Automatically checks the output data type and sets appropriate `Content-Type` (HTML/String/Buffer/JSON) headers accordingly.
* **`res.json()`:** Explicitly converts objects to JSON strings and sets content headers to application/json.
* **`res.end()`:** Instantly terminates the response cycle without returning any payload data.

### Q18: Compare `res.write()` with `res.end()`.
* **`res.write()`:** Sends raw chunked data states without ending the response. Useful for custom streams.
* **`res.end()`:** Signals that the full response headers and payload body are complete and forces the request-response process to finish.

### Q19: How do you perform a redirect in Express?
* **Method:** Use the `res.redirect()` method.
* **Usage:** `res.redirect('/new-page')` (sends a default `302 Found` status) or `res.redirect(301, '/permanent-page')`.

### Q20: What is an Error-Handling middleware in Express?
* **Definition:** A specialized middleware that accepts **four** arguments instead of three: `(err, req, res, next)`.
* **Behavior:** Express matches this signature to route errors caught in route chains or passed down via `next(err)`.

### Q21: How do you define a route parameter regex match?
* **Syntax:** Append the regex pattern in parentheses directly after the route parameter.
* **Example:**
  ```javascript
  app.get('/users/:id(\\d+)', ...) // Matches '/users/123', ignores '/users/abc'
  ```

### Q22: What are Express Routers and why are they used?
* **Definition:** `express.Router` is an isolated instance of middleware and routes. It is a "mini-application" used to group and modularize routing patterns cleanly across sub-components of large projects.

### Q23: How do you mount an Express Router?
* **Mounting:** Use `app.use()` to associate the modular router with a base route prefix.
  ```javascript
  const userRouter = require('./routes/users');
  app.use('/users', userRouter);
  ```

### Q24: What is a template engine and how do you configure one?
* **Definition:** An engine that compiles static HTML files using server-side variables (e.g., EJS, Pug, Handlebars).
* **Configuration:**
  ```javascript
  app.set('view engine', 'ejs');
  ```

### Q25: Explain the settings `'views'` and `'view engine'`.
* **`'views'`:** The directory path configuration where template files are stored (defaults to `/views`).
* **`'view engine'`:** The target template file extension type being compiled (e.g., `'pug'`, `'ejs'`).

### Q26: What is the role of the `cors` middleware?
* **Purpose:** Enables cross-origin requests by appending the necessary `Access-Control-Allow-*` HTTP response headers to bypass browser security policies.

### Q27: How do you manage cookies in Express?
* **Middleware:** Use the third-party `cookie-parser` middleware to read incoming cookies on `req.cookies`.

### Q28: How do you write or clear a cookie in Express?
* **Write:** `res.cookie('name', 'value', { options })`.
* **Clear:** `res.clearCookie('name')`.

### Q29: What is the purpose of `app.set()` and `app.get()` application settings?
* **`app.set(name, value)`:** Stores configuration metadata values globally inside the Express application environment.
* **`app.get(name)`:** Retrieves the stored application value.

### Q30: How do you enable Gzip compression in Express?
* **Middleware:** Import the `compression` module and add it to the global middleware chain.
  ```javascript
  const compression = require('compression');
  app.use(compression());
  ```

### Q31: What is Morgan and why is it used?
* **Definition:** A standard HTTP request logger middleware. It automatically intercepts requests and outputs performance statistics (method, code, latency) to the console for monitoring.

### Q32: How do you handle multipart/form-data file uploads in Express?
* **Middleware:** Utilize file-handling middleware packages like `multer` to capture file buffers or save incoming binary fields straight to directories.

### Q33: Contrast application-level and router-level middleware.
* **Application-level:** Bound to the global `app` instance (e.g., `app.use()`). Applied globally across all incoming request routes.
* **Router-level:** Bound to specific `express.Router()` instances. Only executes on paths defined under that modular router scope.

### Q34: How do you send standard static files to clients?
* **Method:** Use `res.sendFile(absolutePath)`. This reads the file from disk and streams it back to the client directly with matching content headers.

### Q35: What is the purpose of the `dotenv` package?
* **Description:** Loads environmental variables from a local `.env` configuration file into `process.env` before launching server routes, keeping API secrets secure and out of version control.

### Q36: How does route nesting work in Express?
* **Mechanism:** Routers can be mounted inside other routers to form nested API endpoints.
* **Example:** `userRouter.use('/:userId/posts', postRouter)`.

### Q37: How do you implement global fallback route logging?
* **Implementation:** Place a generic logging middleware at the top of your `app.js` file before defining any route verbs.

### Q38: How do you handle 404 (Not Found) errors in Express?
* **Solution:** Insert a fallback route/middleware *after* all defined endpoints. If no route matches, execution will drop to this handler.
  ```javascript
  app.use((req, res, next) => {
    res.status(404).send('Not Found');
  });
  ```

### Q39: What is the role of `express-validator`?
* **Description:** A library of validation middleware utilizing the validation library `validator.js`. It validates and sanitizes incoming request query, parameter, or body properties before route callbacks.

### Q40: How does `helmet` secure Express?
* **Mechanism:** It sets various critical HTTP headers (e.g., `X-Content-Type-Options`, `X-Frame-Options`, `Content-Security-Policy`) to safeguard apps against common vulnerabilities like XSS, Clickjacking, and packet sniffing.

### Q41: Explain `express-rate-limit`.
* **Purpose:** A middleware used to limit repeated requests from public IPs to API endpoints, defending your server against brute-force or denial of service attempts.

### Q42: What is dynamic routing in Express?
* **Definition:** Routes containing variables (parameters prefixed with a colon `:`). This allows a single route declaration to handle many dynamic URLs (e.g., `/products/1`, `/products/2`).

### Q43: What is the execution order of multiple middleware?
* **Rule:** Middleware functions are executed sequentially in the *exact order* they are registered/mounted inside the code (top-to-bottom).

---

### Q44: What is `res.locals` used for?
* An object scoped to the request-response cycle — a scratchpad for middleware to pass data downstream (template rendering variables, resolved user, request metadata) without touching `app.locals` (global) or attaching to `req`.
* Typical flow: `authMiddleware` sets `res.locals.user = decoded`; later handlers/templates read it. Render engines merge `res.locals` automatically into view contexts.
* Lifetime: recreated per request; never persists across requests — safe for per-request secrets unlike `app.locals`.
* Convention note: prefer `req` for *input* context and `res.locals` for *output/render* context; teams pick one and lint it.

### Q45: What does `router.route()` chaining give you?
* Fluent composition applying shared behavior to one path across verbs:
```js
router.route('/users/:id')
  .get(getUser)
  .patch(patchUser)
  .delete(deleteUser);
```
* Guarantees consistent path/middleware base across handlers; `.all()` attaches method-agnostic middleware (loading the user once for all verbs).
* Cleaner than repeating `router.get('/users/:id')`, `router.patch('/users/:id')`... and centralizes param middleware via `router.param('id', loadUser)`.
* Interview angle: mention it pairs with validation chains (validate once per resource) reducing duplicated middleware arrays.

### Q46: Which `req` properties describe the client connection?
* `req.ip` — client address honoring `trust proxy`; `req.ips` — full forwarded chain when trust proxy is set.
* `req.hostname` / `req.protocol` — host and http/https (X-Forwarded-Host/Proto respected under trust proxy); `req.secure` shorthand.
* `req.xhr` — legacy jQuery-era AJAX flag (mostly historical); `req.originalUrl` vs `req.url` — full path vs router-relative remainder (critical inside mounted routers).
* Basic-level expectation: know that behind load balancers raw socket IP is the proxy's, motivating the proxy settings covered at hard level.

### Q47: What route path patterns does Express support?
* Static paths (`/health`), named params (`/users/:id` → `req.params.id`), optional segments (`/:lang?`), zero-or-more (`/files/*` classic; v5 syntax differs!), regex constraints inline (`/:id(\\d+)`) or via param callbacks.
* Express 4 uses path-to-regexp v0.x semantics — `*` is a catch-all; **Express 5** adopts path-to-regexp v8 where `*` must be named (`/*splat`) and some regex syntax moved to explicit middlewares — migration questions are increasingly common.
* Matching is prefix-based for mounted routers: `app.use('/api', apiRouter)` strips `/api` from child matching.
* Gotcha: query strings are NOT part of path matching.

### Q48: How do you serve an SPA with client-side routing from Express?
```js
app.use(express.static('dist'));
app.get(/^(?!\/api).*/ , (req,res) => res.sendFile(path.join(__dirname,'dist','index.html')));
```
* Static middleware serves hashed assets; a fallback returns `index.html` for every non-API GET so routes like `/dashboard/42` work on hard refresh/deep links (HTML5 history API).
* Placement matters: API routes first, static second, fallback LAST; exclude `/api` explicitly or API misses become HTML 200s breaking clients.
* Production notes: set long-lived immutable cache headers for `/assets/*` but no-cache for index.html so deploys propagate; 404 within SPA handled client-side.

### Q49: What do redirect status codes 301/302/307/308 mean?
* **301 Moved Permanently**: cacheable, clients/search engines update; browsers often rewrite method to GET (legacy quirk).
* **302 Found**: temporary, not cached; same method-rewrite hazard.
* **307 Temporary Redirect**: temporary AND preserves method/body strictly.
* **308 Permanent Redirect**: permanent AND method-preserving.
* Express default `res.redirect('/x')` = 302; pass status explicitly (`res.redirect(301, '/new')`). Rule of thumb: API moves → 308; marketing URL changes → 301; auth bounce flows → 302/307 depending on method fidelity.

### Q50: Categorize HTTP status codes every Express dev should know.
* **2xx Success**: 200 OK, 201 Created (POST returning resource + Location header), 204 No Content (successful DELETE).
* **3xx Redirection**: 301/302/307/308 above; 304 Not Modified (ETag/If-None-Match flows).
* **4xx Client errors**: 400 malformed input, 401 unauthenticated vs 403 authenticated-but-forbidden, 404 missing route/resource, 409 conflict (duplicate), 422 semantic validation failure, 429 rate-limited (+ Retry-After).
* **5xx Server errors**: 500 unhandled, 502 bad gateway (upstream), 503 unavailable (maintenance/shedding + Retry-After), 504 gateway timeout.
* Precision here signals API maturity — e.g., choosing 409 over 400 for idempotency conflicts.

---

## Coding & Implementation Challenges

### Q51: Implement an Express server with CRUD endpoints for task management.
* **Objective:** Create standard task model endpoints (GET, POST, PUT, DELETE) managing an in-memory array.

```javascript
const express = require('express');
const app = express();
app.use(express.json());

let tasks = [{ id: 1, title: 'Learn Node' }];

// Read
app.get('/tasks', (req, res) => res.json(tasks));

// Create
app.post('/tasks', (req, res) => {
  const newTask = { id: Date.now(), title: req.body.title };
  tasks.push(newTask);
  res.status(201).json(newTask);
});

// Update
app.put('/tasks/:id', (req, res) => {
  const task = tasks.find(t => t.id === parseInt(req.params.id));
  if (!task) return res.status(404).send('Task not found');
  task.title = req.body.title;
  res.json(task);
});

// Delete
app.delete('/tasks/:id', (req, res) => {
  tasks = tasks.filter(t => t.id !== parseInt(req.params.id));
  res.status(204).end();
});

app.listen(3000);
```

### Q52: Create a custom logging middleware.
* **Objective:** Print the HTTP method, URL, and time taken for each request in milliseconds.

```javascript
const express = require('express');
const app = express();

function customLogger(req, res, next) {
  const start = process.hrtime();
  
  res.on('finish', () => {
    const diff = process.hrtime(start);
    const timeInMs = (diff[0] * 1e3 + diff[1] / 1e6).toFixed(2);
    console.log(`[${req.method}] ${req.url} - Status: ${res.statusCode} - ${timeInMs}ms`);
  });

  next();
}

app.use(customLogger);
app.get('/test', (req, res) => res.send('Logged!'));
app.listen(3000);
```

### Q53: Implement an error-handling middleware.
* **Objective:** Capture syntax or application errors and return a clean, structured JSON response.

```javascript
const express = require('express');
const app = express();

// Route that intentionally throws
app.get('/crash', (req, res) => {
  throw new Error('Something went wrong internally!');
});

// Error-handling middleware (must be registered last)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: true,
    message: err.message || 'Internal Server Error'
  });
});

app.listen(3000);
```

### Q54: Implement a route-level verification middleware.
* **Objective:** Block requests and return a 401 response if a valid `X-API-Key` is missing from headers.

```javascript
const express = require('express');
const app = express();

function apiKeyGuard(req, res, next) {
  const key = req.headers['x-api-key'];
  if (key && key === 'super-secret-key') {
    next(); // Valid - proceed to route
  } else {
    res.status(401).json({ error: 'Unauthorized: Invalid API Key' });
  }
}

// Apply guard selectively to protected route
app.get('/secure-data', apiKeyGuard, (req, res) => {
  res.json({ secret: 'The nuclear codes are 0000.' });
});

app.get('/public-data', (req, res) => {
  res.json({ status: 'Publicly readable data.' });
});

app.listen(3000);
```

### Q55: Implement static file serving with custom cache headers.
* **Objective:** Serve a public directory and configure maximum age cache properties for resources.

```javascript
const express = require('express');
const path = require('path');
const app = express();

const staticOptions = {
  maxAge: '1d', // Cache files for 1 day (headers automatically set)
  setHeaders: (res, path, stat) => {
    res.set('X-Custom-Static-Header', 'Served-By-Express');
  }
};

app.use('/static', express.static(path.join(__dirname, 'public'), staticOptions));
app.listen(3000);
```

### Q56: Implement simple JSON schema request body validation.
* **Objective:** Manually validate POST bodies for registering users without external libraries.

```javascript
const express = require('express');
const app = express();
app.use(express.json());

function validateUserSchema(req, res, next) {
  const { email, password } = req.body;
  
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Missing or invalid email' });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }
  
  next();
}

app.post('/register', validateUserSchema, (req, res) => {
  res.status(201).json({ success: true, message: 'User registered.' });
});

app.listen(3000);
```

### Q57: Implement modular Express routing.
* **Objective:** Structure an application cleanly using dynamic routers.

```javascript
const express = require('express');
const app = express();

// Define Users Router
const usersRouter = express.Router();
usersRouter.get('/', (req, res) => res.send('Get all users'));
usersRouter.get('/:id', (req, res) => res.send(`Get user ${req.params.id}`));

// Define Posts Router
const postsRouter = express.Router();
postsRouter.get('/', (req, res) => res.send('Get all posts'));

// Mount Routers
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/posts', postsRouter);

app.listen(3000);
```
