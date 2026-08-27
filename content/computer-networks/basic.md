# Computer Networks - Basic Interview Questions

### Q1: What is a Computer Network?
A computer network is a collection of interconnected computing devices (nodes) that share resources, exchange data, and communicate via wired or wireless media.
*   **Nodes:** PCs, servers, routers, switches, IoT devices.
*   **Links:** Fiber optics, coaxial cables, copper wires, radio waves.
*   **Purpose:** Resource sharing (files, printers), communication (emails, video), and application hosting.

### Q2: What is the OSI model and list its 7 layers?
The Open Systems Interconnection (OSI) model is a conceptual framework standardizing network communication into seven logical layers:
1.  **Physical (Layer 1):** Transmits raw unstructured bit streams over physical media (electrical, optical, radio).
2.  **Data Link (Layer 2):** Provides reliable node-to-node frame delivery, error detection, and MAC addressing.
3.  **Network (Layer 3):** Handles packet routing, logical addressing (IP), and path determination.
4.  **Transport (Layer 4):** Ensures end-to-end reliability, flow control, congestion control, and segmenting (TCP/UDP).
5.  **Session (Layer 5):** Establishes, manages, and terminates communication sessions between applications.
6.  **Presentation (Layer 6):** Translates, encrypts, and compresses data (syntax layer, e.g., SSL/TLS, ASCII, JPEG).
7.  **Application (Layer 7):** Provides direct user interfaces and protocols for software applications (HTTP, DNS, SMTP).

### Q3: What is the TCP/IP model and its layers?
The TCP/IP model is a practical suite of communication protocols used on the modern Internet. It consolidates the OSI model into 4 or 5 layers:
1.  **Network Access (or Link) Layer:** Combines OSI's Physical and Data Link layers. Manages physical transmission and hardware addressing.
2.  **Internet Layer:** Equivalent to OSI's Network layer. Routes packets across networks using logical IP addresses.
3.  **Transport (Host-to-Host) Layer:** Matches OSI's Transport layer. Manages end-to-end communication, reliability, and flow control.
4.  **Application Layer:** Merges OSI's Session, Presentation, and Application layers. Provides high-level APIs and user services.

### Q4: What is the difference between TCP and UDP?
*   **TCP (Transmission Control Protocol):** Connection-oriented, guarantees ordered/reliable packet delivery, supports flow and congestion control, overhead is higher (20-byte header). Used for HTTP, FTP, SMTP.
*   **UDP (User Datagram Protocol):** Connectionless, best-effort/unreliable delivery, no flow/congestion control, minimal overhead (8-byte header). Used for DNS, VoIP, video streaming, gaming.

### Q5: What is DNS and how does it work?
Domain Name System (DNS) translates human-readable domain names (e.g., `example.com`) to machine-readable IP addresses (e.g., `192.0.2.1`).
*   **Resolving Name Server:** Receives queries from client machines.
*   **Root Name Server:** Directs the resolver to the Top-Level Domain (TLD) server (e.g., `.com`).
*   **TLD Name Server:** Directs the resolver to the Authoritative Name Server.
*   **Authoritative Name Server:** Contains the actual IP mapping and returns it to the resolver.

### Q6: What is a MAC address and how does it differ from an IP address?
*   **MAC Address (Media Access Control):** Physical, hardcoded 48-bit hex address assigned by the manufacturer (NIC level) for local node-to-node delivery (Data Link Layer).
*   **IP Address (Internet Protocol):** Logical, dynamic 32-bit (IPv4) or 128-bit (IPv6) software-assigned address used for end-to-end routing across different networks (Network Layer).

### Q7: What is ARP and how does it work?
Address Resolution Protocol (ARP) maps a known logical IP address to a physical MAC address on a local area network (LAN).
1.  **ARP Request:** Host broadcasts a packet asking, "Who has IP X.X.X.X? Tell MAC Y:Y:Y:Y."
2.  **ARP Reply:** The host with target IP X.X.X.X unicasts its MAC address back to the requester.
3.  **ARP Cache:** Requesters store this mapping temporarily in a local table to avoid redundant broadcasts.

### Q8: What is the difference between IPv4 and IPv6?
*   **IPv4:** 32-bit address space (~4.3 billion addresses), written in dotted-decimal format (e.g., `192.168.1.1`), requires NAT for address conservation, manual or DHCP configuration.
*   **IPv6:** 128-bit address space (nearly infinite), written in hexadecimal notation separated by colons (e.g., `2001:db8::1`), has built-in security (IPsec), SLAAC support, and eliminates the need for NAT.

