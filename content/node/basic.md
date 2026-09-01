# Node.js - Basic Interview Questions

## Theory Questions & Answers

### Q1: What is Node.js and what is its primary use case?
* **Definition:** Node.js is an open-source, cross-platform JavaScript runtime environment built on Google Chrome's **V8 engine**.
* **Primary Use Case:** Building fast, scalable network applications, real-time communication tools (WebSockets, chat), REST APIs, and microservices.
* **Architecture:** Uses a **single-threaded**, **event-driven**, and **non-blocking I/O** model to achieve high concurrency without the overhead of thread context-switching.

### Q2: How does Node.js handle concurrency if it runs on a single thread?
* **Single Thread:** JavaScript code executes on a single main thread (the call stack).
* **Asynchronous Delegation:** When an asynchronous, blocking operation (e.g., file system access, network requests, database queries) is encountered, Node.js delegates it to the **OS kernel** or the **Libuv thread pool**.
* **Callbacks/Events:** Once the delegated operation completes, the result is queued as a callback in the Event Loop, which executes it when the call stack becomes empty.

### Q3: What is the V8 engine and how does Node.js leverage it?
* **Definition:** V8 is Google's high-performance, open-source JavaScript engine written in C++.
* **JIT Compilation:** V8 compiles JavaScript directly to native machine code before executing it, bypassing intermediate bytecode interpretation.
* **Role in Node:** V8 manages memory allocation, provides call stack execution, and performs garbage collection. Node.js adds binding APIs (C++ bindings) to allow JavaScript to interact with OS-level components like files and networks.

### Q4: What is Libuv and why is it crucial to Node.js?
* **Definition:** Libuv is a multi-platform support library written in C, specifically designed for Node.js to handle asynchronous I/O.
* **Core Responsibilities:**
  * Implements the **Event Loop**.
  * Manages the internal **Thread Pool** (usually 4 threads by default) for blocking tasks.
  * Abstracts OS-specific asynchronous mechanisms like `epoll` (Linux), `kqueue` (macOS), and `IOCP` (Windows).

### Q5: What is the Event Loop in Node.js?
* **Purpose:** The event loop is the mechanism that allows Node.js to perform non-blocking I/O operations despite being single-threaded.
* **Mechanism:** It continuously polls the operating system and task queues, pushing completed asynchronous callbacks onto the call stack for execution.
* **Loop Cycle:** If there are no active connections, timers, or pending operations, the event loop terminates.

### Q6: Explain the main phases of the Libuv Event Loop.
* **Timers:** Executes callbacks scheduled by `setTimeout()` and `setInterval()`.
* **Pending Callbacks:** Executes I/O callbacks deferred to the next loop iteration (e.g., system errors like TCP connection refused).
* **Idle, Prepare:** Used internally by Libuv for system optimization.
* **Poll:** Retrieves new I/O events. Executes almost all I/O-related callbacks (excluding timers, close callbacks, and `setImmediate()`).
* **Check:** Executes callbacks registered via `setImmediate()`.
* **Close Callbacks:** Executes close event callbacks (e.g., `socket.on('close', ...)`).

### Q7: Compare `process.nextTick()`, `setImmediate()`, and `setTimeout(fn, 0)`.
* **`process.nextTick()`:** Executes immediately after the current operation finishes, *before* the event loop moves to the next phase. It can starve the event loop if called recursively.
* **`setImmediate()`:** Designed to execute in the **Check** phase of the event loop, immediately after the **Poll** phase completes.
* **`setTimeout(fn, 0)`:** Schedules a callback to run in the **Timers** phase after a minimum threshold of 1 millisecond has elapsed.

### Q8: What is the Node.js Thread Pool and how is its size controlled?
* **Definition:** A pool of background threads managed by Libuv used for blocking operations that cannot be handled asynchronously by the OS kernel.
* **Tasks handled:** File system (`fs`), cryptography (`crypto`), compression (`zlib`), and DNS lookups (`dns.lookup`).
* **Configuration:** Controlled by setting the `UV_THREADPOOL_SIZE` environment variable (default is 4, max is 1024) before launching the process:
  ```bash
  UV_THREADPOOL_SIZE=8 node app.js
  ```

