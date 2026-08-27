# Node.js - Hard Interview Questions

## Theory Questions & Answers

### Q1: Detail the internal C++ architecture of Node.js and its binding integration.
* **Architecture Layers:** JavaScript Application $\rightarrow$ Node.js C++ Standard Library Bindings $\rightarrow$ V8 Engine $\rightarrow$ Libuv Platform Library.
* **Bindings:** Node.js uses `node-addon-api` or internal C++ macros (e.g., `NODE_MODULE`) to bind C++ classes to JavaScript objects.
* **Execution Flow:** JavaScript calls a native method (e.g., `fs.open`). V8 maps this to a registered C++ binding function. The C++ binding invokes Libuv's non-blocking API, which executes the request and posts the callback when finished.

### Q2: Explain the V8 compiler pipeline (Ignition, Sparkplug, Maglev, Turbofan).
* **Ignition:** The interpreter. It compiles JavaScript code into bytecode and profiles it to identify "hot" (frequently executed) functions.
* **Sparkplug:** A non-optimizing, fast compiler that converts bytecode directly into native machine code.
* **Maglev:** A mid-tier optimizing compiler that creates a medium-level SSA representation of hot code.
* **Turbofan:** The high-level optimizing compiler. It takes hot bytecode and compile-time profiling data, makes aggressive optimizations (like inlining and loop peeling), and produces highly optimized machine code. If assumptions fail, it *deoptimizes* back to Ignition.

### Q3: Deep dive into the Libuv event loop integration with V8.
* **State Machine:** Libuv runs inside a blocking loop `uv_run()`. It relies on system calls like `epoll`/`kqueue` to wait for descriptors to become active.
* **V8 Integration:** When a descriptor becomes ready, Libuv calls the associated C++ callback. The C++ binding transitions context into V8, sets up a V8 execution context, and executes the compiled JavaScript callback on the V8 call stack.

### Q4: Explain the differences and priority between Microtasks and Macrotasks.
* **Microtask Queue:** Contains promises (resolved `.then()`) and callbacks scheduled by `queueMicrotask()` or `process.nextTick()`.
* **Macrotask Queue:** Contains callbacks from timers (`setTimeout`, `setImmediate`) and I/O handlers.
* **Priority Rule:** Microtasks run with absolute priority. Between *each* stage of the event loop and after *every* individual macrotask callback, the event loop must fully drain the entire microtask queue before continuing.

### Q5: How does memory allocation work in V8, especially for Buffers?
* **V8 Heap Memory:** Limited in size (configured via `--max-old-space-size`). Contains execution structures, JS objects, and strings.
* **External Allocations (Buffers):** Modern Node.js allocates `Buffer` payloads directly in raw system memory outside the V8 heap (C++ heap) using `malloc()`. This avoids V8 garbage collection overhead and allows swapping blocks without heap context copying.

### Q6: How does the V8 GC handle GC pauses (parallelism, incremental marking, concurrent sweeping)?
* **Incremental Marking:** The GC maps references across the heap incrementally during event loop idle gaps, reducing the "Stop-the-World" phase length.
* **Concurrent Sweeping:** Back-ground helper threads sweep and release garbage memory from pages concurrent to main thread code execution.
* **Remembered Sets:** Tracking structures holding cross-generational references (old space pointing to young space) to avoid scanning the entire old space during minor GCs.

### Q7: What is a Core Dump and how do you analyze it?
* **Definition:** A snapshot of a process's memory space and register state at a specific point in time (usually crash time).
* **Generation:** Run Node.js with `--abort-on-uncaught-exception` or trigger using `process.abort()`.
* **Analysis:** Load the dump into a debugger like `gdb` or `lldb` combined with V8 debugging plugins to inspect the C++ call stacks and locate the crashing pointer.

### Q8: How does `require()` compile code under the hood?
* **Resolution:** Resolves absolute file paths.
* **Wrapping:** Reads the target file and wraps the text in an IIFE:
  ```javascript
  (function(exports, require, module, __filename, __dirname) {
    // Original File Content
  });
  ```
* **Compilation:** Compiles the wrapped string using V8's `vm.runInThisContext()`, injects the module's arguments, executes, and returns the cached `module.exports`.

