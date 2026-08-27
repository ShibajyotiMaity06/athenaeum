# Node.js - Medium Interview Questions

## Theory Questions & Answers

### Q1: Compare Node's Event-Driven architecture with standard multi-threaded architectures.
* **Multi-threaded (e.g., Tomcat/Java):** Allocates a dedicated OS thread per incoming connection. If the thread blocks on database I/O, OS context switches occur, consuming substantial memory (1MB+ per stack) and CPU cycles.
* **Event-Driven (Node.js):** Runs on a single main thread using non-blocking system calls. A single process can handle tens of thousands of idle/active connections concurrently because it only executes memory/CPU resources when events occur.

### Q2: What is the V8 engine's Heap memory structure?
* **Young Generation (New Space):** Short-lived objects. Divided into two semi-spaces: *To* and *From*. Garbage collection (GC) here is extremely fast (Scavenger).
* **Old Generation (Old Space):** Long-lived objects that survived multiple GC runs in the Young Space. Managed by *Mark-Sweep-Compact* GC algorithm.
* **Large Object Space:** Objects exceeding memory limits of other spaces.
* **Code Space:** JIT-compiled native code vectors.
* **Map Space:** Contains "hidden classes" (shapes) of objects.

### Q3: How do you configure and debug V8 heap size limits?
* **Argument:** Use `--max-old-space-size` to specify heap limit in megabytes.
* **Example:** `node --max-old-space-size=4096 app.js` (allocates 4GB instead of V8's default 1.4GB on 64-bit systems).
* **Usage:** Critical when processing large files, in-memory caches, or running on resource-constrained containers (Docker).

### Q4: Distinguish between CPU-bound and I/O-bound operations.
* **I/O-bound:** Spend most of the execution time waiting for input/output resources (network sockets, database queries, disk reads). Highly optimized in Node.js via non-blocking delegation.
* **CPU-bound:** Spend most of the time executing instructions on the processor (cryptographic hashing, video processing, heavy calculations). These block Node's single-threaded event loop.

### Q5: How do Worker Threads solve the CPU-bound task bottleneck?
* **Concept:** The `worker_threads` module allows running CPU-intensive JavaScript execution in separate OS threads.
* **Heap Structure:** Each worker has its own isolated V8 engine instance and call stack, but they can share memory directly using `SharedArrayBuffer` (unlike child processes).
* **Communication:** Workers communicate with the parent thread via message channels (`MessagePort`).

### Q6: What is the difference between Worker Threads and the Cluster module?
* **Cluster:** Spawns duplicate, isolated *processes* (multiple operating system processes) sharing the same port. Each process has its own distinct heap memory and TCP sockets. Used for horizontal scaling over multiple CPU cores.
* **Worker Threads:** Spawns multiple *threads* under a single operating system process. They share memory addresses and are ideal for offloading CPU-intensive computations inside a single server application instance.

### Q7: What are the differences between Worker Threads and Child Processes?
* **Child Processes:** Spawns completely separate processes. They are heavyweight, run independently, do not share heap space, and rely on standard OS Inter-Process Communication (IPC).
* **Worker Threads:** Lightweight components of the same process. They share the same system process environment, file descriptors, and can share memory addresses using `ArrayBuffer` directly.

### Q8: Explain the four `child_process` execution methods: `exec`, `execFile`, `spawn`, and `fork`.
* **`spawn`:** Streams command output. Ideal for handling large data flows since it works with streams and doesn't buffer data in memory.
* **`exec`:** Spawns a shell and buffers the *entire* output in memory (default 200KB limit). Best for quick, simple shell commands with small outputs.
* **`execFile`:** Similar to `exec` but executes an executable directly without spawning a shell, making it safer and slightly more performant.
* **`fork`:** A special case of `spawn` designed specifically for node files. Creates a new V8 instance and establishes a dedicated IPC channel between parent and child.

### Q9: How does Inter-Process Communication (IPC) work in Node.js?
* **Establishment:** When a child process is spawned using `fork()`, Node.js creates a duplex pipe channel (using Unix domain sockets or Windows named pipes).
* **Serialization:** Communication occurs using `.send(message)` on the process instance. Node.js automatically serializes/deserializes these payloads to and from JSON.

### Q10: How can you optimize DNS lookups in high-traffic Node.js applications?
* **Problem:** Built-in `dns.lookup` uses `getaddrinfo()` which executes synchronously on the Libuv thread pool, stalling available threads.
* **Optimization:** Use third-party packages or configure the HTTP agent to perform local caching. Alternatively, use `dns.resolve` which bypasses system configuration files to query the DNS server directly and asynchronously.

### Q11: Explain how Streams handle buffering and memory limits.
* **`highWaterMark`:** A configuration property (default 16KB for byte streams, 16 elements for object streams) that defines the internal buffer threshold.
* **Write Buffer Limit:** When `write()` returns `false`, the stream is fully buffered up to `highWaterMark`, indicating that the source should stop writing to avoid memory inflation.

### Q12: What is a Transform stream?
* **Definition:** A duplex stream where the output is computed based on some input modifications.
* **Core methods:**
  * `_transform(chunk, encoding, callback)`: Receives data, processes it, and pushes it downstream using `this.push()`.
  * `_flush(callback)`: Executed right before the stream closes, useful for writing leftover bytes.

### Q13: Explain Object-Mode streams.
* **Definition:** By default, streams only accept buffers or strings. Setting `objectMode: true` on a stream configuration allows it to push and pull arbitrary JavaScript objects.
* **Usage:** Extremely useful for ETL (Extract-Transform-Load) pipelines processing JSON records step-by-step.

### Q14: Compare standard `fs` callback modules with `fs/promises`.
* **Callbacks:** The traditional API using nested error-first callbacks. Hard to write clean code when chaining multiple operations.
* **Promises:** Leverages async/await. Returns native Promises, making code flat, highly readable, and utilizing standard `try/catch` blocks for asynchronous error handling.

### Q15: What is the purpose of the `crypto` module?
* **Description:** A built-in module that provides cryptographic functionality, including wrappers for OpenSSL's hash, HMAC, cipher, decipher, sign, and verify functions.
* **Symmetric Encryption:** Same key for encryption/decryption (e.g., AES-256).
* **Asymmetric Encryption:** Public key to encrypt, private key to decrypt (e.g., RSA).

### Q16: How do you implement secure password hashing in Node.js?
* **Standard `crypto`:** Use `crypto.pbkdf2` or `crypto.scrypt` (which is memory-hard and more resilient to GPU brute-force attacks) along with a unique **salt** per password and high iteration loops.
* **Recommended Package:** `bcrypt` or `argon2` are popular abstractions that bundle salt creation, hashing, and verification cleanly.

### Q17: What is HTTP Keep-Alive and how does Node.js handle it?
* **Keep-Alive:** Allows a single TCP connection to send and receive multiple HTTP requests/responses, avoiding connection handshake overhead.
* **Implementation:** Controlled by `http.Agent({ keepAlive: true })`. This pools TCP connections, reducing latency on outgoing request streams.

### Q18: Explain the Master-Worker communication architecture in the `cluster` module.
* **Master Process:** Does not listen on ports or handle requests directly. It spawns workers, manages their lifecycles, and accepts connections, delegating them down.
* **Worker Process:** Handles actual connection parsing and HTTP requests.
* **IPC:** Master and workers coordinate via built-in IPC channels to distribute socket descriptors.

### Q19: How does the `cluster` module load-balance incoming connections?
* **Round-Robin:** (Default on Unix-like systems) The Master process listens on the port, accepts connections, and distributes them sequentially to idle workers, avoiding CPU starvation.
* **Shared Sockets:** (Default on Windows) The Master hands over the active port socket descriptor to the worker processes, letting the OS network stack handle task distribution (which can lead to highly uneven loads).

### Q20: What is PM2 and what advantages does it offer?
* **Definition:** A production-grade process manager for Node.js.
* **Key Features:**
  * **Process Auto-Restart:** Instantly restarts processes if they crash.
  * **Cluster Mode:** Seamlessly scales the app over all available CPU cores without writing custom `cluster` code.
  * **Zero-Downtime Reload:** Restarts instances sequentially, keeping the server active.
  * **Log Management:** Combines and rotates process logs.

### Q21: How do you configure clustering using PM2?
* **Configuration:** Using an `ecosystem.config.js` file.
* **Key settings:**
  ```javascript
  module.exports = {
    apps: [{
      name: "my-app",
      script: "./server.js",
      instances: "max", // automatically spawns a worker per CPU core
      exec_mode: "cluster" // enables load balancing clustering
    }]
  }
  ```

### Q22: What is Graceful Shutdown in Node.js?
* **Definition:** A process shutdown strategy that stops accepting new requests while allowing current, outstanding active connections to finish processing before exiting the process.
* **Steps:**
  1. Catch termination signals (`SIGTERM`, `SIGINT`).
  2. Stop the HTTP server from accepting new sockets (`server.close()`).
  3. Close active database pools.
  4. Force exit after a specified timeout if connections still linger.

### Q23: How does CORS (Cross-Origin Resource Sharing) work in Node.js?
* **Definition:** A security mechanism implemented by browsers that restricts web pages from requesting resources from a different domain.
* **Implementation:** The Node.js server must reply with specific HTTP response headers, such as `Access-Control-Allow-Origin`, `Access-Control-Allow-Methods`, and `Access-Control-Allow-Headers`. It must also handle preflight `OPTIONS` requests.

### Q24: How should you securely manage and verify JWTs?
* **Signing:** Use a strong cryptographic secret or private key (`RS256`).
* **Storage:** Store on clients in secure `HttpOnly`, `SameSite=Strict` cookies to mitigate XSS (Cross-Site Scripting).
* **Expiration:** Set brief lifetimes for access tokens and use rotating, long-lived refresh tokens stored in database session records.

### Q25: Compare Symmetric and Asymmetric encryption in Node.
* **Symmetric (AES):** Faster execution. Requires both sender and receiver to share the same secret key securely.
* **Asymmetric (RSA):** Slower. Uses a public key to encrypt and a private key to decrypt. Perfect for systems where keys must be public (like JWT signature verification via JWKS).

### Q26: Explain the utility of the `zlib` module.
* **Description:** Provides compression functionality utilizing Gzip, Deflate, or Brotli.
* **Best Practice:** Pipe stream read buffers through `zlib.createGzip()` before piping them to the client response. This dramatically reduces network payload size.

### Q27: How does `path.resolve()` differ from `path.join()` when handling root slash directories?
* **`path.join('a', '/b')`:** Simply joins the strings together, outputting `a/b`.
* **`path.resolve('a', '/b')`:** Sees the leading `/` as an absolute path root, meaning it throws away `'a'` and resolves from the drive root, outputting `/b` (or `C:\b` on Windows).

### Q28: How do event listeners cause memory leaks?
* **Problem:** If you register listener callbacks on global emitters or long-lived objects (e.g., `process.on('message')`), the memory associated with the listener and its closure environment can never be garbage collected.
* **Fix:** Use `.once()` for singular triggers, or explicitly call `.off(event, listener)` when destroying or cleaning up short-lived objects.

### Q29: Distinguish between Promise combinators: `all`, `allSettled`, `race`, and `any`.
* **`Promise.all`:** Resolves when all promises resolve. Rejects immediately if *any* promise rejects.
* **`Promise.allSettled`:** Resolves when all promises have finalized (either resolved or rejected). Never rejects.
* **`Promise.race`:** Resolves or rejects as soon as *one* of the promises settles.
* **`Promise.any`:** Resolves as soon as any *one* promise resolves. Rejects only if *all* promises fail.

### Q30: What is the purpose of `util.deprecate()`?
* **Definition:** Wraps a function and marks it as deprecated.
* **Execution:** When the wrapped function is called, Node.js outputs a warning trace to `process.stderr` once, notifying the developers to update the API without breaking existing client consumption.

### Q31: How do you run tests using the built-in `node:test` runner?
* **Usage:** Introduced natively in Node.js 18+. Import `test` from `'node:test'` and `assert` from `'node:assert'`.
* **Execution:** Run `node --test` to automatically execute all matching pattern files like `test.js` or `*.test.js`.

### Q32: Explain Mocks, Stubs, and Spies.
* **Spy:** Tracks calls to a function (checks arguments, return values, call counts) without changing its behavior.
* **Stub:** Replaces a target function with custom, pre-determined response behavior (bypassing real network/DB requests).
* **Mock:** A specialized stub with built-in assertions on how it must be called.

### Q33: What is the purpose of the `readline` module?
* **Description:** A built-in module designed to read input from a readable stream line-by-line.
* **Common Use Case:** Building interactive terminal command-line interfaces that read user prompts from `process.stdin` and print results back to `process.stdout`.

### Q34: How does the V8 engine optimize code using Inline Caches (IC)?
* **Mechanism:** When V8 encounters property lookups on objects, it remembers the memory offset of the property.
* **Benefit:** If subsequent objects sharing the same internal "Hidden Class" (or Shape) are passed to the same function, V8 bypasses the expensive map search and fetches the property directly from the cached offset.

### Q35: How do you generate and analyze heap dumps?
* **Generation:** Run Node with the `--inspect` flag or use `v8.writeHeapSnapshot()`.
* **Analysis:** Import the generated `.heapsnapshot` file into Chrome DevTools under the **Memory** tab. Use the **Comparison** view to inspect which object classes are taking up space and growing.

### Q36: Compare `npm install` and `npm ci`.
* **`npm install`:** Reads `package.json` to resolve dependencies. Can update `package-lock.json` if compatible minor/patch version changes exist.
* **`npm ci`:** Clean Install. Requires a `package-lock.json` to be present. Deletes `node_modules` entirely first and installs the exact versions locked in the lockfile. Will throw an error if the package-lock is out of sync with `package.json`.

### Q37: Why are `eval()` and `new Function()` security liabilities?
* **Vulnerabilities:** They execute arbitrary string inputs as code. If user inputs are passed into them, it allows **Remote Code Execution (RCE)**, letting attackers read/write filesystem records or hijack servers.
* **Performance:** Completely disables V8 runtime compilation optimizations because V8 cannot statically analyze the string before runtime execution.

### Q38: Differentiate between `fs.stat()`, `fs.lstat()`, and `fs.fstat()`.
* **`fs.stat()`:** Checks file details. If the path is a symbolic link, it resolves it and checks the target file.
* **`fs.lstat()`:** Identical to `fs.stat`, but if the target is a symbolic link, it returns info about the *link itself* rather than the file it points to.
* **`fs.fstat()`:** Checks file details, but accepts a **file descriptor** integer instead of a string path representation.

### Q39: How do you prevent SQL Injection in Node.js?
* **Prevention:** Never concatenate or interpolate raw string inputs into database queries.
* **Solution:** Use **parameterized queries** (prepared statements) provided by SQL drivers (e.g., `pg`, `mysql2`), or use a trusted ORM/Query Builder (e.g., Knex, Prisma, Sequelize) that sanitizes inputs automatically.

### Q40: What is Rate Limiting and why is it essential?
* **Definition:** Restricting the number of HTTP requests a single client (identified by IP or API token) can make within a specified timeframe.
* **Importance:** Protects the Node.js server against brute-force attacks, DDoS attempts, and resource-hogging scripts that could crash the event loop.

### Q41: Explain CSRF (Cross-Site Request Forgery) and how to mitigate it.
* **Attack:** A malicious site tricks a browser into sending a request (e.g., form submit) to a target site where the user is authenticated.
* **Mitigation:**
  * Use the `SameSite=Strict` or `SameSite=Lax` cookie flags.
  * Implement CSRF tokens generated on the server and verified inside custom POST request headers.

### Q42: What is the benefit of `process.hrtime()`?
* **Description:** Returns a high-resolution real-time coordinate array in `[seconds, nanoseconds]`.
* **Comparison:** Unlike `Date.now()`, `process.hrtime()` is monotonic, meaning it is not affected by system clock adjustments or drift, making it perfect for benchmarking fine-grained performance and execution durations.

### Q43: What is HTTP Request Smuggling?
* **Vulnerability:** An attack that occurs when front-end proxies and back-end Node.js servers disagree on parsing standard request boundaries (`Content-Length` vs `Transfer-Encoding`).
* **Protection:** Node's internal `http_parser` strict mode enforces conforming rules and throws `400 Bad Request` if conflicting boundary headers are detected.

---

### Q44: How does CommonJS module caching work? What happens with circular imports?
* Every file evaluates exactly once; subsequent requires return the cached `module.exports` — effectively making modules singletons per process.
* Circular A↔B: whichever loads first starts evaluating; when its require reaches the other, that module begins executing and, if it requires back, receives the **partial exports** object (whatever was assigned so far) — not an error, just incomplete data.
* Symptom: importing a function works (hoisted assignments) while top-level constants come back undefined depending on entry order.
* Fixes: break cycle via a third shared module, move require calls inside functions (deferred), or restructure dependencies outright. ES Modules behave differently (live bindings + TDZ) — comparing both shows depth.

### Q45: Why does stream.pipeline() exist when .pipe() already chains streams?
* `pipe()` forwards data but **does not reliably propagate errors or completion**: a failing readable leaves the writer hanging; premature writer close doesn't destroy the reader — leaks and zombie processes follow.
* `pipeline(...streams, cb)` wires every pair bidirectionally: any stage erroring destroys all stages and invokes the callback once with the first error; promises variant (`promises.pipeline`) integrates with async/await.
* It also handles stream destruction ordering correctly on abort signals (`{ signal }` supported) — essential for request-timeouts cancelling multi-stage transforms.
* Rule: never ship `pipe()` in new code paths; mention `Stream.promises.pipeline` plus `finished()` for observing standalone stream lifecycles.

### Q46: Why is database connection pooling critical in Node, and how do you size pools?
* Opening a DB connection costs TCP+auth+TLS round trips (~ms each) — per-request creation collapses throughput and exhausts server-side connection caps.
* Pools maintain warm sockets: checkout/release around queries, queue waiters when exhausted, health-check idle connections, and cap concurrency protecting the database (a pool is also a natural rate limiter).
* Sizing math: roughly `(cores of DB server × 2–4)` total across the fleet, divided by instance count — more is NOT faster; oversized pools cause context-switch thrash and lock contention at the DB (Postgres famously degrades past ~2-4x cores active).
* Operational details: acquire timeouts with clear errors, statement_timeout enforcement, pool metrics exported (waiting count, max used), and draining on graceful shutdown.

### Q47: Describe the Node.js Chrome DevTools debugging workflow (--inspect).
* Launch with `node --inspect[=host:port] app.js` (or `--inspect-brk` pausing at first line); attach chrome://inspect or your IDE debugger over the Chrome DevTools Protocol (CDP).
* Capabilities: breakpoints (incl. conditional/logpoints), call-stack + scope inspection, live expression watches, async stack traces, CPU profiler flamegraphs, heap snapshot allocation timelines, network inspection limited to fetch-level metadata.
* Programmatic alternatives: `inspector` module opens sessions in-process (used by test runners/IDEs), `kill -USR1` activates inspector on a running PID for post-hoc attach.
* Production guidance: never expose the inspector port publicly (RCE-equivalent); tunnel via SSH/port-forward, gate behind feature flags, prefer out-of-band telemetry (OTel/JFR-style) for continuous visibility.

### Q48: How do you defend against npm supply-chain attacks?
* Threat classes: typosquatting, hijacked maintainer accounts, malicious install scripts (postinstall), protestware, compromised transitive deps (event-stream, ua-parser-js incidents).
* Controls:
  1. Commit `package-lock.json`, use `npm ci` in CI for reproducibility; enable `package-lock` strictness.
  2. `npm audit`/`osv-scanner`/Dependabot/Renovate for CVE gating; block unexpected lockfile diffs in review.
  3. Disable lifecycle scripts where feasible (`ignore-scripts`), allowlist packages needing builds.
  4. Pin exact versions for high-risk deps; use provenance attestations (`npm publish --provenance`) + Sigstore verification; consider private registry mirrors with allowlists.
  5. Least-privilege CI tokens (OIDC instead of long-lived NPM_TOKEN), 2FA on publisher accounts.

### Q49: What changed with native fetch in Node (undici)? What is the global dispatcher?
* Node ≥18 ships WHATWG `fetch` globally, implemented atop **undici** — a faster, spec-compliant HTTP/1.1 client replacing the old `http.Agent` world (keep-alive by default, HTTP pipelining options, better streaming).
* Tuning happens via `setGlobalDispatcher(new Agent({ connections, pipelining, keepAliveTimeout, headersTimeout, bodyTimeout }))` — the lever for socket exhaustion fixes that previously meant hacking http.globalAgent.
* Differences from browsers: no CORS, cookies opt-in, response bodies are web streams; `AbortSignal` fully honored including timeouts via `AbortSignal.timeout()`.
* Gotchas: undici ignores system proxy env vars by default (ProxyAgent needed), DNS caching differs from cURL expectations, and mixing legacy axios(http)-stack clients means two connection pools to reason about.

### Q50: How should you size worker/thread/process pools using os.availableParallelism()?
* `os.availableParallelism()` (modern replacement for `os.cpus().length`, respecting cgroup limits) gives usable core count inside containers — cpus().length lies on k8s pods with CPU quotas, causing massive oversubscription.
* Pool sizing heuristics: CPU-bound pools ≈ parallelism − 1 (leave headroom for the event loop); I/O-bound threadpool tasks stay bounded by libuv's UV_THREADPOOL_SIZE (default 4 — raise only when profiling shows getaddrinfo/fs/crypto waits queuing); external service pools sized by downstream capacity (DB formula from pooling question).
* Combine with queue-depth metrics: target utilization ~70%, back-pressure via bounded queues, shed load beyond SLO rather than growing queues unboundedly.

---

## Coding & Implementation Challenges

### Q51: Implement a Worker Thread pool helper that offloads prime number calculation.
* **Objective:** Create a controller script that spawns a background thread to calculate prime numbers without blocking the main event loop.

```javascript
// worker-core.js
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

if (isMainThread) {
  // Main Thread Logic
  module.exports = function calculatePrimesInWorker(limit) {
    return new Promise((resolve, reject) => {
      const worker = new Worker(__filename, { workerData: limit });
      worker.on('message', resolve);
      worker.on('error', reject);
      worker.on('exit', (code) => {
        if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`));
      });
    });
  };
} else {
  // Worker Thread Logic
  const limit = workerData;
  const primes = [];
  
  for (let i = 2; i <= limit; i++) {
    let isPrime = true;
    for (let j = 2; j <= Math.sqrt(i); j++) {
      if (i % j === 0) { isPrime = false; break; }
    }
    if (isPrime) primes.push(i);
  }
  
  parentPort.postMessage(primes);
}
```

### Q52: Implement a custom Transform stream that converts text to uppercase.
* **Objective:** Inherit from `Transform` stream and implement `_transform` to convert buffer streams to uppercase.

```javascript
const { Transform } = require('stream');