### Q9: What is the difference between synchronous (blocking) and asynchronous (non-blocking) I/O?
* **Synchronous:** Blocks the execution of subsequent code until the operation finishes (e.g., `fs.readFileSync`). The thread remains idle and wasted during this period.
* **Asynchronous:** Initiates the operation and registers a callback, immediately returning control to the main execution thread (e.g., `fs.readFile`). This prevents CPU starvation.

### Q10: What are EventEmitters in Node.js?
* **Definition:** A core class from the `events` module that implements the **Observer design pattern**.
* **Usage:** Allows objects to emit named events that trigger registered listener functions synchronously.
* **Methods:**
  * `.on(event, listener)`: Registers a listener for an event.
  * `.emit(event, ...args)`: Triggers all registered listeners for that event with optional arguments.
  * `.once(event, listener)`: Registers a listener that executes once and is then removed.

### Q11: What is the difference between `__dirname` and `process.cwd()`?
* **`__dirname`:** An environment variable representing the absolute directory path of the *currently executing file*. It is static and tied to the file location.
* **`process.cwd()`:** A method that returns the absolute directory path from which the *Node.js process was initiated*. It is dynamic and depends on where you ran the terminal command.

### Q12: Explain the differences between CommonJS and ES Modules (ESM).
* **CommonJS (CJS):** Uses `require()` and `module.exports`. Synchronous resolution. Available by default in `.js` files. Has access to `__dirname` and `__filename`.
* **ES Modules (ESM):** Uses `import` and `export`. Asynchronous static analysis. Enabled via `"type": "module"` in `package.json` or `.mjs` files. No access to `__dirname` (must use `import.meta.url`).

### Q13: What is the purpose of `package-lock.json`?
* **Dependency Locking:** Locks the exact version of every package and its nested dependencies installed in `node_modules`.
* **Reproducibility:** Ensures that installations across different machines (development, production, CI/CD) are identical.
* **Speed:** Speeds up installation times by skipping package dependency resolution.

### Q14: Explain Semantic Versioning (SemVer) with caret (`^`) and tilde (`~`).
* **Format:** `MAJOR.MINOR.PATCH` (e.g., `1.2.3`).
* **Caret (`^`)**: Allows compatible updates. Installs minor and patch updates (e.g., `^1.2.3` matches `>=1.2.3 <2.0.0`).
* **Tilde (`~`)**: Allows patch updates only (e.g., `~1.2.3` matches `>=1.2.3 <1.3.0`).
* **Exact (`1.2.3`)**: Restricts installation to that exact version.

### Q15: What are peer dependencies in `package.json`?
* **Definition:** Dependencies that your package requires, but expects the *consuming application* to install rather than installing it itself.
* **Common Use Case:** Plugins for major libraries (e.g., a React component package listing `react` as a peer dependency to avoid installing multiple versions of React).

### Q16: How do you handle asynchronous errors in callbacks (Node.js style)?
* **Error-First Callback Pattern:** By convention, the first argument of the callback function is reserved for the error object, and the second is for the result data.
* **Example:**
  ```javascript
  fs.readFile('file.txt', (err, data) => {
    if (err) {
      console.error('Failed to read file:', err);
      return;
    }
    console.log(data);
  });
  ```

### Q17: What is the purpose of `util.promisify()`?
* **Definition:** A utility function that takes a standard error-first callback-style function and returns a Promise-wrapped version.
* **Benefit:** Allows old callback-based legacy APIs to work with modern `async/await` syntax.
* **Example:**
  ```javascript
  const fs = require('fs');
  const util = require('util');
  const readFilePromise = util.promisify(fs.readFile);
  ```

### Q18: What are Streams in Node.js, and why are they used?
* **Definition:** Collections of data that might not be available all at once or are too large to fit in memory.
* **Benefits:** Low memory consumption (chunks are processed sequentially instead of loading the entire file into RAM) and high time-efficiency.
* **Types:** Readable, Writable, Duplex (both read/write), and Transform (modifies data as it is read/written).