### Q9: How do you identify the "Retaining Path" of a memory leak in Node.js?
* **Definition:** The chain of object references keeping a target leaking object linked back to a GC root (e.g., global variables or active closures).
* **Tools:** Capture multiple heap snapshots via `v8-profiler` and inspect the "Retaining Paths" in Chrome DevTools. Look for the object with high *retained size* and follow the path up to find the root reference preventing GC.

### Q10: How do you write code that avoids V8 object deoptimizations?
* **Rules:**
  * **Monomorphism:** Ensure functions are called with objects of the exact same Shape (hidden class).
  * **Static Shapes:** Do not add or delete properties from objects after instantiation; initialize all properties in the constructor.
  * **Avoid `delete`:** Using `delete` on a property forces the object into "dictionary mode," destroying its hidden class optimization.

### Q11: Explain TCP Backpressure and how it bubbles up to Node.js streams.
* **Mechanism:**
  1. The client's TCP receive window fills up.
  2. The client's OS stops acknowledging TCP packets, filling the server's OS TCP transmit buffer.
  3. The server's OS socket write returns `EAGAIN` / blocks.
  4. In Node, this causes `writable.write()` to return `false`, triggering stream backpressure.

### Q12: How does HTTP/2 multiplexing work and how does Node support it?
* **Multiplexing:** Allows sending multiple concurrent request-response pairs over a *single* shared TCP connection using binary frames.
* **Node Support:** Implemented via the C++ `nghttp2` library wrapper in the `http2` module, using a single TCP socket managed by `Http2Session` and multiplexed via `Http2Stream` objects.

### Q13: Explain TLS/SSL Handshake termination in Node.js.
* **Termination:** Decrypting incoming SSL traffic at the application layer.
* **Implementation:** Use the native `tls` module. Pass key and certificate parameters:
  ```javascript
  const tls = require('tls');
  const server = tls.createServer({
    key: fs.readFileSync('server-key.pem'),
    cert: fs.readFileSync('server-cert.pem')
  }, (socket) => { ... });
  ```

### Q14: Explain Prototype Pollution and its prevention strategies.
* **Vulnerability:** Unsanitized merging of user-supplied JSON containing key structures like `__proto__` or `constructor.prototype` which alters the default properties of `Object.prototype`.
* **Prevention:**
  * Sanitize or reject keys containing `__proto__`.
  * Instantiate objects using `Object.create(null)` to bypass standard inheritance.
  * Freeze prototypes using `Object.freeze(Object.prototype)`.

### Q15: What is ReDoS and how do you protect Node.js applications?
* **Attack:** Exploiting inefficient regular expression patterns (containing overlapping repetitions, like `(a+)+`) that trigger exponential "catastrophic backtracking" on non-matching strings, pegging the event loop at 100% CPU.
* **Mitigation:**
  * Use safe regex engines (like `re2` via Node-API bindings).
  * Set execution timeouts for regex matching or audit regexes using analysis tools (e.g., `safe-regex`).

### Q16: How do you implement multithreading memory sharing using `SharedArrayBuffer`?
* **Mechanism:** `SharedArrayBuffer` shares raw byte memory across multiple `worker_threads` without message serialization overhead.
* **Synchronization:** Must use the global `Atomics` object (`Atomics.wait`, `Atomics.notify`, `Atomics.compareExchange`) to perform thread-safe, non-blocking atomic operations and prevent race conditions.

### Q17: Compare `v8.Serializer` and `JSON.stringify` for IPC performance.
* **`JSON.stringify`:** CPU-intensive string serialization. Loses types like Dates, Maps, Sets, and binary Buffers.
* **`v8.Serializer`:** Built-in binary serialization format. Serializes objects directly into binary buffers. Highly optimized, extremely fast, and retains original JavaScript object types natively.

### Q18: What is a Node-API (N-API) C++ Addon and when is it preferred?
* **Definition:** A stable C-API that allows compiled C/C++ libraries to link into Node.js.
* **Benefit:** Provides an ABI-stable interface, meaning compiled binaries do not need recompilation for different Node.js major engine versions.
* **Usage:** For executing high-performance calculations (image processing, cryptographic algorithms) or interfacing with native operating system APIs directly.

### Q19: How do you profile system-level syscalls in a Node process?
* **Linux System Calls:** Use `strace -p <PID>` to trace kernel interactions (e.g., file opens, network reads).
* **CPU Profiling:** Use `perf record -g -p <PID>` to sample CPU execution paths at the kernel level and generate SVG Flame Graphs.

