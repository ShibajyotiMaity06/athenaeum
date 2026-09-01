# Computer Networks - Hard Interview Questions

### Q1: Explain HTTP/3. How does it solve the challenges of HTTP/2 using QUIC (UDP)?
HTTP/2 multiplexes streams over a single TCP connection, but suffers from **TCP-level Head-of-Line (HoL) Blocking**: if one TCP packet is lost, all streams stall while TCP retransmits and reorders.
*   **The QUIC Solution:** QUIC (Quick UDP Internet Connections) operates over UDP and implements connection-state tracking inside the user-space application layer.
*   **Independent Streams:** Each HTTP/3 stream is treated as an independent logical path. A packet loss on Stream A only blocks Stream A; Stream B and Stream C continue transmitting without delay.
*   **0-RTT Handshake:** Combines connection and TLS 1.3 handshakes into a single round trip, and supports 0-RTT session resumption.
*   **Connection Migration:** Connections are identified by a 64-bit **Connection ID** rather than the IP-port 4-tuple, allowing a mobile device to switch from Wi-Fi to cellular data without interrupting active downloads.

### Q2: Deep dive into TLS 1.3 vs TLS 1.2 handshakes. What makes TLS 1.3 faster and more secure?
*   **Speed (1-RTT vs 2-RTT):**
    *   **TLS 1.2** requires two full round-trips (2-RTT) to negotiate cipher suites, exchange keys via DH, and verify certificates.
    *   **TLS 1.3** reduces this to a single round-trip (1-RTT) by guessing the client's key exchange algorithm and sending the key share in the initial `Client Hello`.
*   **0-RTT Resumption:** TLS 1.3 allows clients to send encrypted application data on the very first packet when reconnecting to a known server using Pre-Shared Keys (PSK).
*   **Hardened Security:**
    *   TLS 1.3 removes obsolete/vulnerable cryptographic primitives (e.g., MD5, SHA-1, RC4, DES, static RSA key exchange).
    *   It mandates **Perfect Forward Secrecy (PFS)** by forcing Ephemeral Diffie-Hellman (ECDHE) for all key exchanges, ensuring that a future private key compromise cannot decrypt past sessions.

### Q3: Explain TCP BBR Congestion Control and how it differs from loss-based algorithms.
*   **Loss-Based (Cubic, Reno):** These assume packet loss is a direct indicator of network congestion. They aggressively ramp up throughput until a packet is dropped, filling up bottleneck buffers (causing **Bufferbloat** and latency spikes) and then cutting their window size in half.
*   **TCP BBR (Bottleneck Bandwidth and RTT):** BBR is a model-based algorithm developed by Google.
*   **The Mechanism:** Instead of looking for packet drops, BBR actively measures:
    1.  **RTprop (Round-Trip Propagation Time):** The absolute minimum physical RTT of the path.
    2.  **BtlBw (Bottleneck Bandwidth):** The maximum capacity of the path.
*   **Execution:** BBR maintains an internal model and paces packet delivery to match the exact bottleneck bandwidth without overfilling router queues, keeping latency low and throughput high even over lossy wireless links.

### Q4: Compare DNS over HTTPS (DoH) and DNS over TLS (DoT).
*   **DoT (DNS over TLS):**
    *   Encapsulates DNS queries inside TLS over a dedicated port (**853**).
    *   Easily monitored, blocked, or rate-limited by network administrators and firewalls because of the dedicated port.
*   **DoH (DNS over HTTPS):**
    *   Encapsulates DNS queries inside standard HTTP/2 or HTTP/3 frames over port **443** (sharing the same port as normal web traffic).
    *   Highly resistant to censorship and firewalls because it is indistinguishable from standard HTTPS traffic. However, it bypasses local network security controls and enterprise DNS filters.

### Q5: Compare Consistent Hashing vs Traditional Hashing in Load Balancing.
*   **Traditional Hashing ($\text{Node} = \text{Hash}(key) \pmod N$):**
    *   If the number of load balancer backend nodes $N$ changes (due to scale-up or failure), almost all keys map to entirely different nodes, destroying system caches.