### Q19: Explain stream piping via `.pipe()`.
* **Mechanism:** Connects a Readable stream's output directly to a Writable stream's input.
* **Usage:** `readableStream.pipe(writableStream)`.
* **Benefit:** Handles **backpressure** automatically, meaning it pauses reading if the destination writable stream is overwhelmed and cannot keep up with writing.

### Q20: What is Backpressure in streams?
* **Definition:** A phenomenon where a data-producing stream (Readable) outputs data faster than the data-consuming stream (Writable) can process and write it.
* **Consequence:** Leads to memory accumulation in the internal buffer, potentially crashing the application.
* **Solution:** The writable stream emits a `false` signal when its buffer is full, signaling the readable stream to pause until the `drain` event is emitted.

### Q21: What are Buffers in Node.js?
* **Definition:** The `Buffer` class represents a fixed-size chunk of raw binary memory allocated outside the V8 heap.
* **Purpose:** Enables Node.js to handle binary data from streams, file system files, and network sockets, which JavaScript historically could not do.

### Q22: What is the difference between `Buffer.alloc()` and `Buffer.allocUnsafe()`?
* **`Buffer.alloc(size)`:** Allocates a new buffer of specified size and initializes (zero-fills) its memory. It is safe but slower.
* **`Buffer.allocUnsafe(size)`:** Allocates a new buffer without initializing memory. It is extremely fast but can contain sensitive leftover data from old allocations, presenting a security risk if exposed.

### Q23: How do you convert a Buffer back to a string?
* **Method:** Use `.toString(encoding)` on the buffer instance.
* **Default Encoding:** UTF-8.
* **Example:**
  ```javascript
  const buf = Buffer.from([0x48, 0x65, 0x6c, 0x6c, 0x6f]);
  console.log(buf.toString('utf8')); // Outputs: "Hello"
  ```