### Q20: Explain the internals of context tracking via `AsyncLocalStorage`.
* **Mechanism:** Tracks execution context across asynchronous boundaries.
* **How it works:** Hooks into V8's asynchronous call linkages via internal API callbacks (`async_hooks`). This links a unique state object to the lifetime of async resources (Promises, timeouts) and retrieves them from the current active call context.

### Q21: How do you handle 50GB file uploads without risking OOM crashes?
* **Strategy:** Use streaming multi-part parser streams (e.g., `busboy` or `formidable` set to stream mode) that parse parts sequentially. Pipe individual incoming file streams immediately to disk storage or cloud storage (S3) streams. Avoid loading any file chunks into RAM.

### Q22: Explain the internal buffering and draining state machine in Writable streams.
* **Write process:** Calling `.write(chunk)` pushes data to the internal queue. If total queued bytes $\ge$ `highWaterMark`, `write()` returns `false` (state is flagged as buffered).
* **Drain process:** Once the underlying write resource finishes flushing the current queued buffer down to zero, the stream fires the `'drain'` event to restart the producer pipeline.

### Q23: Detail the Node.js module resolution algorithm.
* **Steps:**
  1. If core module, return it.
  2. If starts with `./`, `../`, or `/`, resolve relative path.
  3. If not, traverse directories: scan the current directory's `node_modules`. If not found, move up to parent directories recursively until the root is reached.
  4. For each directory, inspect `package.json`'s `exports`, `module`, or `main` fields. Fall back to `index.js`, `index.json`, or compiled addon files.

### Q24: What is DNS Hijacking and how can a Node.js server mitigate it?
* **Vulnerability:** External bad actors spoofing local system DNS configurations or routers, returning malicious IP addresses.
* **Mitigation:**
  * Avoid raw OS `dns.lookup`.
  * Configure Node.js to use DoH (DNS over HTTPS) or DoT (DNS over TLS) clients to verify resolving authorities over encrypted channels.

### Q25: How do you measure Event Loop Lag?
* **Lag Definition:** The time delay between scheduling a timer and its execution.
* **Measurement:** Schedule an interval (e.g., every 50ms). Calculate the delta of the actual firing time minus the expected interval:
  ```javascript
  const start = Date.now();
  setTimeout(() => {
    const lag = Date.now() - start - 50;
    console.log(`Event loop lag: ${lag}ms`);
  }, 50);
  ```

### Q26: Compare `child_process.fork()` with the POSIX `fork()` syscall.
* **POSIX `fork()`:** Clones the calling process, duplicating file descriptors, memory pages, and thread states instantly in a Copy-On-Write fashion.
* **Node `fork()`:** Spawns a completely *new* child process from scratch, loading a separate V8 engine instance and parsing the JavaScript file. It is much more expensive than a POSIX fork.

### Q27: How does V8 handle TypedArrays vs Node.js Buffers?
* **TypedArrays:** Native JavaScript array buffers (ECMAScript specification).
* **Buffers:** Node.js-specific subclass of `Uint8Array` (Buffer inherits from Uint8Array).
* **Mapping:** Both point to raw ArrayBuffer references, but Node's `Buffer` exposes specialized helper wrappers for hex, base64 encoding, and binary manipulation that standard typed arrays lack.

### Q28: How does `AbortController` work in Node.js?
* **Mechanism:** An implementation of the WHATWG specification.
* **Usage:** Pass the `AbortSignal` instance to asynchronous operations (e.g., `fetch` or `fs.promises.readFile`). Calling `controller.abort()` fires an `'abort'` event on the signal, causing the asynchronous worker to reject instantly.

### Q29: What is the V8 CPU Profiler and how do you use its output?
* **V8 Profiler:** Samples the JavaScript call stack periodically (e.g., every 1ms).
* **Output:** Generates a profile detailing the percentage of samples spent in specific functions.
* **Bottleneck Discovery:** Identify "heavy" functions (high "Self Time") that block compilation or block execution loops continuously.

### Q30: How does Node.js achieve zero-copy streams using direct file descriptors?
* **Mechanism:** Avoids transferring data buffer states from C++ kernel space to V8 heap memory space.
* **Implementation:** Under the hood, Libuv streams use systems calls like `sendfile` (on Linux) to route a file descriptor directly to a network TCP socket descriptor at the kernel level.