*   **Consistent Hashing:**
    *   Keys and backend nodes are mapped onto a circular 360-degree mathematical ring (hash ring).
    *   A key is routed to the first node encountered moving clockwise from the key's hash position.
    *   **Impact:** When a node is added or removed, only a fraction ($\frac{1}{N}$) of the keys need to be rehashed and migrated.
    *   **Virtual Nodes:** Scales keys evenly by mapping a single physical node to multiple virtual positions on the ring to prevent hot spots.

### Q6: What are SYN Flood attacks, and how do SYN Cookies mitigate them?
*   **SYN Flood:** An attacker floods a server with TCP `SYN` packets using spoofed source IPs. The server responds with `SYN-ACK` and allocates memory in its **SYN backlog queue** for the half-open connection. Because the IP is spoofed, no `ACK` arrives. The backlog queue quickly fills up, causing the server to reject legitimate connections.
*   **SYN Cookies Mitigation:**
    *   The server ceases allocating any backlog queue state when receiving a `SYN`.
    *   Instead, it encodes the connection parameters (timestamp, MSS, etc.) into the **Initial Sequence Number (ISN)** of its `SYN-ACK` using a cryptographic hash key.
    *   When the legitimate client responds with an `ACK` containing `acknowledgment number = ISN + 1`, the server decrypts and verifies the sequence number. If valid, it allocates the socket state immediately, neutralizing the attack.

### Q7: Explain TCP TIME-WAIT reuse/recycle issues, particularly behind NAT.
*   `tcp_tw_reuse`: Allows the kernel to safely reuse a socket in `TIME-WAIT` state for a new outgoing connection if the timestamp of the incoming packet is strictly greater than the most recent packet. Highly safe for outgoing client connections.
*   `tcp_tw_recycle` (Deprecated/Removed in modern kernels): Forcefully reclaimed `TIME-WAIT` sockets.
    *   **The Danger:** It tracked timestamps per remote IP. If multiple clients sat behind a single NAT (sharing one public IP), their local clocks would differ. The kernel would drop legitimate packets arriving from clients with slightly slower clocks, causing random connection drops.

### Q8: Explain TCP Fast Open (TFO) mechanics.
TFO (RFC 7413) allows data exchange to begin during the initial 3-way handshake:
1.  **Requesting Cookie:** In the first connection, the client requests a cryptographic TFO cookie in its standard `SYN` packet. The server validates and returns a cookie in the `SYN-ACK`.
2.  **Using Cookie:** On subsequent connections, the client sends its `SYN` packet containing the **TFO Cookie** along with the **initial application payload** (e.g., HTTP request).
3.  **Validation:** The server validates the cookie. If valid, the server immediately passes the payload to the application layer and returns the `SYN-ACK` along with the response data before the client's final `ACK` even arrives, saving 1 full RTT.

### Q9: What is Software Defined Networking (SDN) and the separation of planes?
SDN decouples the network control system from the physical forwarding hardware:
*   **Control Plane:** The centralized "brain" (SDN Controller, e.g., OpenDaylight) that calculates optimal paths, defines routing policies, and programs the network.
*   **Data Plane:** The dumb physical or virtual switches (e.g., Open vSwitch) that purely forward packets based on the flow tables pushed down by the control plane.
*   **Southbound API:** The communication protocol (e.g., OpenFlow) used by the controller to program the data plane devices.

### Q10: Explain VXLAN (Virtual Extensible LAN) encapsulation.
VXLAN is a MAC-in-UDP overlay encapsulation protocol used to scale Layer 2 VLAN networks across Layer 3 cloud data centers:
*   **Scalability:** Traditional VLANs are limited to 4,096 IDs. VXLAN uses a 24-bit **VXLAN Network Identifier (VNI)**, supporting up to 16 million logical segments.
*   **Encapsulation:** Wraps an Ethernet Frame in a UDP packet (port 4789) over IP.
*   **VTEP (VXLAN Tunnel End Point):** Physical or virtual devices that perform the encapsulation/decapsulation, allowing isolated Layer 2 networks to span seamlessly across a routed Layer 3 physical backbone.

### Q11: Explain Multipath TCP (MPTCP) architecture.
MPTCP (RFC 8684) allows a single TCP connection to bundle and transmit traffic over multiple physical network paths (e.g., Wi-Fi and 5G simultaneously):
*   **Subflows:** MPTCP breaks a connection into multiple underlying TCP connections called subflows, each mapped to different IP interfaces.
*   **State Management:** Initiated via the `MP_CAPABLE` option in the TCP `SYN` header.
*   **Benefits:** Smooth failover (seamless handover if Wi-Fi drops) and increased aggregate bandwidth (pooling links).

