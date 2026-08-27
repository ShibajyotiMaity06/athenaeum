# Docker - Basic Interview Questions

### Q1: What is Docker? How does it differ from a Virtual Machine (VM)?
* **Docker**: A containerization platform that packages apps and dependencies into lightweight, portable containers sharing the **host OS kernel**.
* **Virtual Machine**: Runs a complete **guest OS** on virtualized hardware via a hypervisor.
* **Key Differences**:
  * **OS Kernel**: Docker shares the host kernel; VMs have independent guest kernels.
  * **Size**: Containers are megabytes; VMs are gigabytes.
  * **Startup**: Containers boot in milliseconds; VMs take minutes.
  * **Overhead**: Containers have near-zero overhead; VMs suffer high CPU/RAM virtualization tax.

### Q2: Explain the differences between an Image and a Container.
* **Docker Image**: An **immutable, read-only template** containing code, runtime, libraries, and config. Acts as the blueprint (class in OOP).
* **Docker Container**: A **runtime instance** of an image. Represents an isolated process running on the host (object in OOP).
* **Writable Layer**: A container adds a thin, temporary writable layer on top of the image's immutable layers to store modifications.

### Q3: What is the purpose of the FROM directive in a Dockerfile?
* **Base Image**: Specifies the starting parent image (e.g., `FROM alpine:3.18`) for subsequent instructions.
* **Position**: Must be the first non-comment instruction (unless defining build-time variables via `ARG` first).
* **Multi-stage**: Can appear multiple times in a single Dockerfile to initiate new build stages.

### Q4: Explain the difference between RUN, CMD, and ENTRYPOINT.
* **RUN**: Executes commands during the **build phase** to install packages and create new image layers.
* **CMD**: Defines **default runtime commands/arguments** that can be easily overridden by appended arguments in `docker run`.
* **ENTRYPOINT**: Configures a container to run as an executable. Appended arguments in `docker run` are added to the entrypoint rather than overriding it.

### Q5: How do COPY and ADD differ in a Dockerfile?
* **COPY**: Safely copies local files or directories from the host context into the container filesystem. (Preferred for standard copies).
* **ADD**: Has two additional features:
  * Can fetch files from **remote URLs**.
  * Automatically extracts compressed tar/gzip/zip files into the container destination.

### Q6: What is a Docker Volume and why is it used?
* **Definition**: A storage mechanism managed by Docker that bypasses the container's ephemeral writable layer.
* **Purpose**: Persists data beyond container lifecycles, shares data between containers, and prevents I/O performance penalties from the union file system.
* **Location**: Stored in a Docker-managed directory on the host machine (`/var/lib/docker/volumes/` on Linux).

### Q7: What is the difference between a Bind Mount and a Named Volume?
* **Bind Mount**: References a **user-specified absolute path** on the host. Any host file change reflects instantly inside the container.
* **Named Volume**: Managed completely by Docker in its internal directory. Portable, safer, and does not depend on the host's directory structure.

### Q8: What does the WORKDIR directive do?
* **Directory Switch**: Sets the working directory for subsequent instructions (`RUN`, `CMD`, `ENTRYPOINT`, `COPY`, `ADD`).
* **Auto-creation**: Automatically creates the directory path if it does not already exist.
* **Avoids cd**: Prevents using `RUN cd /path` which only persists for that specific layer.

### Q9: What is the role of the EXPOSE directive?
* **Metadata/Documentation**: Declares which port the container application listens on at runtime.
* **No Publishing**: Does *not* actually open or publish ports on the host. Host port mapping must still be specified at runtime using `-p` or `-P`.

### Q10: What is the .dockerignore file and why is it important?
* **Purpose**: Specifies patterns of files and directories (like `node_modules`, `.git`, secret files) to exclude from the build context.
* **Benefits**:
  * Reduces **build context size**, accelerating image builds and pushes.
  * Prevents accidental leaking of local secrets, configurations, or credentials into image layers.

### Q11: Explain the difference between docker run and docker start.
* **docker run**: Creates a **new container** from an image and starts it.
* **docker start**: Starts an **existing, stopped container** without modifying its state or creating a new one.

### Q12: What does the -d flag do in docker run?
* **Detached Mode**: Runs the container in the **background** and outputs the container ID to the terminal immediately.
* **No blocking**: Releases the host terminal prompt, allowing other commands to run while the container remains active.

### Q13: Explain the difference between docker stop and docker kill.
* **docker stop**: Sends a **SIGTERM** signal, giving the container a grace period (default 10s) to clean up and shut down gracefully, followed by **SIGKILL** if it fails to exit.
* **docker kill**: Sends a **SIGKILL** signal instantly, forcing an abrupt shutdown of all container processes.

