# K-PIPE: Complete Viva & Technical Defense Guide
> **An In-Depth Examiner's Companion to the Linux Kernel Pipe & Ring Buffer Concurrency Visualizer**

---

## Table of Contents
1. [The 30-Second Elevator Pitch](#1-the-30-second-elevator-pitch)
2. [Problem Statement & Background](#2-problem-statement--background)
3. [The Linux Kernel Architecture (`fs/pipe.c`)](#3-the-linux-kernel-architecture-fspipec)
4. [Inner Workings of the Codebase](#4-inner-workings-of-the-codebase)
   - [Backend Architecture (Java 21+ & Javalin)](#a-backend-architecture-java-21--javalin)
   - [Frontend Architecture (React 18 & HTML5 Canvas)](#b-frontend-architecture-react-18--html5-canvas)
5. [Core Operating System Concepts Deep-Dive](#5-core-operating-system-concepts-deep-dive)
6. [Top 15 Viva Questions & Bulletproof Answers](#6-top-15-viva-questions--bulletproof-answers)
7. [System Cheat Sheet & File Map](#7-system-cheat-sheet--file-map)

---

## 1. The 30-Second Elevator Pitch

> *"Most students demonstrate the Producer-Consumer problem using a generic Java `ArrayBlockingQueue` or simple thread sleeps. **K-PIPE** goes deeper by implementing and visualizing how the **Linux Operating System kernel itself** solves this problem inside `fs/pipe.c`.*
> 
> *When you run `cat access.log | grep "500"`, the kernel creates a bounded circular ring buffer (`struct pipe_inode_info`) of 16 memory pages (64KB). If the writer runs faster than the reader, the kernel enforces **backpressure** by placing the writer to sleep on `pipe->wr_wait` in `TASK_INTERRUPTIBLE` state with 0% CPU consumption. When space frees up, the reader issues a `wake_up_interruptible()` signal.*
>
> *Our project pairs a high-performance **Java 21 backend** replicating actual kernel synchronization monitors with a modern **React 18 Observability HUD** that streams sub-millisecond telemetry over WebSockets at 25 FPS, providing both an interactive multi-chapter story walkthrough and a live stress-test laboratory."*

---

## 2. Problem Statement & Background

### The Classical Concurrency Problem
Formulated by Edsger Dijkstra in 1965, the **Producer-Consumer (Bounded-Buffer) Problem** models two or more concurrent processes sharing a common memory buffer:
- **Producer (Writer)**: Generates data items and places them into memory.
- **Consumer (Reader)**: Pulls data items from memory and processes them.

### Why Naive Approaches Catastrophically Fail

| Approach | How It Works | Why It Fails |
| :--- | :--- | :--- |
| **1. Unbuffered Direct Pipe** | Producer writes directly to Consumer with no buffer in between. | If Consumer slows down (e.g., heavy regex parsing), Producer instantly freezes or drops packets. System throughput equals the slowest bottleneck at all times. |
| **2. Unbounded Buffer (Dynamic List)** | Producer keeps allocating new memory nodes whenever it produces. | If Producer runs faster than Consumer, memory grows indefinitely until the OS kernel triggers the **OOM (Out-Of-Memory) Killer**, terminating processes abruptly. |
| **3. Naive Circular Buffer (No Synchronization)** | Uses a fixed-size array but lacks thread synchronization. | When Producer loops around, it overwrites unread slots. Consumer reads corrupted, half-written data. Pointers experience **race conditions**. |

### The Linux Kernel Solution
Linux solves this with **Bounded Circular Ring Buffers** combined with **Wait-Queue Backpressure**:
- Bounded size prevents memory exhaustion.
- Ring pointers wrap continuously (`head % capacity`), eliminating memory reallocation.
- Condition wait queues place threads into low-power sleep rather than burning CPU in busy-wait spinloops.

---

## 3. The Linux Kernel Architecture (`fs/pipe.c`)

When a user executes a pipeline in bash:
```bash
cat access.log | grep "500"
```
The Linux kernel executes `sys_pipe2()`:
1. It creates an anonymous inode backed by `struct pipe_inode_info`.
2. It assigns two file descriptors to the process table:
   - `pipefd[1]`: The **write end** (connected to `stdout` of `cat`).
   - `pipefd[0]`: The **read end** (connected to `stdin` of `grep`).

```
┌────────────────────────────────────────────────────────────────────────┐
│                              USER SPACE                                │
│                                                                        │
│   ┌───────────────────────────┐        ┌───────────────────────────┐   │
│   │   Process A: cat (PID)    │        │   Process B: grep (PID)   │   │
│   │   sys_write(pipefd[1])    │        │   sys_read(pipefd[0])     │   │
│   └─────────────┬─────────────┘        └─────────────▲─────────────┘   │
└─────────────────┼────────────────────────────────────┼─────────────────┘
                  │ Syscall                            │ Syscall
══════════════════╪════════════════════════════════════╪══════════════════
                  ▼                                    │
┌──────────────────────────────────────────────────────┴─────────────────┐
│                     KERNEL SPACE (fs/pipe.c)                           │
│                                                                        │
│   struct pipe_inode_info {                                             │
│       struct mutex mutex;                 <-- Mutex lock               │
│       wait_queue_head_t wr_wait;          <-- Writer sleep queue       │
│       wait_queue_head_t rd_wait;          <-- Reader sleep queue       │
│       unsigned int head;                  <-- Write counter (index)    │
│       unsigned int tail;                  <-- Read counter (index)     │
│       unsigned int max_usage;             <-- Capacity (16 pages)      │
│       struct pipe_buffer ring[16];        <-- 16 x 4KB = 64KB Buffer   │
│   }                                                                    │
└────────────────────────────────────────────────────────────────────────┘
```

### The Three Architectural Pillars

1. **`pipe->mutex` (Mutual Exclusion Lock)**:
   - Ensures only one thread can modify `ring[]`, `head`, and `tail` at any instant.
   - **Crucial Rule**: Held for nanoseconds during memory copy; **explicitly released before calling `wait()`** so sleeping threads never cause deadlocks.

2. **`pipe->ring[16]` (Circular Memory Pages)**:
   - Default capacity is **16 pages** (16 × 4096 bytes = **64 KB**).
   - Write slot: `head % capacity`
   - Read slot: `tail % capacity`
   - Unread items in buffer: `head - tail`

3. **`wr_wait` & `rd_wait` (Wait Queues)**:
   - **Full Buffer (Backpressure)**: If `head - tail >= capacity`, `sys_write` suspends the calling process, places it on `wr_wait`, and transitions its scheduler state to `TASK_INTERRUPTIBLE`.
   - **Empty Buffer (Starvation)**: If `head == tail`, `sys_read` suspends the calling process, places it on `rd_wait`, and transitions it to `TASK_INTERRUPTIBLE`.
   - **Wakeup**: As soon as a reader takes a page, it calls `wake_up_interruptible(&pipe->wr_wait)` to resume the writer.

---

## 4. Inner Workings of the Codebase

### A. Backend Architecture (Java 21+ & Javalin)

The backend avoids heavyweight containers (Spring Boot) and boots in **~80ms** using lightweight Javalin and native Java platform threads.

#### 1. Core Circular Buffer: [`LinuxPipeBuffer.java`](file:///home/dannywits/Projects/producerConsumer/src/main/java/com/linuxpipe/kernel/LinuxPipeBuffer.java)
- Models `struct pipe_inode_info`.
- Uses Java's intrinsic object monitor (`synchronized`, `wait()`, `notifyAll()`) to simulate Linux kernel wait queues.

```java
// Inside sysWrite (pipe_write in fs/pipe.c):
public synchronized void sysWrite(MemoryPage page, StateListener listener) throws InterruptedException {
    mutexLocked = true;
    try {
        // Guard against spurious wakeups with a while loop
        while (count == capacity) {
            wrWaitCount++;
            if (listener != null) listener.onBlocked(); // TASK_INTERRUPTIBLE
            mutexLocked = false; // RELEASE MUTEX BEFORE SLEEPING!
            try {
                wait(); // Put thread to sleep on wr_wait
            } finally {
                mutexLocked = true;
                wrWaitCount--;
            }
        }
        if (listener != null) listener.onRunning(); // TASK_RUNNING
        ring[head % capacity] = page;
        head++;
        count++;
        notifyAll(); // wake_up_interruptible(&pipe->rd_wait)
    } finally {
        mutexLocked = false;
    }
}
```

```java
// Inside sysRead (pipe_read in fs/pipe.c):
public synchronized MemoryPage sysRead(StateListener listener) throws InterruptedException {
    mutexLocked = true;
    try {
        while (count == 0) {
            rdWaitCount++;
            if (listener != null) listener.onBlocked(); // TASK_INTERRUPTIBLE
            mutexLocked = false; // RELEASE MUTEX BEFORE SLEEPING!
            try {
                wait(); // Put thread to sleep on rd_wait
            } finally {
                mutexLocked = true;
                rdWaitCount--;
            }
        }
        if (listener != null) listener.onRunning(); // TASK_RUNNING
        MemoryPage page = ring[tail % capacity];
        ring[tail % capacity] = null;
        tail++;
        count--;
        notifyAll(); // wake_up_interruptible(&pipe->wr_wait)
        return page;
    } finally {
        mutexLocked = false;
    }
}
```

#### 2. Dynamic Resizing: `resize(int newCapacity)`
Simulates `fcntl(fd, F_SETPIPE_SZ, size)`. It enforces the kernel invariant that a pipe cannot be shrunk smaller than the count of currently unread pages (`Math.max(newCapacity, count)`), linearizing existing items without data loss.

#### 3. Dedicated Worker Threads: [`ProducerProcess.java`](file:///home/dannywits/Projects/producerConsumer/src/main/java/com/linuxpipe/kernel/ProducerProcess.java) & [`ConsumerProcess.java`](file:///home/dannywits/Projects/producerConsumer/src/main/java/com/linuxpipe/kernel/ConsumerProcess.java)
- Run independent thread execution loops simulating user-space processes.
- Dynamically throttle write and read delays via user sliders.
- Keep track of throughput rates (KB/sec) and scheduler states (`TASK_RUNNING` vs `TASK_INTERRUPTIBLE`).

#### 4. Real-Time Telemetry Stream: [`LinuxPipeServer.java`](file:///home/dannywits/Projects/producerConsumer/src/main/java/com/linuxpipe/LinuxPipeServer.java)
- A background `ScheduledExecutorService` samples the kernel state every **40ms (25 FPS)**.
- Telemetry snapshots are serialized to JSON via Jackson and broadcast to all connected WebSocket clients on `/ws/telemetry`.

---

### B. Frontend Architecture (React 18 & HTML5 Canvas)

The frontend is an editorial-grade **Linux Kernel Observability HUD** designed with a brutalist, high-contrast aesthetic (`#ffffff`, `#000000`, `#e11d48`) and zero AI tropes (no generic font defaults, no blinking dots, no emojis).

#### 1. Dual Mode System: [`App.jsx`](file:///home/dannywits/Projects/producerConsumer/frontend/src/App.jsx)
- **Story Walkthrough (Chapters 1–3)**: Step-by-step interactive curriculum explaining the collision, memory explosion, and Linux fix.
- **Interactive Lab (Chapter 4)**: The full live concurrency dashboard connected to the Java engine.

#### 2. Physical Pipeline Stage: [`PhysicalPipelineStage.jsx`](file:///home/dannywits/Projects/producerConsumer/frontend/src/components/PhysicalPipelineStage.jsx)
- Visually establishes the **User Space ⇋ Kernel Space** boundary.
- **Producer Station**: Displays Process A details, PID, CPU usage, and `sys_write()` call.
- **Reservoir Chamber**: Central cylindrical vessel displaying fluid level, fill percentage, and stopgate lockout.
- **Consumer Station**: Displays Process B details, PID, CPU usage, and `sys_read()` call.

#### 3. High-Performance Particle Engine: [`PipeHighwayCanvas.jsx`](file:///home/dannywits/Projects/producerConsumer/frontend/src/components/PipeHighwayCanvas.jsx)
- Renders 60 FPS animated 4KB memory packets flying along two pipeline conduits:
  - Input highway: User Space (Process A) ➔ Kernel Ring Buffer.
  - Output highway: Kernel Ring Buffer ➔ User Space (Process B).
- When backpressure occurs, the canvas physically drops a red lockout barrier on the conduit.

#### 4. 16-Page Memory Matrix: [`BufferSlotMatrix.jsx`](file:///home/dannywits/Projects/producerConsumer/frontend/src/components/BufferSlotMatrix.jsx)
- Renders the 16 circular memory slots with individual hex memory addresses (`0x7fff1000` to `0x7fff100f`).
- Points to the dynamic `HEAD` (write pointer) and `TAIL` (read pointer).
- Clicking any slot opens an interactive inspector displaying hexadecimal dump and string payload.

#### 5. Control Deck: [`ControlDeck.jsx`](file:///home/dannywits/Projects/producerConsumer/frontend/src/components/ControlDeck.jsx)
- Independent sliders for Producer I/O delay (10ms–1500ms) and Consumer I/O delay.
- Pipe buffer capacity selector (4, 8, 16, 32 pages).
- Play, Pause, Single-Step controls.
- **Stress Presets**:
  - `Writer Flood`: Producer fast (40ms), Consumer slow (900ms) ➔ Demonstrates Backpressure.
  - `Starvation`: Producer slow (900ms), Consumer fast (40ms) ➔ Demonstrates Drain / Wait.
  - `Equilibrium`: Both running at 300ms ➔ Balanced throughput.
  - `Burst Influx`: Fast-forward burst ingress.

---

## 5. Core Operating System Concepts Deep-Dive

### Concept 1: Why `while` is Mandatory Over `if` in Condition Waits

In `LinuxPipeBuffer.java`, we write:
```java
while (count == capacity) {
    wait();
}
```
**Why NOT `if (count == capacity)`?**
1. **Spurious Wakeups**: POSIX and Java thread specifications permit operating systems to wake up sleeping threads even without an explicit signal. An `if` statement would allow the thread to proceed into buffer insertion without re-checking, causing memory overflow.
2. **Thundering Herd / Race Conditions**: When `notifyAll()` wakes up multiple waiting threads, only one thread can acquire the lock first. By the time the second thread gets the lock, the condition might no longer be valid. The `while` loop forces every awakened thread to re-verify the condition before touching memory.

---

### Concept 2: Deadlock Prevention via Lock Release

A critical deadlock would occur if a thread called `wait()` while keeping `pipe->mutex` locked:
- Process A locks the mutex.
- Buffer is full, so Process A sleeps on `wr_wait`.
- Process B wants to read, but must first acquire `pipe->mutex`.
- Process B blocks waiting for the mutex.
- Process A will never wake up because Process B cannot enter to consume data.
- **Result: Permanent Deadlock.**

**Solution**: Java's `wait()` (and Linux's `prepare_to_wait()` in `fs/pipe.c`) **atomically releases the lock** as the thread is placed on the wait queue, and re-acquires it only upon waking up.

---

### Concept 3: Why Circular FIFO Ring Buffers are Preferred

Why doesn't the kernel just use an expanding dynamic array (`std::vector` or `ArrayList`)?
1. **Deterministic Bounded Memory**: Prevents runaway processes from crashing the whole machine.
2. **Zero Allocation in Critical Path**: Memory pages are pre-allocated once. Writing or reading requires zero `malloc()` / `free()` or garbage collection overhead.
3. **$O(1)$ Complexity**: Pushing to `head` and popping from `tail` is constant time $O(1)$.
4. **Cache Locality**: Fixed memory addresses remain resident in L1/L2 CPU caches.

---

### Concept 4: Scheduler States: `TASK_RUNNING` vs `TASK_INTERRUPTIBLE`

- **`TASK_RUNNING`**: The process is either currently executing on a CPU core or waiting in the scheduler's run-queue for its time slice.
- **`TASK_INTERRUPTIBLE`**: The process is suspended, sleeping on a wait queue (`wr_wait` or `rd_wait`). It consumes **0% CPU cycles**. It can be awakened either by an explicit kernel event (`wake_up_interruptible()`) or by a POSIX signal (like `SIGINT` or `SIGTERM`).

---

## 6. Top 15 Viva Questions & Bulletproof Answers

### Q1: What is the main objective of this project?
**Answer**: To bridge the gap between abstract textbook concurrency theory and real-world systems programming by simulating and visualizing the exact Linux kernel implementation of inter-process communication (`fs/pipe.c`) using real Java thread monitors and a real-time React dashboard.

### Q2: How does a Linux pipe differ from a standard queue?
**Answer**: A standard queue is often unbounded and user-space only. A Linux pipe is an in-kernel, bounded circular ring buffer (default 64KB, 16 pages of 4KB) with strict synchronization, condition wait queues for backpressure, and bidirectional POSIX file descriptors (`pipefd[0]` and `pipefd[1]`).

### Q3: What is "Backpressure" and why is it important?
**Answer**: Backpressure is the mechanism where a slow downstream consumer forces a fast upstream producer to slow down or halt. Without backpressure, fast producers flood the buffer until system memory is exhausted, crashing the OS via Out-Of-Memory (OOM).

### Q4: What does `struct pipe_inode_info` contain in the Linux kernel?
**Answer**: It contains:
1. `struct mutex mutex`: Lock protecting the pipe.
2. `wait_queue_head_t wr_wait, rd_wait`: Wait queues for writers and readers.
3. `unsigned int head, tail`: Monotonic indices for write and read pointers.
4. `unsigned int max_usage`: Ring buffer capacity (usually 16 pages).
5. `struct pipe_buffer ring[]`: Array of memory page references.

### Q5: Why do you calculate slot index as `head % capacity` instead of resetting `head` to 0?
**Answer**: In Linux kernel source (`fs/pipe.c`), `head` and `tail` are 32-bit unsigned integers that increment monotonically. The slot index is calculated via modulo arithmetic (`head % capacity`). This avoids complex reset logic and makes checking if the buffer is empty (`head == tail`) or full (`head - tail == capacity`) trivial.

### Q6: What happens in Linux when a pipe is full and a process writes to it?
**Answer**: The write syscall `pipe_write()` suspends. The process is placed onto `pipe->wr_wait`, releases `pipe->mutex`, and enters the `TASK_INTERRUPTIBLE` state, consuming 0% CPU cycles until a reader calls `pipe_read()` and wakes it up.

### Q7: What happens when a pipe is empty and a process reads from it?
**Answer**: The read syscall `pipe_read()` suspends. The process is placed onto `pipe->rd_wait`, releases `pipe->mutex`, and enters `TASK_INTERRUPTIBLE` until a writer adds a page and triggers `wake_up_interruptible()`.

### Q8: What is the difference between `notify()` and `notifyAll()` in your Java backend?
**Answer**: `notify()` wakes up a single arbitrary thread, whereas `notifyAll()` wakes up all waiting threads. In a multi-producer/multi-consumer environment, `notify()` can lead to **lost wakeups** (e.g., a reader signals another reader instead of a writer). `notifyAll()` guarantees that all threads re-evaluate their conditions safely.

### Q9: What happens if `wait()` is called inside an `if` block instead of `while`?
**Answer**: It introduces a severe concurrency bug. Spurious wakeups or race conditions could cause a thread to resume when the buffer is still full or empty, resulting in memory corruption or IndexOutOfBounds exceptions.

### Q10: How does `fcntl(fd, F_SETPIPE_SZ, size)` work in your implementation?
**Answer**: It dynamically resizes the circular ring buffer (from 4 to 32 pages). Our `resize()` method ensures the pipe cannot be shrunk smaller than the count of currently unread pages (`Math.max(newCapacity, count)`), copies existing data in sequential FIFO order, and notifies any waiting writers if capacity expanded.

### Q11: Why did you use WebSockets instead of REST polling for telemetry?
**Answer**: REST polling introduces significant HTTP handshake overhead, header bloat, and latency jitter at 25 FPS (40ms interval). WebSockets establish a single persistent, bidirectional TCP connection, streaming lightweight JSON frames with sub-millisecond overhead.

### Q12: Why did you pick Javalin over Spring Boot for the backend?
**Answer**: Spring Boot introduces substantial dependency bloat, slow startup times (~3–5 seconds), and complex reflection. Javalin is a lightweight, non-blocking micro-framework on top of embedded Jetty that boots in **~80ms**, allowing our kernel simulation to run with bare-metal efficiency.

### Q13: How does the frontend handle animation performance?
**Answer**: The data flow highway is implemented using an HTML5 Canvas (`<canvas>`) rendering via `requestAnimationFrame` at a smooth 60 FPS. This offloads packet rendering to the GPU and avoids thousands of expensive DOM updates.

### Q14: What is the significance of the simulated hex memory addresses (`0x7fff1000`)?
**Answer**: They represent virtual memory addresses allocated for each 4KB page. In Linux, standard memory pages are 4096 bytes aligned on 4KB boundaries (hex addresses ending in `000`), reflecting how the Memory Management Unit (MMU) indexes pages.

### Q15: How does your UI prevent feeling "AI-generated"?
**Answer**: We adhered to strict graphic-design principles:
- High-contrast editorial color scheme (`#ffffff`, `#000000`, `#e11d48`).
- Distinctive typography using `Syne` for brutalist headlines and `Space Grotesk` / `Space Mono` for monospace telemetry.
- Zero AI tropes: no random `//` code comments in headings, no useless micro-badges, no `animate-ping` dots, no lightning/sparkle magic icons, and zero emojis.

---

## 7. System Cheat Sheet & File Map

### Core Architecture Files

| Component | File Path | Key Role / Class |
| :--- | :--- | :--- |
| **Ring Buffer Core** | [`src/.../LinuxPipeBuffer.java`](file:///home/dannywits/Projects/producerConsumer/src/main/java/com/linuxpipe/kernel/LinuxPipeBuffer.java) | `LinuxPipeBuffer`: Thread-safe monitor, `sysWrite`, `sysRead`, `resize`. |
| **Producer Thread** | [`src/.../ProducerProcess.java`](file:///home/dannywits/Projects/producerConsumer/src/main/java/com/linuxpipe/kernel/ProducerProcess.java) | `ProducerProcess`: Simulates Process A issuing `sys_write()`. |
| **Consumer Thread** | [`src/.../ConsumerProcess.java`](file:///home/dannywits/Projects/producerConsumer/src/main/java/com/linuxpipe/kernel/ConsumerProcess.java) | `ConsumerProcess`: Simulates Process B issuing `sys_read()`. |
| **Kernel Manager** | [`src/.../KernelPipeManager.java`](file:///home/dannywits/Projects/producerConsumer/src/main/java/com/linuxpipe/kernel/KernelPipeManager.java) | `KernelPipeManager`: Scenario coordinator & snapshot generator. |
| **WebSocket Server** | [`src/.../LinuxPipeServer.java`](file:///home/dannywits/Projects/producerConsumer/src/main/java/com/linuxpipe/LinuxPipeServer.java) | `LinuxPipeServer`: Javalin entry point, 25 FPS broadcast loop. |
| **Master UI Layout** | [`frontend/src/App.jsx`](file:///home/dannywits/Projects/producerConsumer/frontend/src/App.jsx) | `App`: Master layout, chapter selector, lab orchestrator. |
| **Story Curriculum** | [`frontend/src/components/StoryMode.jsx`](file:///home/dannywits/Projects/producerConsumer/frontend/src/components/StoryMode.jsx) | `StoryMode`: 4-chapter narrative curriculum with architectural blueprint. |
| **Story Simulators** | [`frontend/src/.../StorySimulators.jsx`](file:///home/dannywits/Projects/producerConsumer/frontend/src/components/story/StorySimulators.jsx) | `NoBufferCollisionSim`, `NaiveBufferOverflowSim`, `LinuxBackpressureSim`. |
| **Hardware Pipeline** | [`frontend/src/.../PhysicalPipelineStage.jsx`](file:///home/dannywits/Projects/producerConsumer/frontend/src/components/PhysicalPipelineStage.jsx) | Renders User Space / Kernel Space stations and fluid reservoir. |
| **Canvas Highway** | [`frontend/src/.../PipeHighwayCanvas.jsx`](file:///home/dannywits/Projects/producerConsumer/frontend/src/components/PipeHighwayCanvas.jsx) | 60 FPS HTML5 Canvas particle renderer. |
| **Memory Slot Map** | [`frontend/src/.../BufferSlotMatrix.jsx`](file:///home/dannywits/Projects/producerConsumer/frontend/src/components/BufferSlotMatrix.jsx) | 16-slot circular matrix with HEAD/TAIL pointers and hex payload viewer. |
| **Control Console** | [`frontend/src/.../ControlDeck.jsx`](file:///home/dannywits/Projects/producerConsumer/frontend/src/components/ControlDeck.jsx) | Syscall delay sliders, F_SETPIPE_SZ capacity, and stress presets. |

### Key Linux Syscalls Referenced

- `pipe2(int pipefd[2], int flags)`: Creates an anonymous IPC pipe.
- `write(int fd, const void *buf, size_t count)`: Writes bytes to the pipe buffer.
- `read(int fd, void *buf, size_t count)`: Reads bytes from the pipe buffer.
- `fcntl(int fd, F_SETPIPE_SZ, int size)`: Resizes the kernel pipe capacity.
- `wake_up_interruptible(wait_queue_head_t *q)`: Wakes up sleeping kernel threads.

---

*This guide contains everything you need to ace your project viva. Review Sections 3, 5, and 6 thoroughly before your defense.*