### Q12: What is Bufferbloat and how do AQM algorithms solve it?
*   **Bufferbloat:** Occurs when network devices (routers, switches) are configured with excessively large packet memory buffers. Under high traffic, these buffers fill up, introducing immense queuing delay (hundreds of milliseconds) without dropping packets, which prevents TCP from detecting congestion and scaling down.
*   **Active Queue Management (AQM):** Algorithms like **CoDel (Controlled Delay)** or **FQ-CoDel** monitor the time packets spend waiting inside queue buffers.
*   **Mechanism:** If the queuing delay exceeds a target limit (e.g., 5ms), the router begins proactively dropping or marking packets to signal the sender's TCP to reduce its window *before* the buffer overflows, keeping latency low.

### Q13: Explain Explicit Congestion Notification (ECN).
ECN (RFC 3168) allows routers to signal impending network congestion without dropping packets:
1.  **Marking (Router):** When a router's queue starts filling up, it alters the 2-bit ECN field in the IP header of transit packets to `11` (Congestion Experienced - CE).
2.  **Echo (Receiver):** The receiver notices the CE mark, sets the **ECE (ECN-Echo)** flag in its TCP `ACK` header, and sends it back to the sender.
3.  **Action (Sender):** The sender receives the ECE ACK, reduces its Congestion Window ($cwnd$) as if a packet loss had occurred, and sets the **CWR (Congestion Window Reduced)** flag in the next data packet to stop further ECE signals.

### Q14: Detail the interaction between Nagle's Algorithm and TCP Delayed ACKs.
*   **Nagle's Algorithm:** Prevents small packets by withholding data until the sender has accumulated a full MSS (Maximum Segment Size) worth of data, or until all previously sent packets are ACKed.
*   **Delayed ACKs:** The receiver waits (up to 200ms) to send an `ACK`, hoping to piggyback it on outgoing data or merge it with another incoming packet.
*   **The Deadlock:** If an application writes small chunks of data sequentially, Nagle's holds back the second chunk because the first chunk hasn't been ACKed. Concurrently, the receiver delays sending the ACK because it is waiting for more data. The connection stalls for 200ms, causing massive latency.
*   **Fix:** Disable Nagle's via the `TCP_NODELAY` socket option.

### Q15: Explain Path MTU Black Holes and how PLPMTUD resolves them.
*   **The Black Hole:** PMTUD relies on receiving ICMP "Fragmentation Needed" packets from routers. If firewalls along the path block all ICMP traffic, the sender never receives these messages, and large packets are dropped silently without any error reporting - a "black hole."
*   **PLPMTUD (Packetization Layer Path MTU Discovery):** Resolves this by probing the path without ICMP.
*   **Mechanism:** The transport layer (TCP/QUIC) sends actual data packets of varying sizes (probes) with the DF bit set. If a probe packet is ACKed, the PMTU is verified. If a probe fails to get an ACK but smaller packets succeed, the protocol adjusts the MTU downward.

### Q16: How does BGP Hijacking work, and how does RPKI mitigate it?
*   **BGP Hijacking:** An attacker's router advertises IP prefixes that it does not own.
    *   **The Exploit:** Because BGP historically relies on absolute trust, neighboring routers propagate this advertisement. Traffic destined for the victim is routed to the attacker, enabling interception or blackholing.
*   **RPKI (Resource Public Key Infrastructure):**
    *   Uses public-key cryptography to associate an IP address prefix with an authorized Autonomous System Number (ASN).
    *   **ROA (Route Origin Authorization):** A cryptographically signed record detailing which AS can advertise which IP range. Routers download these records and automatically drop invalid BGP announcements.

### Q17: Explain the IPv6 Extension Headers and why the IPv6 header lacks a checksum.
*   **IPv6 Header Checksum Elimination:** Routers spent valuable CPU cycles computing and updating the IPv4 header checksum at every hop (due to TTL decrement). IPv6 eliminated the header checksum entirely, relying on the fact that Layer 2 (Ethernet) and Layer 4 (TCP/UDP) already enforce checksum validation.
*   **Extension Headers:** Instead of using fixed/optional fields that slow down processing, IPv6 uses a simplified 40-byte base header. Additional routing, security (IPsec), and fragmentation parameters are appended as **Extension Headers** in a linked-list chain via the `Next Header` field, letting intermediate routers skip processing options they do not need.

