# Computer Networks - Medium Interview Questions

### Q1: Describe the TCP 3-Way Handshake process in detail.
The TCP 3-way handshake establishes a reliable connection over an unreliable IP network by synchronizing sequence numbers:
1.  **SYN:** The client sends a segment with a random initial sequence number ($ISN_C$) and the `SYN` bit set to 1. State: `SYN-SENT`.
2.  **SYN-ACK:** The server responds with its own random initial sequence number ($ISN_S$), sets the `SYN` bit to 1, and acknowledges the client's packet by setting `ACK` to 1 and the acknowledgment number to $ISN_C + 1$. State: `SYN-RECEIVED`.
3.  **ACK:** The client acknowledges the server's segment by setting the `ACK` bit to 1 and the acknowledgment number to $ISN_S + 1$. State: `ESTABLISHED` on both sides.

### Q2: Detail the TCP 4-Way Connection Teardown process.
TCP connections are full-duplex, meaning each direction must be terminated independently:
1.  **FIN (Client to Server):** Client sends a segment with the `FIN` bit set, indicating it has no more data to send. Client state: `FIN-WAIT-1`.
2.  **ACK (Server to Client):** Server acknowledges the FIN with an `ACK`. Server state: `CLOSE-WAIT`; Client state: `FIN-WAIT-2`. The server can still send data.
3.  **FIN (Server to Client):** Once the server finishes sending data, it sends its own `FIN`. Server state: `LAST-ACK`.
4.  **ACK (Client to Server):** Client acknowledges the server's FIN with an `ACK` and enters the `TIME-WAIT` state, waiting for $2 \times MSL$ (Maximum Segment Lifetime) before transitioning to `CLOSED`. Server enters `CLOSED` immediately upon receiving the ACK.

### Q3: Why is the TIME-WAIT state necessary in TCP connection termination?
The `TIME-WAIT` state (usually lasting 2 to 4 minutes) serves two critical purposes:
*   **Guarantees final ACK delivery:** If the final `ACK` is lost, the server remains in `LAST-ACK` and retransmits its `FIN`. The client must remain active to re-send the `ACK`.
*   **Drains delayed packets:** It allows older, delayed packets belonging to the connection to expire in the network, preventing them from corrupting subsequent connections using the same socket pairs.

### Q4: Explain the difference between TCP Flow Control and Congestion Control.
*   **Flow Control:** End-to-end mechanism that prevents a fast sender from overwhelming a slow receiver. It uses a **Receiver Window (rwnd)** advertised in the TCP header to limit unacknowledged data.
*   **Congestion Control:** Global network mechanism that prevents sender nodes from overwhelming the intermediate routers and links. It uses a calculated **Congestion Window (cwnd)** in the OS kernel.
*   **Effective Window limit:** The sender cannot transmit more than $\min(rwnd, cwnd)$ bytes of unacknowledged data.

### Q5: How does HTTP/2 solve the Head-of-Line (HoL) blocking of HTTP/1.1?
*   **HTTP/1.1 HoL Blocking:** Occurs because browsers can only send requests sequentially over a single TCP connection. If a resource takes long to generate, subsequent requests on that pipe are blocked.
*   **HTTP/2 Multiplexing:** Resolves this by breaking HTTP transactions into binary frames. These frames are interleaved over a single TCP connection within independent concurrent streams.
*   **Remaining Limitation:** HTTP/2 is still susceptible to TCP-level HoL blocking (if one packet is lost, TCP stalls all streams until that packet is retransmitted).

### Q6: What is Server-Sent Events (SSE) and how does it compare to WebSockets?
*   **SSE:** A unidirectional protocol where the server pushes real-time text streams to the client over standard persistent HTTP connections (`text/event-stream`). It supports automatic reconnection and is highly efficient for read-only feeds (e.g., stock tickers).
*   **WebSockets:** A full-duplex, bidirectional protocol operating over a single TCP socket. It initiates via an HTTP handshake and upgrades to a dedicated framing protocol, making it ideal for interactive, low-latency apps (e.g., chat, gaming).