### Q24: What is the purpose of the `path` module?
* **Description:** A built-in module used for resolving and formatting file and directory paths.
* **`path.join()`:** Concatenates path segments together using the platform-specific separator (`\` or `/`) and normalizes the resulting path.
* **`path.resolve()`:** Resolves a sequence of paths into an *absolute* path, starting from the current working directory.

### Q25: Explain the difference between `fs.readFile()` and `fs.readFileSync()`.
* **`fs.readFile()`:** Asynchronous and non-blocking. It schedules the read operation on the thread pool and triggers a callback upon completion, leaving the main thread free.
* **`fs.readFileSync()`:** Synchronous and blocking. It halts the entire main call stack until the file is fully read. Never use it in production request handlers.

### Q26: What is the `process` object in Node.js?
* **Definition:** A global object that provides information and control over the currently running Node.js process.
* **Useful Properties:**
  * `process.env`: Contains user environment variables.
  * `process.argv`: Contains command-line arguments.
  * `process.pid`: The Process ID of the application.
  * `process.exit(code)`: Terminates the process with an exit code (0 for success, non-zero for error).

### Q27: How do you handle uncaught exceptions in Node.js?
* **Mechanism:** Listen to the `'uncaughtException'` event on the `process` object.
* **Rule:** You must clean up resources (close database connections, log errors) and call `process.exit(1)` because the process is left in an undefined/unstable state.
* **Example:**
  ```javascript
  process.on('uncaughtException', (err) => {
    console.error('System crashed:', err);
    process.exit(1);
  });
  ```

### Q28: How do you handle unhandled promise rejections?
* **Mechanism:** Listen to the `'unhandledRejection'` event on the `process` object.
* **Modern Node.js:** By default, modern Node.js versions will terminate the process with a non-zero exit code if a promise rejection is not caught.
* **Example:**
  ```javascript
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });
  ```

### Q29: What is the global object in Node.js and how does it compare to browsers?
* **Node.js:** The global context object is named `global` (and aliased as `globalThis`).
* **Browsers:** The global context object is `window` or `self`.
* **Scope difference:** Variables declared in the top level of a Node.js file are scoped to that file/module, not added to the `global` object, unlike browsers where top-level `var` statements are appended to `window`.

### Q30: What is REPL in Node.js?
* **Definition:** Read-Eval-Print-Loop.
* **Function:** A command-line interactive shell environment that reads input JavaScript code, evaluates it, prints the result, and loops back to wait for more input. Accessible by running `node` in your terminal without any file arguments.

### Q31: What is a memory leak in Node.js and what are common causes?
* **Definition:** A failure to release allocated memory that is no longer needed, causing the application to consume more RAM over time until it crashes (Out of Memory).
* **Common Causes:**
  * Unreleased global variables.
  * Unclosed stream subscriptions or EventEmitters.
  * Closures retaining references to outer scopes.
  * Timers/intervals (`setInterval`) that are never cleared.

### Q32: What is the role of the `os` module?
* **Description:** A built-in module providing utility methods to retrieve operating system level metrics.
* **Examples:**
  * `os.cpus()`: Returns information about each logical CPU core.
  * `os.totalmem()`: Returns total system memory in bytes.
  * `os.freemem()`: Returns free system memory.
  * `os.homedir()`: Returns the current user's home directory.

### Q33: How does the `dns` module handle name resolution?
* **Methods:**
  * `dns.lookup()`: Uses the underlying operating system's resolution mechanism (e.g., `/etc/hosts` or `getaddrinfo`). It is **synchronous** and blocks a thread in the Libuv thread pool.
  * `dns.resolve()`: Performs network DNS queries directly using the network. It is fully **asynchronous** and does not block the Libuv thread pool.

### Q34: How do you read environment variables in Node.js?
* **Mechanism:** Access properties on the `process.env` object.
* **Usage:**
  ```javascript
  const PORT = process.env.PORT || 3000;
  ```
* **Tip:** Commonly populated from a `.env` file using modules like `dotenv`.

### Q35: What is the purpose of the `url` module?
* **Purpose:** For parsing, formatting, and resolving URL strings.
* **Modern API:** Use the WHATWG standard global `URL` class.
* **Example:**
  ```javascript
  const myUrl = new URL('https://example.com:8000/path?id=100');
  console.log(myUrl.hostname); // "example.com"
  console.log(myUrl.searchParams.get('id')); // "100"
  ```

### Q36: What are development dependencies (`devDependencies`)?
* **Definition:** Packages needed only during local development and testing (e.g., linters like `ESLint`, test frameworks like `Jest`, and compilers like `Babel`).
* **Installation:** Saved with the `--save-dev` or `-D` flag. They are omitted in production environments when using `npm install --production`.

### Q37: What is the difference between local and global package installations in npm?
* **Local:** Installed inside the project's `node_modules` folder. Accessible only within that project.
* **Global:** Installed in a single system-wide directory. Typically used for CLI tools (e.g., `nodemon`, `npm-check-updates`) and invoked directly from the command line.

### Q38: What are npm scripts?
* **Definition:** Custom shortcut commands defined in the `"scripts"` object of `package.json`.
* **Benefit:** Abstracts away complex commands and ensures consistent tasks among developers.
* **Execution:** Run via `npm run <script-name>` (or shortcuts like `npm start` and `npm test`).

### Q39: What is the purpose of the `http` module in Node.js?
* **Purpose:** A low-level built-in API designed to create HTTP servers and client-side agents.
* **Example:** Supports parsing request headers, handling payloads, and sending raw chunked responses.

### Q40: What is callback hell and how is it resolved?
* **Definition:** A phenomenon where multiple nested callbacks make code unreadable, unmaintainable, and hard to handle errors in (often called the Pyramids of Doom).
* **Solutions:**
  * Modularizing code into flat, named functions.
  * Wrapping APIs in Promises.
  * Utilizing `async/await` syntax.

### Q41: Explain how garbage collection works in V8.
* **Generational Hypothesis:** V8 divides memory into two generations: **Young Generation** (short-lived objects, collected frequently via Scavenger algorithm) and **Old Generation** (long-lived objects, collected using Mark-Sweep-Compact algorithm).
* **Triggers:** Automatically runs when V8 determines that the allocated heap memory is reaching capacity.

### Q42: What is the purpose of the `util` module?
* **Purpose:** Provides a set of helper functions designed for debugging, formatting, and inspecting objects.
* **Useful methods:**
  * `util.inspect(object)`: Converts an object into a deeply formatted string (useful for debugging deep objects).
  * `util.promisify()`: Converts callbacks to promises.
  * `util.types`: Type-checking helpers.

### Q43: Why is it bad practice to block the Event Loop?
* **Monopolizing the Thread:** Since Node.js is single-threaded, if a synchronous compute-intensive task (e.g., parsing a 50MB JSON file or calculating prime numbers) runs on the call stack, no other callbacks can run.
* **Consequence:** All other concurrent clients will experience timeouts or severe latency since the server cannot respond or accept connections during the blockage.

---

### Q44: npm vs npx - what is the difference?
* **npm** installs/manages packages and runs scripts defined in package.json (`npm run dev`, `npm i -D jest`).
* **npx** executes a package binary without requiring a global install - it checks local `node_modules/.bin` first, then fetches temporarily (`npx create-next-app@latest`).
* Value: running one-off CLIs (generators, formatters) without polluting global scope, and always executing the project-local version of a tool (avoids version drift between global and local installs).
* Security note: blindly npx-ing unfamiliar packages executes arbitrary code - pin versions for anything sensitive.

### Q45: What are Node.js core modules? Name the most used ones.
* Modules compiled into Node itself - no install needed, imported by bare name (`require('fs')`). They win over npm packages of the same name unless prefixed (`node:fs` explicitly guarantees the builtin).
* Everyday essentials: **fs** (filesystem), **path**, **http/https**, **crypto**, **os**, **url**, **util**, **events**, **stream**, **zlib**, **child_process**, **dns**, **net**, **assert**, **buffer**.
* Modern additions worth naming: **fetch/AbortController (globals via undici)**, **node:test** runner, **worker_threads**, **diagnostics_channel**, **readline/promises**.

### Q46: How do setTimeout/setInterval work in Node, and what do .unref()/.ref() do?
* Timers schedule callbacks onto the event loop's *timers phase*, executed after their delay - subject to queue congestion (delays stretch under load; they are minimums, not guarantees).
* `setInterval` re-queues each tick; long-running handlers cause overlap drift - self-scheduling `setTimeout` chains give cleaner pacing.
* `.unref()` detaches a timer from keeping the event loop alive: an app whose only pending handle is an unref'd timer will exit - perfect for keepalive pings or cleanup sweeps in short-lived scripts. `.ref()` reverses it.
* Clearing: `clearTimeout/clearInterval` cancel pending ticks (interval handles change identity after first fire in some engines).

### Q47: What are the classic JSON.parse/stringify pitfalls?
* **Circular structures** throw `TypeError: Converting circular structure to JSON` - need replacer with WeakSet tracking or libraries (flatted).
* **Lossy round-trips**: undefined functions/values dropped from objects (nullified in arrays), Dates become ISO strings, Maps/Sets → `{}`, BigInt throws, -0→0, NaN/Infinity → null.
* **Prototype pollution on parse**: `"__proto__"` keys revive as own properties (mitigate with reviver filters or hardened parsers).
* Performance: stringify dominates CPU profiles for large payloads - streaming serializers exist; also `JSON.parse` of untrusted data is a DoS vector (deep nesting bombs).

### Q48: What is the difference between stdout and stderr in Node?
* `console.log` writes to **stdout** (fd 1); `console.error/warn` write to **stderr** (fd 2) - separate streams shell pipelines can split: `node app.js > out.log 2> err.log`.
* Both are synchronous when pointing at files/TTYs on POSIX (and pipes on Windows) but **asynchronous** when piped on POSIX - huge synchronous writes can interleave oddly under load.
* Custom tooling should route diagnostics/errors to stderr so machine-readable output on stdout stays clean (`jq`-able).
* Related: `process.stdout.isTTY` detects terminal vs pipe, enabling color decisions; writing after process exit throws EPIPE.

### Q49: How do you terminate a Node process properly? Explain exit codes.
* Natural exit: event loop empties. Forced: `process.exit(code)` truncates pending async writes (stdout may lose logs) - prefer setting `process.exitCode = N` and letting the loop drain.
* Conventional codes: 0 success; 1 general failure; others app-defined (npm treats non-zero as script failure).
* Signals: SIGINT (Ctrl+C), SIGTERM (docker/k8s stop) trigger handlers - start graceful shutdown there, then exit deliberately; unhandled fatal states (`uncaughtException`) should log + exit nonzero rather than limp along.
* `--exit-unhandled-rejections=throw`-era defaults made rejection crashes consistent; know your runtime's flag defaults when auditing behavior.

### Q50: What is dotenv and how should configuration be layered?
* `dotenv` loads `.env` key/values into `process.env` at boot (never commit real secrets; commit `.env.example`).
* Layering best practice: defaults in code ← environment-specific `.env.<NODE_ENV>` ← process env injected by the platform (CI/containers) - later sources override earlier (`dotenv` supports `override` option).
* Validation step: schema-check required vars at startup (zod/joi/env-schema) so missing config fails fast with a clear message instead of undefined-variable bugs at 3am.
* Beyond dotenv: platform secret managers (AWS SSM/Secrets Manager, Vault) with SDK retrieval avoid secrets-on-disk entirely; watch for `NODE_ENV` misuse as feature flag (use explicit flags).

---

## Coding & Implementation Challenges

### Q51: Implement a basic HTTP server that responds with JSON data.
* **Objective:** Create a lightweight web server from scratch using only the built-in `http` module. It must return a JSON response with status code 200, or a 404 error page for other routes.

```javascript
const http = require('http');