### Q31: What is the security purpose of `process.setuid()` and `process.setgid()`?
* **Purpose:** Privilege Dropping.
* **Scenario:** A Node.js process must start with root privileges (`UID 0`) to bind to a protected port (like port 80 or 443).
* **Action:** Immediately after binding to the port, call `process.setuid('nobody')` to downgrade the process's execution privileges. If the application is compromised, the attacker does not gain root system access.

### Q32: Explain Command Injection and why `spawn` is safer than `exec`.
* **Command Injection:** Injecting malicious shell commands into system scripts (e.g., `rm -rf /`).
* **Why `spawn` is safer:** `spawn` accepts command arguments as an *array of strings* directly without launching a shell, passing parameters directly to the OS syscall, rendering argument injection ineffective. `exec` launches a shell to interpret the full string, making it vulnerable to injection.

### Q33: How do you securely implement sessions using Redis and `express-session`?
* **Practices:**
  * Configure `cookie: { httpOnly: true, secure: true, sameSite: 'strict' }`.
  * Set a secure rolling window for sessions (`rolling: true`).
  * Use a Redis store to prevent in-memory server state fragmentation and configure automated TTLs for session records.

### Q34: How does Node.js execute asynchronous crypto operations?
* **Mechanism:** Modern cryptographic calculations are delegated to Libuv's thread pool.
* **Scaling:** If many cryptographic hashing tasks (like `pbkdf2`) are requested simultaneously, the thread pool can saturate. Scale it by adjusting `process.env.UV_THREADPOOL_SIZE` upwards.

### Q35: How does V8 compact memory to prevent fragmentation?
* **Fragmentation:** Small gaps of free memory scattered across the heap, making it impossible to allocate contiguous memory blocks.
* **Solution:** During the Sweep phase, V8's Mark-Sweep-Compact garbage collector shifts surviving objects into contiguous pages, updating all active memory pointers to eliminate empty gaps.

### Q36: What is the purpose of the `diagnostics_channel` module?
* **Definition:** A built-in module that provides a pub/sub event channel to publish and subscribe to telemetry data.
* **Usage:** APM (Application Performance Monitoring) tools subscribe to events (e.g., `mysql.query.start`) to record metrics without needing to manually wrap or monkey-patch the original databases.

### Q37: Explain Libuv `uv_run` modes.
* **`UV_RUN_DEFAULT`:** Runs the event loop until there are no active handles, timers, or requests.
* **`UV_RUN_ONCE`:** Polls for I/O once, then executes any pending timers, blocking only if no expired timers exist.
* **`UV_RUN_NOWAIT`:** Polls for I/O without blocking, executing callbacks only if they are ready immediately, and then exits the tick.

### Q38: How does the `cluster` module achieve port sharing?
* **Port Hooking:** The master process binds and listens on the TCP port.
* **Worker Execution:** When a worker calls `server.listen()`, Node's internal server wrapper intercepts this call and registers the worker process handle with the master instead of opening a duplicate OS socket, distributing connections via IPC.

### Q39: Compare Asymmetric Decryption with Digital Signature Verification.
* **Asymmetric Decryption:** Decrypts a payload encrypted with a matching public key, proving the data's privacy.
* **Signature Verification:** Re-hashes the payload and decrypts the signature using the sender's *public* key, proving the data's integrity and authenticity (non-repudiation) without hiding the payload content.

### Q40: What was `process.binding` and why was it deprecated?
* **`process.binding`:** An legacy API used to directly import internal C++ bindings into JS.
* **Deprecation:** It was highly unstable, bypassed internal wrappers, and exposed dangerous memory access. Replaced by `process.internalBinding` for internal modules and ABI-stable `node-addon-api` for external developers.

### Q41: Explain how Libuv uses `uv_poll_t` for network polling.
* **Mechanism:** A handle wrapper used to monitor file descriptors for state changes.
* **Under the hood:** Maps the descriptor directly to the operating system's polling engine (e.g., `epoll` or `kqueue`) to perform non-blocking wait queries for incoming network traffic.