### Q14: How does Docker achieve container isolation?
* **Namespaces**: Isolates resources such as process trees (`pid`), network interfaces (`net`), mount points (`mnt`), IPC (`ipc`), and hostnames (`uts`).
* **Control Groups (cgroups)**: Limits, accounts for, and isolates physical resource usage (CPU, Memory, Disk I/O, Network bandwidth).

### Q15: What is the difference between the host and bridge network modes?
* **Bridge (default)**: Creates an isolated internal software-defined network. Containers get private IPs and must publish ports to be accessible externally.
* **Host**: Removes isolation between the container and the host. The container shares the **host's IP and port space** directly; no port forwarding is needed.

### Q16: How do you publish ports in Docker?
* **Flag `-p`**: Explicitly maps a host port to a container port (e.g., `-p 8080:80` maps host port 8080 to container port 80).
* **Flag `-P`**: Dynamically maps all exposed ports in the container to high-numbered random ports on the host.

### Q17: What are dangling images? How do you clean them up?
* **Dangling Image**: An image with no repository name and no tag, shown as `<none>:<none>`. Occurs when building an image with an existing name/tag.
* **Cleanup Command**: `docker image prune` or `docker system prune` removes all dangling images.

### Q18: What is the purpose of the ENV and ARG directives?
* **ENV**: Defines environment variables available during **both image build and runtime**. Persists in the container environment.
* **ARG**: Defines build-time variables available **only during the image build process**. Not accessible in the running container.

### Q19: Explain the concept of Copy-on-Write (CoW).
* **Mechanism**: When a container modifies an existing file from a read-only image layer, Docker copies the file up to the container's writable layer before executing modifications.
* **Benefits**: Minimizes storage usage since multiple containers share the same underlying immutable image layers.

### Q20: What is Docker Hub?
* **Registry**: A public, cloud-based registry service hosted by Docker to search, download (pull), share, and store (push) Docker images.
* **Private Repositories**: Supports private image storage for teams and automated build pipelines.

### Q21: How do you view logs of a running container?
* **Command**: `docker logs [container_id_or_name]`.
* **Key Flags**:
  * `-f` or `--follow`: Streams logs live to the terminal.
  * `--tail N`: Returns only the last N lines of output.
  * `-t` or `--timestamps`: Appends timestamps to each log line.

### Q22: What does docker exec do?
* **Command Execution**: Runs a new command inside an **already running container**.
* **Use Case**: Often used to spawn an interactive shell (e.g., `docker exec -it [container_name] sh`) for debugging purposes.

### Q23: Explain the difference between docker ps and docker ps -a.
* **docker ps**: Lists only **currently active and running** containers.
* **docker ps -a**: Lists **all containers**, including those that are stopped, exited, or dead.

### Q24: What is a multi-stage build and why is it useful?
* **Concept**: Uses multiple `FROM` instructions in a single Dockerfile to separate the compilation/build environment from the final execution environment.
* **Benefit**: Dramatically reduces the final image size by copying only compile artifacts and binaries, leaving compilers, build tools, and raw source code behind.

### Q25: Why should you avoid running containers as root?
* **Security risk**: By default, container root is identical to host root. If a container is compromised, the attacker can leverage host kernel exploits to escape and gain root control of the host machine.
* **Mitigation**: Use `USER [username]` in the Dockerfile to run processes under a non-privileged user account.

### Q26: What is a container restart policy?
* **Definition**: Instructs Docker on whether and how to automatically restart containers upon exit or daemon crashes.
* **Common Policies**:
  * `no`: Do not restart automatically.
  * `on-failure[:max-retries]`: Restart only if the container exits with a non-zero code.
  * `always`: Always restart, even if stopped manually (restarts upon system boot).
  * `unless-stopped`: Always restart unless explicitly stopped by the user.

### Q27: How can you limit memory and CPU resources for a container?
* **Memory Limit**: Use flags `--memory` or `-m` (e.g., `--memory="512m"`).
* **CPU Limit**: Use flags `--cpus` (e.g., `--cpus="1.5"` to limit use to 1.5 CPU cores) or `--cpu-shares`.

### Q28: What is Docker Compose?
* **Tool**: A utility for defining and running **multi-container applications** using a single configuration file (`docker-compose.yml`).
* **Command**: `docker-compose up` launches all services, networks, and volumes defined in the configuration.

### Q29: What does docker inspect do?
* **Command**: `docker inspect [object_name_or_id]`.
* **Output**: Returns highly detailed, low-level **JSON metadata** about a container, image, volume, or network, such as IP address, environment variables, and mount paths.

### Q30: What is Alpine Linux and why is it popular in Docker?
* **Definition**: A lightweight, security-oriented Linux distribution based on musl libc and busybox.
* **Popularity**: Extremely small size (~5MB base image), resulting in smaller final image sizes, faster downloads, and a reduced attack surface.