class UppercaseTransform extends Transform {
  constructor(options) {
    super(options);
  }

  _transform(chunk, encoding, callback) {
    try {
      // Convert chunk to string, uppercase it, and push
      const upperStr = chunk.toString().toUpperCase();
      this.push(upperStr);
      callback(); // Signal chunk processed
    } catch (err) {
      callback(err); // Pass error if thrown
    }
  }
}

// Verification
const upperStream = new UppercaseTransform();
upperStream.on('data', (data) => console.log('Transformed:', data.toString()));
upperStream.write('hello ');
upperStream.write('world!');
upperStream.end();
```

### Q53: Implement a process manager script that spawns a child process and auto-restarts if it crashes.
* **Objective:** Use `spawn` to run a script, capture standard outputs, and automatically revive the process on non-zero exits.

```javascript
const { spawn } = require('child_process');
const path = require('path');

function runSelfHealingProcess(scriptPath) {
  console.log(`Starting supervisor for: ${scriptPath}`);
  
  const child = spawn('node', [scriptPath], {
    stdio: ['inherit', 'pipe', 'pipe'] // Pipe stdout/stderr, inherit stdin
  });

  child.stdout.on('data', (data) => {
    console.log(`[CHILD STDOUT]: ${data.toString().trim()}`);
  });

  child.stderr.on('data', (data) => {
    console.error(`[CHILD STDERR]: ${data.toString().trim()}`);
  });

  child.on('exit', (code) => {
    console.log(`Child process exited with code ${code}`);
    if (code !== 0) {
      console.log('Crash detected! Reviving child process in 1 second...');
      setTimeout(() => runSelfHealingProcess(scriptPath), 1000);
    } else {
      console.log('Child process finished clean.');
    }
  });
}