### Q9: What is a Subnet Mask and CIDR?
*   **Subnet Mask:** A 32-bit value that segments an IP address into **Network ID** (1s) and **Host ID** (0s) to identify the local network boundary (e.g., `255.255.255.0`).
*   **CIDR (Classless Inter-Domain Routing):** A notation that appends a slash followed by the count of network bits to an IP address (e.g., `192.168.1.0/24`), enabling flexible, classless address allocation.

### Q10: What is the DORA process in DHCP?
Dynamic Host Configuration Protocol (DHCP) uses a 4-step process to dynamically assign IP parameters to clients:
1.  **Discover (Broadcast):** Client requests an IP configuration.
2.  **Offer (Unicast/Broadcast):** Server proposes an available IP address config.
3.  **Request (Broadcast):** Client accepts the proposed config.
4.  **Acknowledge (Unicast/Broadcast):** Server commits the lease and registers the parameters.

### Q11: What is the difference between a Hub, a Switch, and a Router?
*   **Hub:** Layer 1 device; dumb repeater that broadcasts incoming signals to all ports, creating a single collision domain.
*   **Switch:** Layer 2 device; inspects MAC addresses to selectively forward frames to targeted ports, creating separate collision domains for each port.
*   **Router:** Layer 3 device; inspects IP addresses to route packets across distinct physical or logical networks.

### Q12: What is the difference between Half-Duplex and Full-Duplex?
*   **Half-Duplex:** Bidirectional communication is possible, but only one device can transmit at any given time (e.g., walkie-talkie).
*   **Full-Duplex:** Bidirectional communication can occur simultaneously on both nodes (e.g., telephone call).

### Q13: What is ICMP and what is its role?
Internet Control Message Protocol (ICMP) is a Network Layer protocol used by network devices to send error messages and operational information (e.g., destination unreachable, TTL expired).
*   **Ping:** Uses ICMP Echo Request and Echo Reply to test connectivity and latency.
*   **Traceroute:** Uses incremental TTL fields to maps the hop-by-hop path packets take.

### Q14: Explain Collision Domain and Broadcast Domain.
*   **Collision Domain:** A logical network segment where data packets can collide with each other during transmission (minimized by Layer 2 switches).
*   **Broadcast Domain:** A logical division of a computer network where all nodes can reach each other via a Layer 2 broadcast frame (bounded by Layer 3 routers).

### Q15: What are the main Network Topologies?
*   **Bus:** Single central cable; simple but susceptible to single-point failures.
*   **Star:** Central hub/switch; easy to scale, highly robust, but central hub failure halts the network.
*   **Ring:** Token-passing ring; predictable performance but a single node failure breaks the entire ring.
*   **Mesh:** Dedicated point-to-point links between all nodes; highly redundant, expensive, complex cabling.
*   **Hybrid:** Blend of two or more topologies.

### Q16: What is the difference between HTTP and HTTPS?
*   **HTTP (Hypertext Transfer Protocol):** Sends data in plain text, port 80, highly vulnerable to eavesdropping and man-in-the-middle attacks.
*   **HTTPS (HTTP Secure):** Encrypts data using SSL/TLS, port 443, guarantees confidentiality, integrity, and server authentication.

### Q17: What is a Default Gateway?
A default gateway is the node (typically a router) on a computer network that serves as an access point to another network or the Internet when no specific route matches the destination IP.

### Q18: What is FTP and what ports does it use?
File Transfer Protocol (FTP) is a client-server protocol used to transfer files over a network.
*   **Port 21:** Control channel (carries commands and status responses).
*   **Port 20:** Data channel (handles the actual file transfer).

### Q19: Explain the difference between POP3, IMAP, and SMTP.
*   **SMTP (Simple Mail Transfer Protocol):** Used to push or send emails from a client to a server or between servers (Port 25/587).
*   **POP3 (Post Office Protocol v3):** Downloads emails from the server to local storage and deletes them from the server (Port 110).
*   **IMAP (Internet Message Access Protocol):** Synchronizes and caches emails across multiple client devices while maintaining the master copy on the server (Port 143).

### Q20: What is a Virtual Private Network (VPN)?
A VPN creates a secure, encrypted connection (tunnel) over a less secure network (like the Internet) to safely transmit corporate or private data using protocols like IPsec or OpenVPN.