### Q42: What is Cookie Tossing and how do you protect against it?
* **Attack:** A sub-domain sets a malicious cookie sharing the same name but with a wider domain path, hijacking the main domain's cookie parsing priorities.
* **Mitigation:**
  * Use specific domain paths when configuring cookies.
  * Enable the `__Host-` or `__Secure-` cookie prefix to enforce that cookies are restricted only to the exact originating host.

### Q43: How does the V8 scavenging algorithm handle pointers from old generation objects to young generation objects?
* **Problem:** If a minor GC scans the entire old space to find references to young space objects, it ruins the speed of the scavenger algorithm.
* **Solution:** Uses **Write Barriers** and a **Remembered Set** (card table). When an old space object is updated to point to a young space object, the write barrier flags that memory page card. The minor GC only scans flagged old space cards instead of the whole heap.

---

### Q44: Which APIs secretly run on the libuv threadpool, and how does threadpool starvation manifest?
* Threadpool consumers: most `fs` operations, `dns.lookup` (getaddrinfo!), async `crypto` (pbkdf2/scrypt/randomBytes), zlib compression, some `uv_fs_*` stat calls inside frameworks — default pool size 4 (`UV_THREADPOOL_SIZE` up to 1024).
* Starvation signature: one heavy category (e.g., scrypt auth at 100ms×N concurrent logins) occupies all 4 slots; *unrelated* features stall — file reads hang, DNS resolutions freeze, latency spreads everywhere despite idle CPU.
* Diagnosis: correlate slow traces showing fs/dns/crypto waits together; measure pool saturation via perf_hooks/async_hooks instrumentation or eBPF syscall tracing; reproduce by flooding pbkdf2 in staging.
* Mitigations ladder: tune UV_THREADPOOL_SIZE modestly (context-switch ceiling), move CPU-heavy crypto to worker_threads pools, replace dns.lookup with `dns.resolve*` (goes through c-ares on the loop, not the pool), cache DNS aggressively, batch/compress off the hot path.

### Q45: How do custom ESM loader hooks work, and what are they used for?
* Loader chains intercept module loading: `resolve(specifier, context, nextResolve)` decides URL/location; `load(url, context, nextLoad)` supplies source + format ('module', 'commonjs', 'json', 'wasm'...). Register via `--import register.js` calling `register('./hooks.mjs')` or CLI `--loader` (deprecated syntax).
* Uses: TypeScript stripping without build steps (tsx/ts-node era), instrumenting code for coverage/profiling, virtual modules for testing mocks, import-map-like aliasing, SSR transform pipelines, policy enforcement (banning raw SQL string imports).
* Semantics: hooks compose LIFO like middleware; must be synchronous-safe in resolve, may return short-circuited results; child workers need re-registration; formats feed V8's compilation directly.
* Contrast with CJS monkey-patching (`Module._extensions` hacks) — ESM hooks are the sanctioned evolution, powering tools like tsx, ts-node/esm, and Next's debug tooling.

### Q46: When would you use the sampling heap profiler instead of full heap snapshots in production?
* Full snapshots (`heapdump`/v8.getHeapSnapshot) serialize every object — hundreds of MB pauses and memory spikes on large heaps; acceptable ad hoc, reckless continuously.
* **Sampling profiler** (`v8.SamplingHeapProfiler` / `--heap-prof`) statistically samples allocations (configurable interval) with ~low overhead, producing allocation-attributed flamegraphs: catches leak growth trends and chatty allocation hot spots live.
* Strategy: always-on sampled allocation telemetry feeding time-series; on anomaly alerts, trigger targeted full snapshot on one canary instance for exact retaining-path forensics.
* Complementary counters to export: heapUsed trend post-GC, external/array-buffer usage, RSS-vs-heap delta (native leak detector), major-GC frequency/duration.
* Interview framing: triage funnel — cheap broad signal first, expensive precise capture second; never let diagnosis mechanisms become the outage.