// Verification mockup setup
const mockScript = path.join(__dirname, 'mock.js');
const fs = require('fs');
fs.writeFileSync(mockScript, `
  console.log("Mock worker started.");
  setTimeout(() => {
    if (Math.random() > 0.3) {
      console.log("Something went wrong!");
      process.exit(1);
    } else {
      console.log("Completing successfully.");
      process.exit(0);
    }
  }, 500);
`);

runSelfHealingProcess(mockScript);
// Clean up mock script after test window
setTimeout(() => {
  try { fs.unlinkSync(mockScript); } catch (e) {}
}, 3000);
```

### Q54: Implement an encryption and decryption utility using `aes-256-cbc`.
* **Objective:** Create a secure utility wrapping the `crypto` module.

```javascript
const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';
const SECRET_KEY = crypto.randomBytes(32); // Must be 32 bytes for aes-256
const IV_LENGTH = 16; // AES IV length is always 16 bytes

function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
}

function decrypt(encryptedText) {
  const [ivHex, encryptedHex] = encryptedText.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, SECRET_KEY, iv);
  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Verification
const secret = "TopSecretPassword123";
const encryptedData = encrypt(secret);
console.log('Encrypted Payload:', encryptedData);
console.log('Decrypted Outcome:', decrypt(encryptedData));
```

### Q55: Implement a Graceful Shutdown handler for an HTTP server.
* **Objective:** Gracefully stop an HTTP server from receiving connections, and execute cleanups.

```javascript
const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Request processed');
});