### Q18: What is IGMP Snooping and how does it prevent multicast flooding?
*   **The Problem:** At Layer 2, switches do not inspect IP addresses and treat multicast frames as broadcast frames, flooding them to every single port and wasting bandwidth.
*   **IGMP Snooping:** The switch actively intercepts (snoops) Layer 3 IGMP Join/Leave messages sent between hosts and routers.
*   **The Solution:** The switch builds a dynamic Layer 2 multicast forwarding table, mapping specific multicast IP groups to only those physical ports that have actively requested the stream, preventing local network congestion.

### Q19: Explain SCTP and its advantages over TCP.
SCTP (Stream Control Transmission Protocol) is a Transport Layer protocol combining features of TCP and UDP:
*   **Multi-Homing:** Allows a single connection endpoint to bind to multiple IP addresses. If one physical path fails, SCTP seamlessly shifts traffic to the backup IP without session termination.
*   **Multi-Streaming:** Transmits data across multiple independent logical streams. A packet loss on Stream 1 does not block data delivery on Stream 2, eliminating head-of-line blocking inside the connection.
*   **4-Way Handshake:** Prevents SYN flood attacks by using a cryptographically signed cookie exchange during connection setup before allocating server-side state.

### Q20: Explain how STUN, TURN, and ICE protocols enable WebRTC NAT traversal.
P2P protocols like WebRTC require direct connection endpoints, which is difficult behind restrictive NATs:
*   **STUN (Session Traversal Utilities for NAT):** Allows a local client to discover its public-facing IP, port, and NAT type. Works for open or full-cone NATs.
*   **TURN (Traversal Using Relays around NAT):** If both peers are behind symmetric NATs, direct routing is impossible. TURN servers act as an intermediary media relay, forwarding all traffic. Very expensive in bandwidth.
*   **ICE (Interactive Connectivity Establishment):** A framework that aggregates all possible connection paths (local IPs, STUN-discovered public IPs, and TURN relays) and tests them in parallel to establish the most direct, lowest-latency path.

### Q21: Explain HPACK compression in HTTP/2.
HTTP headers are verbose and repetitive. HPACK compresses them to save bandwidth:
*   **Static Table:** A pre-defined, read-only list of 61 common HTTP headers and values (e.g., `:method: GET`, `status: 200`).
*   **Dynamic Table:** A mutable list populated with custom headers encountered during the lifetime of the connection.
*   **Huffman Coding:** Compress individual text strings using static Huffman translation codes.
*   Instead of sending long strings, HPACK sends the brief index numbers of the static or dynamic tables.

### Q22: Explain the difference between Link Aggregation (LACP) and Spanning Tree Protocol (STP).
*   **STP:** Designed to prevent loops. It detects redundant physical links and actively disables (blocks) them, keeping them idle as cold standbys.
*   **LACP (Link Aggregation Control Protocol - IEEE 802.3ad):** Bundles multiple physical Ethernet links into a single logical high-bandwidth channel (Link Aggregation Group - LAG).
*   **Difference:** LACP actively utilizes all bundled paths simultaneously, sharing load and multiplying bandwidth, whereas STP blocks redundant physical paths entirely.

### Q23: Explain BGP Route Leaks and how to prevent them.
*   **Route Leak:** A routing error where an Autonomous System (AS) receives a prefix advertisement from one provider/peer and mistakenly propagates it to another provider/peer.
*   **The Effect:** Traffic is redirected through the leaking AS, overloading its internal routers and causing major outages.
*   **Prevention:** Enforced using **BGP Community Attributes**, which label incoming routes (e.g., "no-export") to explicitly restrict where they can be advertised, and BGP ingress filters.

### Q24: What is MPLS and how does it speed up routing?
*   **MPLS (Multiprotocol Label Switching):** A protocol operating between Layer 2 and Layer 3 (often called Layer 2.5).
*   **Label Switching:** Instead of checking long IP destination routing tables at every hop, the ingress router appends a short, fixed-length **MPLS Label** to the packet.
*   **LSR (Label Switching Routers):** Intermediate routers forward packets based solely on these simple labels using lookup tables, bypassing expensive IP routing lookups and enabling fast Traffic Engineering.