const PORT = 3000;

const server = http.createServer((req, res) => {
  // Set JSON headers
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'GET' && req.url === '/api/health') {
    res.writeHead(200);
    res.end(JSON.stringify({ status: 'UP', timestamp: new Date().toISOString() }));
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Route not found' }));
  }
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
```

### Q52: Implement a custom file copying utility using streams.
* **Objective:** Copy a file efficiently from a source to a destination using streams. Do not load the entire file into memory. Log progress chunks.

```javascript
const fs = require('fs');
const path = require('path');

function copyFileWithStreams(src, dest) {
  const readStream = fs.createReadStream(src);
  const writeStream = fs.createWriteStream(dest);

  let totalBytes = 0;

  readStream.on('data', (chunk) => {
    totalBytes += chunk.length;
    console.log(`Copied chunk: ${chunk.length} bytes (Total so far: ${totalBytes} bytes)`);
  });

  readStream.on('error', (err) => console.error('Read error:', err.message));
  writeStream.on('error', (err) => console.error('Write error:', err.message));

  readStream.pipe(writeStream);

  writeStream.on('finish', () => {
    console.log(`Finished copying file from ${src} to ${dest}. Total size: ${totalBytes} bytes`);
  });
}

// Example usage
const srcPath = path.join(__dirname, 'source.txt');
const destPath = path.join(__dirname, 'destination.txt');
fs.writeFileSync(srcPath, 'Lorem ipsum dolor sit amet, sample streaming content.');
copyFileWithStreams(srcPath, destPath);
```

### Q53: Implement a function that wraps a callback-based API into a Promise (without `util.promisify`).
* **Objective:** Wrap a legacy style callback function to make it fully awaitable.

```javascript
// Legacy callback-based function
function legacyGetUserData(userId, callback) {
  setTimeout(() => {
    if (!userId) {
      callback(new Error('Invalid user ID'), null);
    } else {
      callback(null, { id: userId, username: 'dev_john' });
    }
  }, 100);
}

// Promisified wrapper
function getUserDataPromise(userId) {
  return new Promise((resolve, reject) => {
    legacyGetUserData(userId, (err, data) => {
      if (err) {
        return reject(err);
      }
      resolve(data);
    });
  });
}

// Verification
(async () => {
  try {
    const user = await getUserDataPromise('1234');
    console.log('User found:', user);
    await getUserDataPromise(null); // Will throw
  } catch (error) {
    console.error('Promise rejected successfully:', error.message);
  }
})();
```

### Q54: Implement a rate-limiter callback wrapper using standard timeouts.
* **Objective:** Create a helper function that thorttles the execution rate of a target callback. It should ensure the callback runs at most once in every specified interval.

```javascript
function throttle(fn, delay) {
  let lastCall = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      fn.apply(this, args);
    } else {
      console.log('Throttled: Action ignored!');
    }
  };
}