### Q7: Compare Link-State and Distance-Vector routing algorithms.
*   **Distance-Vector (e.g., RIP):** Routers regularly advertise their entire routing tables only to direct neighbors. Paths are calculated using the Bellman-Ford algorithm based on hop count. Prone to routing loops and slow convergence.
*   **Link-State (e.g., OSPF):** Routers flood local link-state information (topology map) to all nodes in the network. Every router independently computes the shortest path tree using Dijkstra's algorithm. Offers fast convergence, loop-free routing, but demands more CPU and memory.

### Q8: Explain Split Horizon and Route Poisoning in routing protocols.
Both are mechanisms used by Distance-Vector routing protocols to prevent count-to-infinity routing loops:
*   **Split Horizon:** A router is prohibited from advertising a route back out of the interface through which it originally learned that route.
*   **Route Poisoning:** When a network link fails, a router immediately advertises the route with an infinite metric (e.g., 16 hops in RIP), making the route unreachable and forcing neighbors to quickly purge it.

### Q9: How does Border Gateway Protocol (BGP) work, and why is it a Path-Vector protocol?
*   **BGP:** The exterior gateway protocol of the Internet, routing traffic between distinct Autonomous Systems (ASes).
*   **Path-Vector:** Instead of using abstract distance metrics, BGP advertisements contain the complete sequence of Autonomous System Numbers (ASN path) a packet must traverse to reach the destination.
*   **Loop Prevention:** If a router sees its own ASN in the AS path of an advertisement, it immediately discards the route.
*   **Routing Decisions:** Based heavily on network policies, peering agreements, and hop paths rather than technical cost metrics.

### Q10: What is DNS caching and where does it occur?
DNS caching reduces query latency and network traffic by storing DNS lookup results locally for the duration of their Time-to-Live (TTL):
1.  **Browser Cache:** The web browser maintains its own short-lived DNS cache.
2.  **OS Cache:** If not found in the browser, the OS queries its local resolver cache (e.g., DNS client service).
3.  **ISP/Recursive Resolver Cache:** If not found locally, the query goes to the recursive resolver, which caches records retrieved from authoritative servers.

### Q11: Explain the difference between Recursive and Iterative DNS queries.
*   **Recursive Query:** The client demands that the DNS server resolve the domain completely. The queried DNS resolver takes on the burden of contacting root, TLD, and authoritative servers, returning either the final IP or an error.
*   **Iterative Query:** The DNS server returns the best answer it has (e.g., a referral to a TLD server). The client (resolver) must make subsequent queries itself to find the IP.

### Q12: Explain the HTTP Status Code 3xx redirect categories (specifically 301, 302, 307, 308).
*   **301 (Moved Permanently):** The resource resides permanently under a new URL. Browsers cache this redirect, and subsequent requests are sent directly to the new URI. Often changes POST to GET.
*   **302 (Found / Temp Redirect):** The resource is temporarily elsewhere. Browsers do not cache this. Often changes POST to GET.
*   **307 (Temporary Redirect):** Temporary redirect where the HTTP method and request body MUST NOT be changed from the original request.
*   **308 (Permanent Redirect):** Permanent redirect where the HTTP method and request body MUST NOT be changed.

### Q13: Explain CORS (Cross-Origin Resource Sharing).
CORS is a browser security mechanism that allows or restricts web applications running at one origin (domain, protocol, and port) from accessing resources on a different origin.
*   **Same-Origin Policy (SOP):** The default browser restriction.
*   **Preflight Request:** For unsafe methods (like PUT, DELETE, or custom headers), the browser sends an `OPTIONS` request to verify if the foreign domain permits the operation via headers like `Access-Control-Allow-Origin`.

### Q14: Explain the purpose of HTTP headers: Keep-Alive, Cache-Control, and ETag.
*   **Keep-Alive:** Instructs the browser and server to reuse the same TCP connection for multiple HTTP requests/responses, saving overhead from recurrent handshakes.
*   **Cache-Control:** Specifies caching policies (e.g., `no-store`, `no-cache`, `max-age=3600`) defining how and for how long responses can be cached.
*   **ETag (Entity Tag):** A unique identifier/hash representing a specific version of a resource. Used for validation: the browser sends the ETag in `If-None-Match`, and if the resource has not changed, the server returns a `304 Not Modified` without re-sending the payload.