### Q25: Describe TCP Window Scaling and why it is necessary for high BDP networks.
*   **The Problem:** The standard TCP header allocates only 16 bits for the Window Size, allowing a maximum receive window of 64 KB. In high **Bandwidth-Delay Product (BDP)** networks (e.g., 10 Gbps fiber links with 100ms latency), 64 KB is filled instantly, forcing the sender to halt and wait for ACKs, wasting massive bandwidth.
*   **The Solution (RFC 1323):** Introduces a **Window Scale Option** in the initial 3-way handshake. This 8-bit multiplier acts as a binary shift count, allowing the window scale to expand up to $2^{14} \times 64 \text{ KB} \approx 1 \text{ GB}$, keeping high-speed paths fully saturated.

### Q26: Explain Dynamic ARP Inspection (DAI) and its mechanism.
DAI is a security feature on Layer 2 switches that prevents ARP spoofing/poisoning attacks.
*   **Mechanism:** The switch maintains a database of valid IP-to-MAC mappings (built dynamically using **DHCP Snooping** bindings).
*   **Action:** When an ARP packet arrives on an untrusted port, the switch intercepts and validates its contents against this database. If the MAC or IP does not match the registered binding, the switch discards the ARP frame.

### Q27: Explain the split-brain scenario in high availability (HA) load balancers.
*   **Split-Brain:** Occurs when active-passive load balancer nodes lose their heartbeat/synchronization link but their external network connections remain active.
*   **The Consequence:** Both the primary and standby nodes assume the other is dead. Both nodes attempt to take control of the Virtual IP (VIP), responding to ARP requests simultaneously. This causes IP address conflicts, split traffic, session state destruction, and data corruption.
*   **Mitigation:** Redundant heartbeat physical links, STONITH ("Shoot The Other Node In The Head") power switches, and quorum voting systems.

### Q28: What is Segment Routing (SR) and how does it differ from traditional MPLS?
*   **Segment Routing:** A modern source-routing paradigm. The ingress node decides the packet's path and encodes the path directly in the packet header as an ordered list of instructions (segments).
*   **Difference:** Traditional MPLS requires heavy dynamic path-label protocols like LDP and RSVP-TE, requiring routers to store massive path states. Segment Routing removes these protocols, eliminating state management from transit routers and making it highly compatible with SDN controllers.

### Q29: Explain the difference between Anycast DNS and GeoIP DNS routing.
*   **Anycast DNS:** Multiple physical servers advertise the identical IP address via BGP. Packets are routed to the nearest instance based strictly on BGP path cost. Fast and resilient, but does not know the actual geographic location of the client.
*   **GeoIP DNS:** A single DNS server inspects the source IP of the client (or resolver via EDNS Client Subnet) and checks a geographic database to return the IP address of the datacenter physically closest to the user's location.

### Q30: What is the TCP Keepalive mechanism and how does it differ from HTTP Keep-Alive?
*   **TCP Keepalive:** An OS kernel feature. If a connection is idle, the kernel sends a tiny probe packet with an expired sequence number. If the remote host is alive, it returns an ACK. If no ACK is received after multiple retries, the kernel closes the dead socket.
*   **HTTP Keep-Alive:** An application-layer HTTP header that asks the remote web server to keep the underlying TCP connection open to handle subsequent HTTP requests, preventing the overhead of re-creating connections.

### Q31: Explain Flow Label in IPv6 vs DiffServ in IPv4.
*   **IPv4 DiffServ (6 bits):** Used for Quality of Service (QoS). Routers must parse and map packets into different queues based on these bits, which can slow down routing.
*   **IPv6 Flow Label (20 bits):** A dedicated field in the base header. It labels packets belonging to a specific communication flow (e.g., VoIP or real-time media). Intermediate routers can identify and route packets belonging to the same flow along the identical physical path using fast cache lookup tables, without needing to open or inspect payload headers.

### Q32: What is CARP and VRRP?
*   **VRRP (Virtual Router Redundancy Protocol):** An open standard protocol that groups multiple physical routers into a single logical "virtual router" sharing a single Virtual IP. If the active master fails, a backup router instantly assumes the VIP.
*   **CARP (Common Address Redundancy Protocol):** A secure BSD alternative to VRRP. It functions similarly but includes built-in cryptographic authentication and prevents patent restrictions associated with VRRP.