### Q31: How do you copy files between a container and the host?
* **Command**: `docker cp`.
* **Syntax**:
  * From host to container: `docker cp [host_path] [container_id]:[container_path]`
  * From container to host: `docker cp [container_id]:[container_path] [host_path]`

### Q32: What is the scratch image?
* **Definition**: An empty, zero-byte base image reserved for building minimal containers.
* **Use Case**: Ideal for running static binaries (e.g., compiled Go, Rust, or C++ programs) that require no operating system libraries or shell environment.

### Q33: What is the purpose of the USER directive?
* **Access Control**: Changes the user ID (UID) and group ID (GID) used to run subsequent `RUN`, `CMD`, and `ENTRYPOINT` instructions.
* **Security**: Enforces least privilege by dropping root privileges before the application starts.

### Q34: What is the purpose of the LABEL directive?
* **Metadata**: Adds custom key-value pairs of metadata to an image (e.g., `LABEL maintainer="admin@example.com"`).
* **Use Case**: Used to store licensing details, project descriptions, author information, or versioning metrics.

### Q35: How does Docker DNS resolution work?
* **Embedded DNS**: Docker includes a built-in DNS server that enables containers on the same **user-defined network** to resolve each other's IP addresses by their **container names** or aliases.
* **Default Network limitation**: This automatic service discovery does *not* work on the default default bridge network.

### Q36: What is the difference between docker rm and docker rmi?
* **docker rm**: Deletes one or more **containers** (they must be stopped first unless forced with `-f`).
* **docker rmi**: Deletes one or more **images** from local storage.

### Q37: What is the purpose of docker stats?
* **Monitoring**: Displays a live, real-time streaming dashboard of CPU, memory, network I/O, and block I/O usage for all active containers.

### Q38: What does docker system prune do?
* **Cleanup**: A destructive command that reclaims disk space by deleting:
  * All stopped containers.
  * All networks not used by at least one container.
  * All dangling images and build caches.
  * Optionally all unused volumes (if run with `--volumes`).

### Q39: What is the purpose of the --rm flag in docker run?
* **Auto-removal**: Instructs Docker to automatically delete the container and its anonymous volumes as soon as it exits.
* **Use Case**: Ideal for ephemeral utility containers, build scripts, or debugging commands.

### Q40: What is the purpose of docker history?
* **Audit**: Displays a list of all layers that make up a specific image, showing the Dockerfile commands used to build each layer, its size, and creation timestamp.

### Q41: Explain what a Docker Registry is.
* **Service**: A system that stores and distributes Docker images.
* **Examples**: Docker Hub, Amazon ECR, Google Artifact Registry, GitHub Container Registry (GHCR), or self-hosted registries like Sonatype Nexus.

### Q42: What does the none network driver do?
* **Isolation**: Disables networking entirely for the container. The container is completely isolated from the internet and other containers, with only a loopback interface (`lo`).

### Q43: How do you save a Docker image to a file and restore it?
* **Save**: `docker save -o my-image.tar my-image:latest` exports an image to a tarball archive.
* **Restore**: `docker load -i my-image.tar` imports the image back from the tarball archive.

### Q44: What is the difference between docker save/load and docker export/import?
* **save/load**: Operates on **images** and preserves the entire history, metadata, and all layer information.
* **export/import**: Operates on **containers** (filesystem state) and flattens the filesystem into a single layer, discarding history and image metadata.

### Q45: What does the docker commit command do?
* **Snapshot**: Creates a new Docker image from the current state of a container's writable layer.
* **Warning**: Generally discouraged in favor of Dockerfiles, as commits make changes untraceable and non-reproducible.

### Q46: What is the significance of the docker-init process?
* **PID 1**: Serves as the system init process inside the container when started with the `--init` flag.
* **Role**: Correctly reaps orphaned zombie processes and forwards system signals (like `SIGTERM`) to child processes, preventing resource leaks.

### Q47: What does the docker top command do?
* **Process List**: Displays the active running host processes associated with the container processes, along with their PIDs.

### Q48: What is the default user inside a newly initialized Docker container?
* **Default**: Runs as the **root** user (UID 0) unless the parent base image specifies a different user or a `USER` directive is explicitly defined in the Dockerfile.

### Q49: What does docker diff do?
* **Inspection**: Inspects changes made to files or directories on a container’s writable filesystem layer compared to the source image.
* **Codes**:
  * `A`: File/directory added.
  * `D`: File/directory deleted.
  * `C`: File/directory changed.

### Q50: How do you force a Docker build to bypass its cached layers?
* **Bypass Cache**: Use the `--no-cache` flag during the build phase (e.g., `docker build --no-cache -t my-app .`).
* **Cache Invalidation**: Docker is forced to ignore existing cached layers and rebuild all layers from scratch.