// Verification
const logMessage = throttle((msg) => console.log(`Executed: ${msg}`), 500);

logMessage('Call 1'); // Runs
logMessage('Call 2'); // Ignored (too fast)
setTimeout(() => logMessage('Call 3'), 600); // Runs (after 500ms delay)
```

### Q55: Implement an event-driven logger using the standard `EventEmitter`.
* **Objective:** Build a custom `Logger` class extending `EventEmitter` that logs to the console and simultaneously notifies registered channels with log severity levels.

```javascript
const EventEmitter = require('events');

class Logger extends EventEmitter {
  log(level, message) {
    const payload = { level, message, timestamp: new Date().toISOString() };
    console.log(`[${payload.timestamp}] [${level.toUpperCase()}]: ${message}`);
    this.emit('log', payload);
  }
}

// Verification
const systemLogger = new Logger();

systemLogger.on('log', (data) => {
  if (data.level === 'error') {
    console.warn(`CRITICAL INCIDENT ALERT SENT TO DEV: ${data.message}`);
  }
});

systemLogger.log('info', 'System initialized successfully.');
systemLogger.log('error', 'Database connection timeout.');
```

### Q56: Implement a basic command-line tool that reads a file and counts occurrences of a specific word.
* **Objective:** Create a script accepting file path and search term arguments, handles missing inputs safely, and counts string occurrences.

```javascript
const fs = require('fs');