server.listen(3000);

function handleGracefulShutdown(signal) {
  console.log(`Received signal: ${signal}. Commencing graceful shutdown.`);
  
  // Stop accepting new connections
  server.close(() => {
    console.log('HTTP server closed. Cleaning up databases...');
    
    // Simulate closing DB connections
    setTimeout(() => {
      console.log('Database connections closed cleanly.');
      process.exit(0);
    }, 500);
  });

  // Force shutdown timeout (e.g., 10 seconds)
  setTimeout(() => {
    console.error('Forced exit: Connections could not close in time.');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));
```

### Q56: Implement a basic mock file system in memory for unit testing.
* **Objective:** Implement custom object representation of files instead of writing to disk.

```javascript
class MockFS {
  constructor() {
    this.files = {};
  }

  writeFileSync(filePath, content) {
    this.files[filePath] = String(content);
  }

  readFileSync(filePath) {
    if (!this.files[filePath]) {
      throw new Error(`ENOENT: no such file or directory, open '${filePath}'`);
    }
    return this.files[filePath];
  }

  unlinkSync(filePath) {
    if (!this.files[filePath]) {
      throw new Error(`ENOENT: no such file or directory, unlink '${filePath}'`);
    }
    delete this.files[filePath];
  }
}

// Verification
const fsMock = new MockFS();
fsMock.writeFileSync('config.json', '{"port": 80}');
console.log('Read Mock:', fsMock.readFileSync('config.json'));
fsMock.unlinkSync('config.json');
```

### Q57: Implement a concurrent promise queue throttle.
* **Objective:** Run tasks concurrently but limit the active concurrency count to `limit`.

```javascript
async function throttlePromises(tasks, limit) {
  const results = [];
  const executing = new Set();

  for (const task of tasks) {
    const promise = Promise.resolve().then(() => task());
    results.push(promise);
    executing.add(promise);

    // Clean up when finished
    const clean = () => executing.delete(promise);
    promise.then(clean, clean);

    if (executing.size >= limit) {
      // Wait for at least one active promise to finish
      await Promise.race(executing);
    }
  }
  return Promise.all(results);
}

// Verification
const createDelayTask = (id, time) => () => 
  new Promise((res) => setTimeout(() => {
    console.log(`Task ${id} completed`);
    res(id);
  }, time));

const tasks = [
  createDelayTask(1, 200),
  createDelayTask(2, 50),
  createDelayTask(3, 100),
  createDelayTask(4, 50)
];

throttlePromises(tasks, 2).then(results => {
  console.log('All results completed:', results);
});
```