### Q15: What is the Spanning Tree Protocol (STP) and why is it necessary?
STP (**IEEE 802.1D**) is a Layer 2 protocol designed to prevent loops in Ethernet networks with redundant paths.
*   **The Problem:** Redundant links create broadcast storms, frame duplication, and MAC table instability.
*   **The Solution:** STP elects a **Root Bridge**, computes the shortest path to it for all other switches, and dynamically disables (blocks) redundant paths. If an active path fails, the blocked path is automatically unblocked.

### Q16: Compare SNAT (Source NAT) and DNAT (Destination NAT).
*   **SNAT:** Modifies the source IP address in the packet header. Used when internal private LAN hosts initiate connections to external public networks, mapping private IPs to a public IP.
*   **DNAT:** Modifies the destination IP address in the packet header. Used when external hosts initiate connections to a public IP, mapping them to a specific internal private server (often called port forwarding).

### Q17: What is Carrier Sense Multiple Access with Collision Detection (CSMA/CD)?
A media access control protocol used in shared half-duplex Ethernet networks:
1.  **Carrier Sense:** A node listens to the physical cable to see if another node is transmitting.
2.  **Multiple Access:** Multiple nodes share the same physical cable.
3.  **Collision Detection:** If two nodes transmit simultaneously, a collision occurs. The nodes detect the voltage spike, stop transmitting, send a jam signal to notify the network, and wait a random backoff time (using the Exponential Backoff Algorithm) before retrying.

### Q18: What is Carrier Sense Multiple Access with Collision Avoidance (CSMA/CA)?
Used in wireless networks (**IEEE 802.11**) where collision detection is impossible because wireless nodes cannot transmit and listen on the same channel simultaneously:
1.  **Carrier Sense:** The node listens to the wireless channel.
2.  **Avoidance:** If the channel is idle, the node waits a brief period (IFS) and transmits.
3.  **RTS/CTS (Optional):** Nodes send a Request to Send (RTS) frame, and the receiver replies with a Clear to Send (CTS) frame, reserving the channel and preventing the "hidden node" problem.
4.  **Acknowledgment:** Receivers send an explicit `ACK` frame. No ACK means a collision occurred, prompting retransmission.

### Q19: What is ARP Spoofing (ARP Poisoning)?
ARP Spoofing is a local area network attack where an attacker sends forged ARP messages onto a LAN.
*   **Mechanism:** The attacker associates their physical MAC address with the logical IP address of a legitimate target (such as the default gateway).
*   **Result:** Local traffic intended for the gateway is routed to the attacker, enabling man-in-the-middle (MITM) eavesdropping, packet modification, or denial of service.

### Q20: Explain IP fragmentation and why it can be a risk.
When an IP packet's size exceeds the Maximum Transmission Unit (MTU) of a transit link, a router splits it into smaller fragments:
*   **Flags & Fragment Offset:** Fields in the IP header used to reconstruct the packet at the destination.
*   **Downside:** Increases CPU overhead, and if any single fragment is lost, the entire original packet must be retransmitted.
*   **Security Risks:** Exploits like "Teardrop" send overlapping or invalid offsets to crash the target's TCP/IP reassembly engine.

### Q21: What is Anycast routing and where is it used?
Anycast is a routing technique where a single destination IP address is assigned to multiple physical servers globally.
*   **Mechanism:** Routers use BGP to route packets to the topologically nearest physical instance sharing that IP.
*   **Use Cases:** Content Delivery Networks (CDNs) to serve static files with low latency, and Root DNS servers to distribute traffic load and mitigate DDoS attacks.