### Q33: Explain how TCP SACK (Selective Acknowledgment) works.
*   Without SACK, if packets 1, 2, 3, 4, 5 are sent and packet 3 is lost, the receiver can only send ACKs up to packet 2. The sender must retransmit packets 3, 4, and 5 (using GBN logic).
*   **With SACK:** The receiver appends a SACK option block to its ACK, explicitly stating: "Received packets 1, 2, and 4, 5." The sender reads this block and retransmits *only* the missing packet 3, drastically improving throughput over high-loss or wireless links.

### Q34: Describe the mechanics of a Smurf Attack.
*   **Mechanism:** An attacker sends a flood of ICMP Echo Requests (pings) to the broadcast address of a large network.
*   **The Exploit:** The attacker spoofs the source IP address of the ping to match the victim's IP address.
*   **The Result:** Every single host on the broadcast network responds by sending an ICMP Echo Reply directly to the spoofed victim IP. The massive volume of unsolicited responses saturates the victim's network link, causing a denial of service.
*   **Mitigation:** Configuring routers to block external directed broadcast packets.

### Q35: What is GRE (Generic Routing Encapsulation) and how does it compare to IPsec?
*   **GRE:** A simple tunneling protocol that can encapsulate any Layer 3 protocol (including multicast, broadcast, and non-IP protocols) inside a standard IP packet. It has no built-in encryption or security features.
*   **IPsec:** A robust suite of security protocols providing data encryption, integrity, and origin authentication. However, IPsec cannot natively encapsulate multicast or broadcast traffic.
*   **Hybrid (GRE over IPsec):** Organizations often run GRE to carry routing protocols (like OSPF multicast) and wrap it inside IPsec to secure the data.

### Q36: Explain the difference between OSPF Stub, Totally Stub, and NSSA areas.
OSPF uses specialized area types to minimize routing table sizes inside routers:
*   **Stub Area:** Blocks external routes (Type 5 LSAs). It uses a default route to exit.
*   **Totally Stubby Area:** Blocks both external routes (Type 5) and inter-area routes (Type 3). Relies purely on a default route to exit the area.
*   **NSSA (Not-So-Stubby Area):** Blocks external LSAs but allows routers within the area to import external routes locally, converting them into a special Type 7 LSA, which is then translated back to Type 5 by the Area Border Router (ABR).

### Q37: Describe how MAC Address Flooding works and how to prevent it.
*   **The Attack:** An attacker floods a switch with thousands of fake MAC addresses.
*   **The Exploit:** The switch's CAM (Content Addressable Memory) table quickly fills up. Once full, the switch can no longer learn new MAC mappings.
*   **The Consequence:** The switch enters "fail-open" mode, behaving like a dumb hub by broadcasting all incoming unicast frames to all ports, allowing the attacker to sniff private network traffic.
*   **Mitigation:** **Port Security**, which limits the maximum number of MAC addresses allowed to be learned on a physical switch port and shuts down the port if exceeded.

### Q38: Prove why a 2-Way Handshake is mathematically insufficient for TCP.
A 2-way handshake (SYN, SYN-ACK) cannot reliably establish a connection over a lossy packet network.
*   **The Proof:** Suppose Client sends SYN, which is delayed. Client times out and sends a second SYN. Connection is established, data sent, and closed. Later, the first delayed SYN arrives at the Server.
*   **Failure:** The server responds with SYN-ACK and assumes a new connection is active (resource allocated). In a 2-way handshake, the server cannot know if the client received the SYN-ACK or if the SYN was an outdated duplicate. Only a 3-way handshake allows the client to confirm (via the third ACK) that it is actively synchronizing the sequence number, preventing duplicate historical connections.

### Q39: What is HSTS and how does it prevent SSL stripping?
*   **SSL Stripping:** An attacker intercepts the initial unencrypted HTTP connection attempt and proxies it, forcing the client to communicate in plain HTTP while the attacker talks HTTPS to the server.
*   **HSTS (HTTP Strict Transport Security):** An HTTP header (`Strict-Transport-Security`) that tells the browser that the site must *only* be accessed via HTTPS.
*   **The Defense:** Once the browser receives this header, it automatically converts all future `http://` link clicks to `https://` locally before sending any network packets, completely blocking SSL stripping.