function countWordOccurrences(filePath, targetWord) {
  if (!filePath || !targetWord) {
    console.error('Error: Please provide <filePath> and <targetWord>');
    return;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const regex = new RegExp(`\\b${targetWord}\\b`, 'gi');
    const matches = content.match(regex);
    const count = matches ? matches.length : 0;
    console.log(`The word "${targetWord}" occurred ${count} times in ${filePath}`);
    return count;
  } catch (err) {
    console.error(`Error reading file: ${err.message}`);
  }
}

// Verification Setup
const testFile = 'words.txt';
fs.writeFileSync(testFile, 'node is awesome. Node is fast. Another framework is not node.');
countWordOccurrences(testFile, 'node'); // Output: 3
fs.unlinkSync(testFile); // Clean up
```

### Q57: Implement a simple asynchronous task runner that runs a list of tasks in sequence.
* **Objective:** Given an array of tasks (functions returning Promises), execute them sequentially (one after the other, not concurrently) and collect the results.

```javascript
async function runTasksSequentially(tasks) {
  const results = [];
  for (let i = 0; i < tasks.length; i++) {
    try {
      console.log(`Executing Task ${i + 1}...`);
      const res = await tasks[i]();
      results.push({ index: i, success: true, value: res });
    } catch (err) {
      results.push({ index: i, success: false, error: err.message });
    }
  }
  return results;
}

// Verification
const taskList = [
  () => new Promise((resolve) => setTimeout(() => resolve('Task 1 Complete'), 200)),
  () => new Promise((resolve, reject) => setTimeout(() => reject(new Error('Task 2 Failed')), 100)),
  () => new Promise((resolve) => setTimeout(() => resolve('Task 3 Complete'), 50))
];

runTasksSequentially(taskList).then((res) => {
  console.log('Sequential Run Results:', res);
});
```