### Q47: What does the Node.js permission model protect, and what are its limits?
* `node --experimental-permission --allow-fs-read=/app --allow-fs-write=/tmp --allow-child-process --allow-worker` gates access to filesystem, spawning subprocesses, workers, and (newer) `process.binding`-adjacent surfaces — deny-by-default sandboxing at the runtime level.
* Use cases: running untrusted plugin code, tightening CLI tools, defense-in-depth for SSRF-prone renderers (even a vuln can't read /etc/passwd).
* Limits to state honestly: experimental flag surface evolving across versions; doesn't replace OS sandboxes (containers/seccomp/AppArmor) since V8 escapes/N-API addons bypass; env vars/network still need complementary controls (network restrictions landed progressively — verify version behavior).
* Deployment pattern: combine runtime permissions + non-root user + read-only rootfs + seccomp profile + capability dropping; the model adds an inner fence, not the whole pen.

### Q48: What are Node compile cache and V8 startup snapshots doing for startup time?
* **Compile cache**: Node ≥22 `module.enableCompileCache()` persists V8 code-cache (parsed/compiled bytecode) keyed by file contents — skipping parse/compile on subsequent runs; transparent, per-user cache dir, invalidated by mtime/hash.
* **V8 startup snapshot**: serializes a pre-initialized isolate's heap (builtins, sometimes app context) into a blob mmapped at boot — instantiates context instead of constructing it; powers fast-launch CLIs and embedded scenarios (`--build-snapshot`).
* Combined effect for serverless/CLI cold starts: tens-of-percent reductions typical; pairs with lazy `require` hygiene and deferred heavy SDK initialization.
* Trade-offs: snapshot staleness risk (rebuild on deploy), cache-dir writability requirements in read-only containers (mount tmpfs or disable), marginal benefit once JIT warms anyway for long-lived processes.

### Q49: How do you design a worker-thread pool (piscina-style)? Where does serialization cost bite?
* Architecture: fixed N workers (sized via availableParallelism heuristic), task queue with optional priorities/deadlines, round-robin-or-least-busy dispatch, result promises resolved via worker 'message' events correlating taskId→resolver map; support AbortSignal cancellation, max queue depth backpressure, and idle recycling.
* Serialization reality: `postMessage` structured-clones arguments/results — large Buffers copy unless transferred (`transferList` zero-copies ArrayBuffers/TypedArrays); plain objects clone recursively (CPU + GC churn); SharedArrayBuffer avoids copying for shared-mutable workloads at coordination complexity cost.
* Anti-patterns: shipping per-request tiny tasks (dispatch overhead dwarfs compute), returning megabyte JSON blobs from workers (clone tax exceeds compute), blocking workers on I/O better done on the loop.
* Metrics that matter: queue wait time, task execution time, clone time attribution, worker restart counts — alert on wait≫compute signaling pool mis-sizing.

### Q50: How does Node integrate with OpenSSL, and what does FIPS mode mean operationally?
* Node statically links a pinned OpenSSL version per release line (security patches ride Node releases; check `process.versions.openssl`) — all TLS + most `crypto` primitives delegate to it.
* FIPS: enabling `--fips` (or NODE_OPTIONS) restricts algorithms to FIPS 140-validated set — certain ciphers/key sizes disabled, non-compliant primitives throw; regulated environments (gov/health/fintech) mandate this posture.
* Operational consequences: algorithm availability differs (legacy protocols break), performance characteristics shift, image builds must include validated module artifacts, and CI needs a FIPS-parity matrix because local dev rarely matches.
* Adjacent hardening topics worth naming: TLS min-version pinning (`tls.DEFAULT_MIN_VERSION`), curve/cipher suite customization, cert rotation without restarts (SNICallback), and mTLS client-cert identity extraction for service meshes.

---

## Coding & Implementation Challenges

### Q51: Implement a high-performance custom streaming parser for a binary file format.
* **Objective:** Create a Transform stream that parses a custom binary stream: a 4-byte header (Magic bytes `0xDEADBEEF`), a 2-byte length header (Uint16BE), and the payload data.

```javascript
const { Transform } = require('stream');

class BinaryProtocolParser extends Transform {
  constructor(options) {
    super(options);
    this.buffer = Buffer.alloc(0);
  }

  _transform(chunk, encoding, callback) {
    // Append new chunk to internal buffer
    this.buffer = Buffer.concat([this.buffer, chunk]);

    while (true) {
      if (this.buffer.length < 6) {
        // Not enough bytes to read header (4-byte magic + 2-byte length)
        break;
      }

      // Check Magic Bytes (0xDEADBEEF)
      const magic = this.buffer.readUInt32BE(0);
      if (magic !== 0xDEADBEEF) {
        callback(new Error('Invalid protocol magic bytes'));
        return;
      }

      const payloadLength = this.buffer.readUInt16BE(4);
      const totalFrameSize = 6 + payloadLength;

      if (this.buffer.length < totalFrameSize) {
        // Wait for more data to complete the frame
        break;
      }

      // Extract full frame payload
      const payload = this.buffer.subarray(6, totalFrameSize);
      this.push(payload); // Push payload down stream

      // Slice out the processed frame from buffer
      this.buffer = this.buffer.subarray(totalFrameSize);
    }
    callback();
  }
}

// Verification
const parser = new BinaryProtocolParser();
parser.on('data', (data) => console.log('Parsed Payload:', data.toString()));

// Create mock buffers
const f1 = Buffer.alloc(6);
f1.writeUInt32BE(0xDEADBEEF, 0);
f1.writeUInt16BE(5, 4);
const d1 = Buffer.from('Hello');

parser.write(f1);
parser.write(d1); // Output: Parsed Payload: Hello
parser.end();
```

### Q52: Implement a lock-free task processor using `SharedArrayBuffer` and `Atomics`.
* **Objective:** Share a lock status array across workers to update task lists concurrently without collisions.

```javascript
// shared-worker.js
const { Worker, isMainThread, workerData } = require('worker_threads');

if (isMainThread) {
  const sab = new SharedArrayBuffer(4); // 4-byte buffer (Int32)
  const sharedArray = new Int32Array(sab);

  // Initialize lock to 0 (unlocked)
  sharedArray[0] = 0;

  console.log('Spawning 3 Workers with Shared Memory...');
  const workers = [];
  for (let i = 1; i <= 3; i++) {
    const w = new Worker(__filename, { workerData: { id: i, sab } });
    workers.push(w);
  }
} else {
  const { id, sab } = workerData;
  const sharedArray = new Int32Array(sab);

  // Attempt lock-free CAS (Compare-and-Swap)
  // If value is 0 (unlocked), set it to 1 (locked) and return 0
  const originalVal = Atomics.compareExchange(sharedArray, 0, 0, 1);

  if (originalVal === 0) {
    console.log(`Worker [${id}] successfully acquired lock free lock! Executing task...`);
    // Simulate critical section work
    setTimeout(() => {
      Atomics.store(sharedArray, 0, 0); // Unlock by resetting to 0
      console.log(`Worker [${id}] completed work and released lock.`);
    }, 100);
  } else {
    console.log(`Worker [${id}] lock busy (Value was ${originalVal}). Exiting.`);
  }
}
```

### Q53: Implement a cluster process manager with graceful rolling hot-reload.
* **Objective:** Spawn processes and restart them one-by-one with zero downtime.

```javascript
const cluster = require('cluster');
const http = require('http');
const os = require('os');

if (cluster.isMaster) {
  const numCPUs = os.cpus().length;
  console.log(`Master PID ${process.pid} is running.`);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // Graceful rolling hot reload handler
  process.on('SIGUSR2', async () => {
    console.log('Received SIGUSR2: Commencing rolling update...');
    const workers = Object.values(cluster.workers);

    for (const worker of workers) {
      console.log(`Rolling worker: Shutting down PID ${worker.process.pid}`);
      
      // Spawn replacements first
      const newWorker = cluster.fork();
      await new Promise((res) => newWorker.on('online', res));

      // Terminate old worker gracefully
      worker.disconnect();
      worker.kill('SIGTERM');
      await new Promise((res) => worker.on('exit', res));
    }
    console.log('Rolling update completed successfully.');
  });
} else {
  // Worker Logic
  const server = http.createServer((req, res) => {
    res.writeHead(200);
    res.end(`Handled by PID ${process.pid}`);
  });
  server.listen(8000);
}
```

### Q54: Build a streaming, zero-RAM multipart file-uploader.
* **Objective:** Parse binary streams directly without buffering payloads, writing to write-streams directly.

```javascript
const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  if (req.method === 'POST') {
    const saveTo = path.join(__dirname, 'uploaded_large_file.bin');
    const writeStream = fs.createWriteStream(saveTo);

    console.log('Commencing low-memory streaming file upload...');
    
    // Pipe incoming binary payload directly to filesystem
    req.pipe(writeStream);

    writeStream.on('finish', () => {
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, path: saveTo }));
    });

    writeStream.on('error', (err) => {
      res.writeHead(500);
      res.end('Upload write error: ' + err.message);
    });
  } else {
    res.writeHead(404).end();
  }
});

server.listen(4000, () => console.log('File upload server on port 4000'));
```

### Q55: Implement high-precision telemetry measuring event loop lag and memory metrics.
* **Objective:** Build a tracking agent reporting metrics back at exact intervals.

```javascript
const v8 = require('v8');

class PerformanceMonitor {
  constructor(intervalMs = 1000) {
    this.intervalMs = intervalMs;
    this.timer = null;
  }

  start() {
    this.timer = setInterval(() => {
      const start = process.hrtime.bigint();
      
      // Schedule immediate check
      setImmediate(() => {
        const end = process.hrtime.bigint();
        const elapsedNs = end - start;
        const lagMs = Number(elapsedNs) / 1_000_000;

        const heapStats = v8.getHeapStatistics();
        const memoryUsage = process.memoryUsage();

        console.log('--- TELEMETRY TRACE ---');
        console.log(`Event Loop Lag: ${lagMs.toFixed(4)} ms`);
        console.log(`Heap Limit: ${(heapStats.heap_size_limit / 1024 / 1024).toFixed(2)} MB`);
        console.log(`Heap Used: ${(heapStats.used_heap_size / 1024 / 1024).toFixed(2)} MB`);
        console.log(`RSS Memory: ${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`);
        console.log('-----------------------');
      });
    }, this.intervalMs);
  }

  stop() {
    clearInterval(this.timer);
  }
}

// Verification
const monitor = new PerformanceMonitor(500);
monitor.start();
setTimeout(() => monitor.stop(), 1500);
```

### Q56: Create an asynchronous context tracker using `AsyncLocalStorage`.
* **Objective:** Track request IDs across complex asynchronous flows without parameter passing.

```javascript
const { AsyncLocalStorage } = require('async_hooks');
const http = require('http');

const asyncLocalStorage = new AsyncLocalStorage();

// Middleware-like entry wrapper
function handleRequest(req, res) {
  const requestId = req.headers['x-request-id'] || 'anonymous-id-123';
  
  asyncLocalStorage.run({ requestId }, () => {
    logWithContext('Received request, performing database query...');
    
    // Simulate database callback
    setTimeout(() => {
      logWithContext('Database query finished, replying to client...');
      res.writeHead(200);
      res.end('Success');
    }, 150);
  });
}

function logWithContext(msg) {
  const store = asyncLocalStorage.getStore();
  const reqId = store ? store.requestId : 'N/A';
  console.log(`[Request ID: ${reqId}] ${msg}`);
}

const server = http.createServer(handleRequest);
server.listen(5000, () => console.log('Context tracker running on 5000'));
```

### Q57: Implement an automated in-memory memory leak detector.
* **Objective:** Monitor growing heap objects periodically. Force garbage collection using `--expose-gc` flag.

```javascript
// Run script using: node --expose-gc script.js
class LeakDetector {
  constructor() {
    if (typeof global.gc !== 'function') {
      throw new Error('LeakDetector requires --expose-gc flag enabled');
    }
    this.history = [];
  }

  analyze() {
    global.gc(); // Force immediate collection
    const heapUsed = process.memoryUsage().heapUsed;
    this.history.push(heapUsed);

    console.log(`Current heap used: ${(heapUsed / 1024 / 1024).toFixed(2)} MB`);

    if (this.history.length > 5) {
      const first = this.history[this.history.length - 5];
      const last = this.history[this.history.length - 1];
      const delta = last - first;

      if (delta > 10 * 1024 * 1024) { // Growth > 10MB across 5 cycles
        console.warn('--- WARNING: SUSPECTED MEMORY LEAK IN TARGET PROCESS ---');
        console.warn(`Continuous memory expansion delta: ${(delta / 1024 / 1024).toFixed(2)} MB`);
      }
    }
  }
}

// Verification simulation
const detector = new LeakDetector();
const leaks = [];

setInterval(() => {
  // Simulate heavy memory leaks
  for (let i = 0; i < 50000; i++) {
    leaks.push({ val: Math.random(), closure: () => leaks });
  }
  detector.analyze();
}, 200);

setTimeout(() => process.exit(0), 1500); // Stop before crash
```