### Q40: Explain the mechanics of a Slowloris DDoS attack.
Slowloris is an application-layer DDoS attack targeting web servers:
*   **Mechanism:** The attacker opens multiple connections to the target web server and sends partial HTTP headers (e.g., sending header fields one by one at extremely slow intervals, like every 10 seconds).
*   **The Exploit:** The server keeps these connection threads open, waiting for the headers to complete.
*   **The Result:** The server's connection pool/thread limit is reached, making it unable to accept legitimate incoming HTTP connections.
*   **Mitigation:** Restricting maximum connection timeouts, limiting concurrent connections per IP, or deploying reverse proxies like Nginx.

### Q41: Compare OFDMA in Wi-Fi 6 with OFDM in Wi-Fi 5.
*   **OFDM (Wi-Fi 5):** In any given transmission window, a single channel serves only one user at a time. Other users must wait, which increases latency in dense environments.
*   **OFDMA (Wi-Fi 6):** Divides a single channel into multiple smaller sub-carriers called **Resource Units (RUs)**.
*   **The Advantage:** Allows a single transmission to carry data for multiple distinct users simultaneously, drastically increasing spectral efficiency and lowering latency in high-density areas.

### Q42: Explain DNS Rebinding and its mitigation.
DNS Rebinding is an exploit that bypasses the browser's Same-Origin Policy (SOP):
1.  **Step 1:** Attacker's webpage makes a browser request to `attacker.com`. The attacker's DNS server responds with a very low TTL (e.g., 1 second) pointing to the attacker's server IP.
2.  **Step 2:** The browser loads malicious JS.
3.  **Step 3:** The JS makes a request to `attacker.com`. Since the TTL expired, the browser makes a new DNS query. The attacker's DNS now responds with a private IP (e.g., `192.168.1.1` - the local router).
4.  **The Exploit:** The browser executes the request, believing it is still communicating with the origin `attacker.com`, allowing the malicious script to read/write sensitive local router settings.
5.  **Mitigation:** DNS resolvers filtering out private IP addresses (RFC 1918) from external DNS queries.

### Q43: Explain the TCP TIME-WAIT Assassination attack.
TIME-WAIT Assassination is an exploit where an attacker forces a socket in `TIME-WAIT` to close prematurely.
*   **Mechanism:** If an attacker sends a spoofed `RST` packet with a valid sequence number to a socket sitting in the `TIME-WAIT` state, the OS kernel will accept it and immediately close the socket.
*   **Impact:** This destroys the protection of `TIME-WAIT`, allowing old delayed packets still routing through the internet to corrupt subsequent connections that open on that same port pair.

### Q44: How does the Spanning Tree Protocol elect a Root Bridge?
1.  Every switch boots up and assumes it is the Root Bridge, broadcasting **BPDU (Bridge Protocol Data Unit)** frames.
2.  Switches compare their **Bridge ID (BID)**, which consists of a 2-byte Priority (default 32768) and the switch's 6-byte MAC address.
3.  The switch with the **lowest BID** is elected as the Root Bridge. If priorities match, the switch with the lowest MAC address wins.

### Q45: Explain the role of the BGP Decision Process in detail.
When a router receives multiple BGP paths to the same prefix, it runs a step-by-step tie-breaker algorithm:
1.  Prefer the route with the highest **Weight** (proprietary to Cisco, local to router).
2.  Prefer the highest **Local Preference** (propagated within the AS).
3.  Prefer routes initiated by the local router (next-hop of `0.0.0.0`).
4.  Prefer the shortest **AS_PATH**.
5.  Prefer the lowest **Origin Type** (IGP is preferred over EGP, which is preferred over Incomplete).
6.  Prefer the lowest **Multi-Exit Discriminator (MED)** (metric negotiated between ASes).
7.  Prefer **eBGP** routes over **iBGP** routes.
8.  Prefer the path with the lowest IGP metric to the BGP next-hop.
9.  Prefer the oldest route (for eBGP).
10. Prefer the path from the router with the lowest **BGP Router ID**.

