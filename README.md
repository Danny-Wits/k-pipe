# K-PIPE: Linux Kernel Pipe & Ring Buffer Visualizer
> **An Interactive Systems Observability & Concurrency Dashboard Visualizing the Linux Kernel Pipe Implementation (`fs/pipe.c`)**

[![Java](https://img.shields.io/badge/Java-21%2B-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://openjdk.org/)
[![Linux](https://img.shields.io/badge/Linux-Kernel_6.x-FCC624?style=for-the-badge&logo=linux&logoColor=black)](https://kernel.org)
[![React](https://img.shields.io/badge/React-18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![WebSocket](https://img.shields.io/badge/WebSocket-Real--Time-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](https://javalin.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

---

## Overview

**K-PIPE** is an interactive, full-stack educational visualization of the **Producer-Consumer Problem** as implemented natively within the **Linux Operating System kernel**.

In Linux, inter-process communication (IPC) pipelines such as `cat access.log | grep "500"` rely on an **in-kernel bounded circular ring buffer** (`struct pipe_inode_info` defined in [`fs/pipe.c`](https://github.com/torvalds/linux/blob/master/fs/pipe.c)). When the writing process generates data faster than the reader can process it, the kernel enforces backpressure by putting the writer to sleep; when the pipe runs dry, the reader sleeps until new data arrives.

K-PIPE brings these low-level operating system mechanics to life. A high-performance, non-blocking **Java 21+ backend** simulates true kernel thread synchronization, mutex acquisition, and wait-queue dispatch, streaming sub-millisecond state telemetry over WebSockets to a modern **React-powered Linux Kernel Observability HUD**.

---

## Architectural Topology

The system strictly mirrors the boundary between **Linux User Space** and **Linux Kernel Space**:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                              USER SPACE                                                │
│                                                                                                        │
│   ┌───────────────────────────┐                           ┌───────────────────────────┐                │
│   │   Process A (Producer)    │                           │   Process B (Consumer)    │                │
│   │   PID: 4102 [cat / ffmpeg]│                           │   PID: 4103 [grep / x264] │                │
│   │   sys_write(pipefd[1])    │                           │   sys_read(pipefd[0])     │                │
│   │   State: TASK_RUNNING     │                           │   State: TASK_RUNNING     │                │
│   └─────────────┬─────────────┘                           └─────────────▲─────────────┘                │
└─────────────────┼───────────────────────────────────────────────────────┼──────────────────────────────┘
                  │  Syscall: write()                                     │  Syscall: read()
══════════════════╪═══════════════════════════════════════════════════════╪══════════════════════════════
                  ▼                                                       │
┌─────────────────────────────────────────────────────────────────────────┴──────────────────────────────┐
│                                             KERNEL SPACE                                               │
│                                                                                                        │
│   ┌────────────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                       struct pipe_inode_info (Circular Ring Buffer)                            │   │
│   │                                                                                                │   │
│   │   [ Page 0 ]   [ Page 1 ]   [ Page 2 ]   [ Page 3 ]   [ Page 4 ]   ...   [ Page 15 ]           │   │
│   │   [ 0x1000 ]   [ 0x2000 ]   [ 0x3000 ]   [ 0x4000 ]   [ EMPTY  ]         [ EMPTY   ]           │   │
│   │                                  ▲                             ▲                               │   │
│   │                                  │                             │                               │   │
│   │                           tail (Read Ptr)               head (Write Ptr)                       │   │
│   │                                                                                                │   │
│   │   • Mutex Status: UNLOCKED                                                                     │   │
│   │   • Write Wait Queue (wr_wait): EMPTY   [Writers sleep here when ring is FULL]                 │   │
│   │   • Read Wait Queue  (rd_wait): EMPTY   [Readers sleep here when ring is EMPTY]                │   │
│   └────────────────────────────────────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Linux Kernel Mechanics Implemented

| Kernel Mechanism | Source File / Primitives | K-PIPE Implementation & Visualization |
| :--- | :--- | :--- |
| **Circular Ring Buffer** | `struct pipe_buffer ring[]` | 16 discrete memory pages (4KB each) indexed circularly with dynamic `head` and `tail` pointers. |
| **Write Syscall** | `pipe_write()` in `fs/pipe.c` | Process A writes chunks into `ring[head % capacity]`. The write pointer advances and signals the read wait queue. |
| **Read Syscall** | `pipe_read()` in `fs/pipe.c` | Process B consumes chunks from `ring[tail % capacity]`. The read pointer advances and signals the write wait queue. |
| **Backpressure (Full)** | `pipe->head - pipe->tail >= max_usage` | `sys_write` suspends. Process A is placed on `pipe->wr_wait` and changes state from `TASK_RUNNING` to **`TASK_INTERRUPTIBLE`**. |
| **Starvation (Empty)** | `pipe->head == pipe->tail` | `sys_read` suspends. Process B is placed on `pipe->rd_wait` and changes state from `TASK_RUNNING` to **`TASK_INTERRUPTIBLE`**. |
| **Wait Queue Wakeup** | `wake_up_interruptible_sync_poll()` | When space frees or data arrives, the kernel issues a condition notification, waking sleeping threads instantly. |
| **Dynamic Resizing** | `fcntl(fd, F_SETPIPE_SZ, size)` | Real-time slider resizes the kernel ring buffer from 4 to 32 pages (16KB to 128KB) without deadlocking. |

---

## Features

- **Real Java Concurrency Engine**: Built without heavy framework overhead using **Java 21+** and **Javalin**. Starts in **~80ms**, utilizing true platform threads and native `synchronized`, `wait()`, and `notifyAll()` monitors to replicate kernel wait queues.
- **Live Kernel Observability HUD**: Dark-mode terminal design inspired by modern eBPF and Linux monitoring tools (`htop`, `bpftrace`, Grafana).
- **Animated Data Conduits (Pipes)**: Watch 4KB memory pages with hexadecimal memory addresses and data previews physically glide across user-space boundaries into kernel memory slots.
- **Circular Memory Slot Rack**: Visualizes active `head` (write) and `tail` (read) pointers wrapping continuously around memory pages.
- **Process State Indicators**: Real-time Linux scheduler states for both producer and consumer:
  - **`TASK_RUNNING`**: Active CPU execution and I/O dispatch.
  - **`TASK_INTERRUPTIBLE`**: Blocked and sleeping on the kernel wait queue (`wr_wait` or `rd_wait`).
- **Interactive Syscall Controls**:
  - Independent I/O throttle sliders for Process A (`write` rate) and Process B (`read` rate).
  - Pipe capacity selector (`fcntl F_SETPIPE_SZ`: 4, 8, 16, or 32 pages).
  - Play, Pause, and Single-Syscall Step execution modes.
- **Realistic Linux Workload Presets**:
  1. `cat access.log | grep "500"` — Web server log stream analysis.
  2. `ffmpeg -i stream.raw | x264` — High-throughput video transcoding pipeline.
  3. `tar -cf - /var/log | gzip` — Multi-megabyte archive compression stream.

---

## Repository Structure

```
producerConsumer/
├── README.md                            # Comprehensive project documentation
├── pom.xml                              # Maven build config (Java 21, Javalin, Jackson)
│
├── src/main/java/com/linuxpipe/
│   ├── LinuxPipeServer.java             # Server entry point & Javalin WebSocket endpoint
│   ├── model/
│   │   ├── MemoryPage.java              # Immutable record: pageId, hexAddress, dataSnippet, timestamp
│   │   ├── KernelStateSnapshot.java     # Telemetry DTO: pointers, buffer load, process states
│   │   └── ProcessControlCommand.java   # Client command DTO: speeds, capacity, actions
│   └── kernel/
│       ├── LinuxPipeBuffer.java         # Thread-safe circular buffer with wait-queue semantics
│       ├── ProducerProcess.java         # Simulates Process A issuing write() syscalls
│       ├── ConsumerProcess.java         # Simulates Process B issuing read() syscalls
│       └── KernelPipeManager.java       # Coordinates lifecycle, workload presets, and broadcasts
│
└── frontend/                            # React + Vite Linux Observability HUD
    ├── package.json                     # Frontend dependencies
    ├── vite.config.js                   # Vite configuration with proxy
    ├── index.html                       # Application shell
    └── src/
        ├── main.jsx                     # React entry point
        ├── App.jsx                      # Master Linux Kernel Dashboard layout
        ├── linux-hud.css                # Terminal styling, glow conduits, scanlines
        ├── hooks/
        │   └── useKernelTelemetry.js    # Resilient WebSocket hook for real-time telemetry
        └── components/
            ├── UserSpaceProcesses.jsx   # Process A & B cards with CPU and PID status
            ├── KernelPipeConduit.jsx    # Animated SVG/CSS data bus crossing user/kernel space
            ├── RingBufferRack.jsx       # Circular memory slots with head & tail pointers
            ├── WaitQueueInspector.jsx   # Live wr_wait and rd_wait wait-queue visualizer
            └── LinuxControlConsole.jsx  # Syscall rate sliders, fcntl capacity, and presets
```

---

## Quickstart Guide

### Prerequisites
- **Java**: OpenJDK 21 or higher
- **Maven**: 3.8+
- **Node.js**: 18+ & npm

### 1. Start the Java Kernel Backend
In the project root, start the Javalin micro-server:
```bash
mvn compile exec:java
```
*The server boots in ~80ms and listens for WebSocket connections at `ws://localhost:8080/ws/telemetry`.*

### 2. Start the Linux Kernel HUD Frontend
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```

Open your browser and navigate to **`http://localhost:5173`**.

---

## WebSocket Telemetry Protocol

### Client ➔ Server Command (`/ws/telemetry`)
Sent from the browser when modifying syscall speeds, capacity, or presets:
```json
{
  "action": "CONFIG",
  "writeDelayMs": 250,
  "readDelayMs": 800,
  "capacityPages": 16,
  "scenario": "CAT_GREP",
  "paused": false
}
```

### Server ➔ Client Telemetry Frame (`/ws/telemetry`)
Streamed by the Java engine at 25 FPS to synchronize visual state:
```json
{
  "timestamp": 1729524600120,
  "capacity": 16,
  "pageCount": 9,
  "fillPercentage": 56.25,
  "headPointer": 41,
  "tailPointer": 32,
  "mutexLocked": false,
  "producer": {
    "pid": 4102,
    "name": "cat access.log",
    "state": "TASK_RUNNING",
    "syscall": "write(pipefd[1], buf, 4096)",
    "rateKbPerSec": 16.4
  },
  "consumer": {
    "pid": 4103,
    "name": "grep 500",
    "state": "TASK_RUNNING",
    "syscall": "read(pipefd[0], buf, 4096)",
    "rateKbPerSec": 5.1
  },
  "waitQueues": {
    "wrWaitCount": 0,
    "rdWaitCount": 0
  },
  "pages": [
    {"slot": 0, "pageId": 32, "hex": "0x7fff1000", "payload": "192.168.1.1 - GET /api 200"},
    {"slot": 1, "pageId": 33, "hex": "0x7fff2000", "payload": "192.168.1.5 - POST /auth 500"}
  ]
}
```

---

## Core Operating System Insights

By interacting with K-PIPE, users gain hands-on intuition for foundational OS principles:
1. **Why `while` is mandatory over `if` in condition waits**: Protects against spurious wakeups and thundering-herd race conditions in multithreaded schedulers.
2. **Backpressure as a stability mechanism**: Demonstrates why unbounded buffers cause memory exhaustion (`OOM`), and how blocking writers protects kernel stability.
3. **Context switching overhead**: Demonstrates the performance cost when processes cycle rapidly between `TASK_RUNNING` and `TASK_INTERRUPTIBLE`.
4. **Buffer sizing tradeoffs**: Shows how small buffers minimize latency for interactive commands, while large buffers maximize throughput for batch processing (`F_SETPIPE_SZ`).

---

## License
This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.