### Q22: What is the difference between MTU and MSS?
*   **MTU (Maximum Transmission Unit):** The maximum physical size of a packet (including IP header, transport header, and payload) that can be transmitted over a physical link layer (typically 1500 bytes for Ethernet).
*   **MSS (Maximum Segment Size):** The maximum amount of application data (payload only) that TCP can accept in a single segment. Configured as: $\text{MSS} = \text{MTU} - \text{IP Header (20 bytes)} - \text{TCP Header (20 bytes)} = 1460 \text{ bytes}$.

### Q23: What is Path MTU Discovery (PMTUD)?
PMTUD is a mechanism used by hosts to determine the lowest MTU along a network path to avoid packet fragmentation:
1.  The sender transmits packets with the **DF (Don't Fragment)** bit set to 1 in the IP header.
2.  If a transit router with a lower MTU receives the packet, it drops it and returns an **ICMP Type 3 Code 4 (Destination Unreachable, Fragmentation Needed)** message specifying its link MTU.
3.  The sender adjusts its MSS downward and repeats the process until packets traverse the path successfully.

### Q24: What are the HTTP methods and their idempotency?
*   **Idempotent:** Making multiple identical requests yields the same server state as a single request.
    *   **GET / HEAD:** Safe and idempotent.
    *   **PUT:** Idempotent (replaces the resource completely).
    *   **DELETE:** Idempotent (subsequent deletes do not change the fact that the resource is gone).
*   **Non-Idempotent:**
    *   **POST:** Non-idempotent (creates a new resource on every call).
    *   **PATCH:** Typically non-idempotent (can apply incremental updates, e.g., `add $10`).

### Q25: What is DNSSEC and how does it prevent cache poisoning?
*   **The Problem:** Standard DNS uses unauthenticated UDP packets, letting attackers forge DNS responses (cache poisoning).
*   **DNSSEC:** Adds cryptographic digital signatures to existing DNS resource records.
*   **Mechanism:** Resolvers verify signatures using public-key cryptography and a chain of trust starting from the Root Zone, guaranteeing origin authenticity and data integrity.

### Q26: What is a VLAN Tag (IEEE 802.1Q)?
A 4-byte header inserted into a standard Ethernet frame between the Source MAC and EtherType fields:
*   **TPID (2 bytes):** Identifies the frame as an 802.1Q tagged frame.
*   **TCI (2 bytes):** Contains the Priority Code Point (PCP) for QoS and the 12-bit **VLAN ID (VID)** supporting up to 4,096 distinct logical networks.

### Q27: Compare Go-Back-N (GBN) and Selective Repeat (SR) ARQ protocols.
*   **Go-Back-N:** The sender can transmit up to $N$ unacknowledged packets. If a packet is lost, the receiver discards all subsequent out-of-order packets. The sender must retransmit the lost packet and **all** subsequent packets in the window.
*   **Selective Repeat:** The receiver maintains a buffer for out-of-order packets and sends individual selective ACKs (SACK) for received frames. The sender only retransmits the specific packets that were lost or corrupted.

### Q28: What is a Socket and what parameters define a socket pair?
A socket is an endpoint abstraction in an operating system used for sending or receiving data over a network. A connection is uniquely defined across the network by a **Socket Pair (4-tuple)**:
1.  Source IP Address
2.  Source Port Number
3.  Destination IP Address
4.  Destination Port Number

### Q29: What is Traffic Shaping vs Traffic Policing?
*   **Traffic Shaping:** Buffers excess packets in queue buffers to smooth out bursts, keeping egress traffic rate within a predefined profile. Introduces latency but avoids packet drops.
*   **Traffic Policing:** Instantly drops or re-marks packets that exceed the designated traffic limit profile. Does not introduce latency but causes packet drops, forcing TCP to scale back.

### Q30: Explain DHCP Relay Agents and why they are necessary.
*   **The Problem:** DHCP Discover messages are Layer 2 broadcasts, which routers block by default. Thus, a DHCP server cannot natively serve clients on other subnets.
*   **The Solution:** A DHCP Relay Agent configured on a router intercepts the local DHCP broadcasts, encapsulates them into unicast UDP packets, and routes them directly to the remote central DHCP server.

### Q31: What is the difference between Symmetric and Asymmetric Encryption?
*   **Symmetric:** Uses a single shared key for both encryption and decryption (e.g., AES). Fast, computationally light, but safe key distribution is difficult.
*   **Asymmetric:** Uses a mathematically linked key pair: a Public key (for encryption) and a Private key (for decryption, e.g., RSA, ECC). Slower, computationally expensive, but resolves the key-sharing dilemma.

### Q32: What is the difference between Layer 4 and Layer 7 Load Balancing?
*   **Layer 4 (Transport):** Routes traffic based solely on protocol, IP addresses, and TCP/UDP ports. It is fast, lightweight, does not inspect the payload, and cannot make decisions based on application content.
*   **Layer 7 (Application):** Decrypts and inspects the application layer payload (HTTP headers, cookies, URLs). It is computationally heavier but allows advanced routing (e.g., path-based routing, cookie stickiness, SSL termination).

### Q33: How does HTTPS establish a secure session (SSL/TLS Handshake)?
1.  **Client Hello:** Client sends supported TLS versions, cipher suites, and a random number ($R_C$).
2.  **Server Hello & Certificate:** Server sends chosen cipher suite, its digital certificate (containing its public key), and a random number ($R_S$).
3.  **Key Exchange (Client):** Client verifies the certificate with CAs, generates a **Pre-Master Secret**, encrypts it with the server's public key, and sends it.
4.  **Session Key Generation:** Both compute the **Master Secret (Session Key)** using $R_C$, $R_S$, and the Pre-Master Secret.
5.  **Finished:** Both send encrypted finished messages to confirm symmetric encryption is active.

### Q34: What is the TCP Sliding Window?
The TCP sliding window is a variable-sized buffer that controls how many bytes of unacknowledged data a sender can transmit. The receiver continually updates the `Window Size` field in its ACK packets, indicating its remaining buffer space. This prevents the sender from overflowing the receiver's socket buffer.

### Q35: What is TCP Slow Start?
Slow Start is the initial phase of TCP congestion control.
*   **Mechanism:** The Congestion Window ($cwnd$) starts at a small size (e.g., 10 MSS). For every received ACK, $cwnd$ is incremented by 1 MSS (exponential growth).
*   **Termination:** Exponential growth continues until $cwnd$ reaches the Slow Start Threshold ($ssthresh$) or a packet loss is detected.

### Q36: Explain TCP Congestion Avoidance.
*   **Phase Trigger:** Entered once $cwnd$ exceeds the $ssthresh$.
*   **Mechanism:** Rather than doubling every Round Trip Time (RTT), $cwnd$ increases linearly by approximately 1 MSS per RTT (Additive Increase). This cautious growth continues until congestion is detected.

### Q37: Explain TCP Fast Retransmit and Fast Recovery.
*   **Fast Retransmit:** If a sender receives **3 duplicate ACKs** for the same packet, it assumes that packet was lost. Rather than waiting for the retransmission timeout (RTO) to expire, it immediately retransmits the missing segment.
*   **Fast Recovery:** Instead of resetting $cwnd$ back to 1 (which occurs on timeout), the sender drops $ssthresh$ to $\frac{1}{2} \times cwnd$, sets $cwnd$ to $ssthresh + 3$ (to account for buffered segments), and continues transmitting linearly (Multiplicative Decrease).

### Q38: What are DNS Resource Records (A, AAAA, CNAME, MX, TXT)?
*   **A:** Maps a domain name to an IPv4 address.
*   **AAAA:** Maps a domain name to an IPv6 address.
*   **CNAME (Canonical Name):** Maps an alias domain name to another domain name (redirects names).
*   **MX (Mail Exchanger):** Specifies the mail servers responsible for receiving email for the domain.
*   **TXT:** Stores arbitrary text, commonly used for domain verification and email security (SPF, DKIM).

### Q39: What is a Content Delivery Network (CDN) and how does it work?
A CDN is a globally distributed network of proxy servers (Edge nodes) that caches and delivers static/dynamic web content to users. It routes requests to the nearest edge server using Anycast or DNS redirection, drastically reducing latency and offloading load from origin servers.

### Q40: What is IP Spoofing and how is it prevented?
IP Spoofing is the creation of IP packets with a forged source IP address to hide sender identity or impersonate a trusted system.
*   **Prevention:** Routers deploy **unicast Reverse Path Forwarding (uRPF)**, which verifies whether incoming packets arrive on the interface that would be used to route a packet back to that source IP.

### Q41: What is a Broadcast Storm and how does it happen?
A broadcast storm occurs when Layer 2 broadcast frames circulate endlessly in a network loop (due to redundant switch paths without STP). Because Ethernet frames lack a TTL (Time-to-Live) field, they loop forever, consuming all bandwidth and crashing switch MAC engines.

### Q42: What is the difference between Inter-VLAN routing options?
*   **Router-on-a-Stick:** Uses a single physical interface on a router configured with multiple logical sub-interfaces, each tagged with an 802.1Q VLAN ID. Bandwidth is bottlenecked by the single trunk link.
*   **Layer 3 Switch:** Uses internal high-speed virtual routing interfaces called **Switch Virtual Interfaces (SVIs)**. Routing happens at hardware ASIC speeds, yielding much higher throughput.

### Q43: What is the purpose of the ARP Cache?
The ARP cache is a temporary look-up table in an OS that maps IP addresses to MAC addresses. It eliminates the need to broadcast an ARP request for every single packet sent, lowering network congestion and reducing latency.

### Q44: What is the difference between P2P and Client-Server scalability?
*   **Client-Server:** Scalability is limited by server bandwidth and hardware. As clients increase, performance degrades unless server capacity is scaled up.
*   **P2P:** Self-scaling. Every new peer joining the network adds storage, CPU, and upload bandwidth, meaning network capacity naturally increases with demand.

### Q45: What is the difference between the WPA2 and WPA3 wireless protocols?
*   **WPA2:** Uses the 4-way handshake which is vulnerable to offline dictionary attacks if an attacker intercepts the handshake frames (KRACK attack).
*   **WPA3:** Replaces the handshake with **Simultaneous Authentication of Equals (SAE)**, protecting against offline dictionary attacks, ensuring forward secrecy, and providing stronger cryptographic suites.

### Q46: What is a socket pair 4-tuple?
It is the unique identifier for any active TCP or UDP connection on a network. It consists of:
`[Source IP, Source Port, Destination IP, Destination Port]`. No two concurrent connections on a host can share the exact same 4-tuple.

### Q47: What is the Loopback Interface and its IP addresses?
The loopback interface is a virtual network interface inside an operating system.
*   **IPv4:** `127.0.0.1` (the whole class `127.0.0.0/8` is reserved).
*   **IPv6:** `::1`.
*   Packets sent here never leave the local TCP/IP stack, allowing developers to test network server software locally.

### Q48: What is FTP Active vs Passive mode?
*   **Active Mode:** Client connects from random port $N$ to FTP Port 21. The server then initiates the data connection from Port 20 back to client port $N+1$. Often blocked by client-side firewalls.
*   **Passive Mode:** Client connects from random port $N$ to FTP Port 21 and requests passive transfer. The server opens a random high port $M$ and tells the client to connect to $M$ for data. Highly firewall-friendly.

### Q49: What is the difference between RIP and OSPF?
*   **RIP (Routing Information Protocol):** Distance-vector, simple, uses hop count as metric (max 15 hops), slow convergence, broadcasts updates every 30 seconds.
*   **OSPF (Open Shortest Path First):** Link-state, complex, uses link cost/bandwidth as metric, fast convergence, uses multicast to flood incremental link state changes inside designated hierarchical areas.

### Q50: What is Telnet and why was it replaced by SSH?
*   **Telnet:** A legacy network protocol for remote terminal sessions. Transmits all commands, usernames, and passwords in clear text over port 23.
*   **SSH (Secure Shell):** Replaced Telnet by encrypting all traffic (commands and credentials) over port 22, preventing packet sniffing and credential theft.