### Q46: What is PLPMTUD and how does it differ from PMTUD?
*   **PMTUD:** Operates reactively. It sets the DF bit and relies on transit routers sending back ICMP Type 3 Code 4 messages when a link is too small. If ICMP is filtered, it fails (black holes).
*   **PLPMTUD (RFC 4821):** Operates proactively inside the Transport layer (TCP/QUIC). It actively tests the path by sending actual application data packets as "probes" of varying sizes. It determines the correct path MTU based on whether those specific probes are ACKed, bypassing the dependency on ICMP feedback.

### Q47: Explain the difference between SCTP Multi-Homing and MPTCP.
*   **SCTP Multi-Homing:** Designed purely for high availability and redundancy. It maps a single connection to multiple local/remote IPs, but traffic is sent over only one primary active link. The other paths act as passive backups.
*   **MPTCP:** Designed for active load balancing and throughput aggregation. It splits a single socket connection into multiple concurrent subflows and transmits data actively and simultaneously across all paths, combining their bandwidth.

### Q48: Explain the 4-way handshake in WPA2 and the KRACK vulnerability.
*   **4-Way Handshake:** Establishes the Pairwise Transient Key (PTK) for data encryption using the Pairwise Master Key (PMK) without revealing the PMK.
    1.  AP sends ANonce.
    2.  Client generates SNonce, computes PTK, and sends SNonce + MIC (Message Integrity Code).
    3.  AP computes PTK, validates MIC, and sends Group Temporal Key (GTK) + MIC.
    4.  Client sends ACK.
*   **KRACK (Key Reinstallation Attack):** Exploits step 3. An attacker intercepts the Client's step 4 ACK. The AP, not receiving the ACK, retransmits step 3.
*   **The Exploit:** When the Client receives the retransmitted step 3, it reinstalls the identical encryption key (PTK), which resets the incremental transmit packet number (nonce) and replay counter to zero, allowing the attacker to decrypt and replay packets.

### Q49: Explain Explicit Congestion Notification (ECN) and how DCTCP exploits it. Why is ECN superior to drop-based signaling?
*   **Mechanism:** Instead of silently dropping packets to signal congestion, ECN-capable routers mark the IP header's `ECT`/`CE` bits when queue occupancy crosses an Active Queue Management (AQM) threshold. The receiver echoes the congestion signal back to the sender using the TCP `ECE`/`CWR` flags, letting the sender shrink its window *before* any loss occurs.
*   **Why superior to drops:** A dropped packet costs a full RTO/fast-retransmit round trip and wastes the bandwidth spent transmitting it. A marked packet still gets delivered, so congestion is signaled at essentially zero cost.
*   **DCTCP (Datacenter TCP):** Standard TCP treats a single CE mark like a loss event (halving cwnd). DCTCP instead measures the *fraction* of packets marked each RTT and scales the window reduction proportionally, keeping switch queues persistently near the AQM threshold (~tiny buffers). This delivers both ultra-low queueing latency and high burst tolerance inside datacenters.
*   **Requirement:** Both endpoints plus every intermediate router on the path must be ECN-enabled; tunnels/middleboxes that strip or ignore the bits force fallback to loss-based behavior.

### Q50: How does DNS cache poisoning work, and which mechanisms (randomization + DNSSEC) defend against it?
*   **The Attack:** A resolver accepts a forged response for a query it forwarded upstream. The attacker races the legitimate authoritative server, guessing matching parameters so the resolver accepts and caches malicious records (e.g., pointing `bank.com` to attacker IPs). The poison then propagates to every client of that resolver for the TTL duration.
*   **The Classic Weakness (Dan Kaminsky, 2008):** If an attacker can force queries for many non-existent subdomains, they get thousands of guesses against one cached NS referral - the birthday-paradox style race made fixed TXIDs breakable within seconds.
*   **Defenses:**
    1.  **Entropy randomization:** Randomized source ports (+~16 bits), random capitalization of query names (0x20 encoding), and unpredictable TXIDs make blind forgery probabilistically infeasible.
    2.  **Glue minimization / bailiwick checking:** Resolvers reject out-of-bailwick records inside referrals and additional sections, limiting what a forged reply may plant.
    3.  **DNSSEC:** Responses carry RRSIG digital signatures chained from the root trust anchor. Forged answers fail validation (`SERVFAIL` is returned instead of caching the poison). Note DNSSEC provides integrity/authenticity only - not confidentiality (that is DoT/DoH territory).