### Q21: What is the difference between Public and Private IP addresses?
*   **Public IP:** Globally unique, routable over the public Internet, assigned by ISP.
*   **Private IP:** Locally unique, non-routable over the Internet (RFC 1918 blocks), used inside LANs, mapped via NAT to access external networks.

### Q22: What is Network Address Translation (NAT) and why is it used?
NAT is a method of mapping local (private) IP addresses to globally routable (public) IP addresses in a router's translation table.
*   **Conserves IPv4 addresses** by allowing thousands of hosts to share a single public IP.
*   **Adds security** by hiding internal local network structures from external visibility.

### Q23: What are Port Numbers and list some well-known ports?
Port numbers are 16-bit logical identifiers used by the Transport layer to route data to specific processes or applications.
*   **HTTP:** 80 | **HTTPS:** 443 | **DNS:** 53 | **SSH/SFTP:** 22
*   **FTP:** 20, 21 | **SMTP:** 25 | **DHCP:** 67, 68 | **Telnet:** 23

### Q24: Explain Unicast, Multicast, Broadcast, and Anycast.
*   **Unicast:** Communication from one single host to one single destination host (1-to-1).
*   **Multicast:** Communication from one host to a specific group of interested hosts (1-to-many).
*   **Broadcast:** Communication from one host to all hosts on the subnet (1-to-all).
*   **Anycast:** Communication from one host to the nearest node in a group of identical servers (1-to-nearest).

### Q25: What is a Proxy Server?
A proxy server is an intermediary server that evaluates and forwards requests from clients to other servers.
*   **Forward Proxy:** Acts on behalf of clients to bypass geo-restrictions, cache content, or mask client identities.
*   **Reverse Proxy:** Acts on behalf of web servers to handle load balancing, SSL termination, and caching.

### Q26: What is the difference between Guided and Unguided transmission media?
*   **Guided Media:** Physical cables guiding the electromagnetic signals (e.g., twisted-pair copper, coaxial cables, fiber-optic cables).
*   **Unguided Media:** Wireless transmission of electromagnetic signals through the air, vacuum, or water (e.g., Wi-Fi, microwave, Bluetooth, satellite).

### Q27: Define Bandwidth, Throughput, and Latency.
*   **Bandwidth:** The theoretical maximum capacity of a communication link to transmit data in a given unit of time (bps).
*   **Throughput:** The actual amount of data successfully transmitted over a link under real-world conditions.
*   **Latency:** The total time delay it takes for a single packet of data to travel from source to destination.

### Q28: What is a Firewall and what is its basic function?
A firewall is a network security device that monitors, filters, and blocks incoming and outgoing traffic based on pre-defined security policies, establishing a barrier between trusted and untrusted networks.

### Q29: What is Packet Switching vs Circuit Switching?
*   **Circuit Switching:** Establishes a dedicated, continuous physical path between two nodes for the duration of a session (e.g., PSTN phone lines). High guarantee of quality, low line utilization.
*   **Packet Switching:** Breaks down data into individual labeled packets sent independently across shared links using store-and-forward routing (e.g., Internet). Higher efficiency, but subject to jitter/delay.

### Q30: What is the purpose of the Physical Layer?
The Physical Layer handles the mechanical, electrical, and functional specifications of physical transmission media, encoding digital binary 1s and 0s into physical signals (voltages, light pulses, or radio waves).

### Q31: What is the Data Link Layer and its two sublayers (MAC and LLC)?
The Data Link Layer structures raw physical bit streams into frames, handles local flow/error control, and uses two sublayers:
*   **Logical Link Control (LLC):** Standardizes frame multiplexing, flow control, and error notification.
*   **Media Access Control (MAC):** Decides which device has the physical right to transmit on the shared physical medium using hardware MAC addresses.

### Q32: What is Ethernet and what standards does it follow?
Ethernet is the dominant wired local area network technology standard. It is defined by the **IEEE 802.3** working group and uses CSMA/CD to manage collisions in shared half-duplex topologies.

### Q33: What is a Loopback Address and what is it used for?
A loopback address is a special-use IPv4/IPv6 address (e.g., `127.0.0.1` or `::1`) used by host devices to route network traffic back to themselves to test internal network stacks and run local software.

### Q34: Explain the concept of flow control.
Flow control is a Transport and Data Link Layer mechanism that prevents a fast sender from overwhelming a slow receiver by negotiating acceptable transmission windows or rates.

### Q35: Explain error detection vs error correction.
*   **Error Detection:** Identifies that a transmission error has occurred, discarding the frame and relying on retransmissions (e.g., CRC, checksum).
*   **Error Correction:** Reconstructs corrupted data frames locally using mathematical error-correcting codes (e.g., Hamming codes).

### Q36: What is Parity Check and Checksum in error detection?
*   **Parity Check:** Appends a single redundant bit to a byte to ensure the total number of 1-bits is even (even parity) or odd (odd parity). Detects only single-bit errors.
*   **Checksum:** Computes a mathematical sum of all data segments and appends the inverted sum. The receiver repeats the sum; a non-zero result signals corruption.

### Q37: What is a VLAN (Virtual Local Area Network)?
A VLAN is a logical subnetwork that groups together a collection of devices from different physical LAN segments into a single isolated broadcast domain using **IEEE 802.1Q** VLAN tagging.

### Q38: What is the difference between LAN, MAN, and WAN?
*   **LAN (Local Area Network):** High-speed, low-latency network spanning a small physical area (e.g., home, office).
*   **MAN (Metropolitan Area Network):** Spans a larger urban or city-wide geographical region (e.g., cable TV network).
*   **WAN (Wide Area Network):** Spans massive geographical distances, connecting multiple LANs across countries or continents (e.g., Internet).

### Q39: What is the purpose of the Network Layer?
The Network Layer is responsible for logical host addressing, packet routing across multiple networks, fragmentation/reassembly of large packets, and path optimization.

### Q40: What is the Transport Layer and its main duties?
The Transport Layer provides end-to-end, host-to-host logical communication, segmenting and reassembling application payloads, and managing reliability, flow control, and port-based multiplexing.

### Q41: What is the Session Layer's role?
The Session Layer manages checkpoints, establishes, maintains, and gracefully closes logical connection sessions between remote applications, providing full/half-duplex synchronization.

### Q42: What is the Presentation Layer's role?
The Presentation Layer acts as a translator, converting abstract application structures to standardized network syntaxes (handling serialization, compression, and encryption/decryption).

### Q43: What is the Application Layer's role?
The Application Layer directly interfaces with user software applications (like web browsers and email clients), exposing specific communication services, protocols, and APIs.

### Q44: What is the difference between Static and Dynamic IP routing?
*   **Static Routing:** Network routes are manually configured by a system administrator; highly secure, low CPU overhead, but brittle and non-scalable.
*   **Dynamic Routing:** Routers automatically exchange routing tables and compute optimal paths dynamically using protocols like OSPF and BGP; scales easily and adapts to link failures.

### Q45: What is the TTL (Time to Live) field in an IP header and why is it important?
TTL is an 8-bit integer in the IPv4 header (Hop Limit in IPv6) decremented by one by each routing hop. If the TTL reaches zero, the packet is discarded, and an ICMP Time Exceeded message is returned, preventing packets from looping infinitely.

### Q46: What is Transmission Delay, Propagation Delay, Queuing Delay, and Processing Delay?
*   **Transmission Delay ($L/R$):** Time required to push all packet bits onto the physical medium (packet length divided by transmission rate).
*   **Propagation Delay ($D/S$):** Time for a single bit to travel from sender to receiver through the medium (distance divided by wave propagation speed).
*   **Queuing Delay:** Time a packet spends waiting in router buffer queues before being transmitted.
*   **Processing Delay:** Time spent by a router inspecting headers, checking bit-level errors, and deciding where to route the packet.

### Q47: What is peer-to-peer (P2P) architecture vs client-server architecture?
*   **Client-Server:** Centralized servers respond to client requests; high management control but prone to single points of failure.
*   **P2P:** Decentralized network where every peer acts as both a client and server, sharing files directly without central servers.

### Q48: What is a Network Interface Card (NIC)?
A NIC is a hardware component (onboard chip or card) that allows a computer to connect to a network by converting digital computer signals into physical signals for transmission over wired or wireless links.

### Q49: What is the difference between Bit Rate and Baud Rate?
*   **Bit Rate:** The number of binary bits (0s and 1s) transmitted per second (bps).
*   **Baud Rate:** The number of signal state transitions or physical symbol changes per second. A single symbol can encode multiple bits (Bit Rate = Baud Rate $\times$ Bits per Symbol).

### Q50: What is a Repeater and how does it differ from an Amplifier?
*   **Repeater:** Layer 1 device that receives a weak digital signal, reconstructs/cleans the original signal pulse, and retransmits it without noise amplification.
*   **Amplifier:** Purely analog device that increases the strength of both the signal and its accompanying noise/distortion indiscriminately.
