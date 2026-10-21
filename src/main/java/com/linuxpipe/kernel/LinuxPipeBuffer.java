package com.linuxpipe.kernel;

import com.linuxpipe.model.KernelStateSnapshot.SlotInfo;
import com.linuxpipe.model.MemoryPage;

import java.util.ArrayList;
import java.util.List;

/**
 * Thread-safe ring buffer representing the Linux kernel's struct pipe_inode_info (fs/pipe.c).
 * Uses condition synchronization (wait/notifyAll) to simulate Linux pipe wait queues (wr_wait, rd_wait).
 */
public class LinuxPipeBuffer {

    private int capacity;
    private MemoryPage[] ring;
    private int head; // write pointer (monotonic count of writes)
    private int tail; // read pointer (monotonic count of reads)
    private int count; // number of pages currently in buffer
    private boolean mutexLocked;
    private int wrWaitCount; // processes in wr_wait queue
    private int rdWaitCount; // processes in rd_wait queue

    public LinuxPipeBuffer(int initialCapacity) {
        if (initialCapacity <= 0) {
            throw new IllegalArgumentException("Capacity must be positive");
        }
        this.capacity = initialCapacity;
        this.ring = new MemoryPage[initialCapacity];
        this.head = 0;
        this.tail = 0;
        this.count = 0;
        this.mutexLocked = false;
        this.wrWaitCount = 0;
        this.rdWaitCount = 0;
    }

    public LinuxPipeBuffer() {
        this(16); // Default 16 pages (64KB in Linux kernel)
    }

    /**
     * pipe_write() syscall implementation.
     */
    public synchronized void sysWrite(MemoryPage page) throws InterruptedException {
        sysWrite(page, null);
    }

    /**
     * pipe_write() with state listener to update process state when blocked on wr_wait queue.
     */
    public synchronized void sysWrite(MemoryPage page, StateListener listener) throws InterruptedException {
        mutexLocked = true;
        try {
            while (count == capacity) {
                wrWaitCount++;
                if (listener != null) {
                    listener.onBlocked();
                }
                mutexLocked = false;
                try {
                    wait();
                } finally {
                    mutexLocked = true;
                    wrWaitCount--;
                }
            }
            if (listener != null) {
                listener.onRunning();
            }
            ring[head % capacity] = page;
            head++;
            count++;
            notifyAll();
        } finally {
            mutexLocked = false;
        }
    }

    /**
     * pipe_read() syscall implementation.
     */
    public synchronized MemoryPage sysRead() throws InterruptedException {
        return sysRead(null);
    }

    /**
     * pipe_read() with state listener to update process state when blocked on rd_wait queue.
     */
    public synchronized MemoryPage sysRead(StateListener listener) throws InterruptedException {
        mutexLocked = true;
        try {
            while (count == 0) {
                rdWaitCount++;
                if (listener != null) {
                    listener.onBlocked();
                }
                mutexLocked = false;
                try {
                    wait();
                } finally {
                    mutexLocked = true;
                    rdWaitCount--;
                }
            }
            if (listener != null) {
                listener.onRunning();
            }
            MemoryPage page = ring[tail % capacity];
            ring[tail % capacity] = null;
            tail++;
            count--;
            notifyAll();
            return page;
        } finally {
            mutexLocked = false;
        }
    }

    /**
     * Dynamic resizing of the pipe buffer (fcntl F_SETPIPE_SZ).
     */
    public synchronized void resize(int newCapacity) {
        if (newCapacity <= 0 || newCapacity == this.capacity) {
            return;
        }
        mutexLocked = true;
        try {
            // In Linux kernel, pipe capacity cannot be shrunk smaller than unread data
            int effectiveCapacity = Math.max(newCapacity, count);
            MemoryPage[] newRing = new MemoryPage[effectiveCapacity];
            for (int i = 0; i < count; i++) {
                newRing[i] = ring[(tail + i) % capacity];
            }
            this.ring = newRing;
            this.head = count;
            this.tail = 0;
            this.capacity = effectiveCapacity;
            notifyAll(); // wake up any waiting writers if capacity expanded
        } finally {
            mutexLocked = false;
        }
    }

    /**
     * Reset buffer state for scenario reset.
     */
    public synchronized void clear() {
        mutexLocked = true;
        try {
            for (int i = 0; i < capacity; i++) {
                ring[i] = null;
            }
            head = 0;
            tail = 0;
            count = 0;
            notifyAll();
        } finally {
            mutexLocked = false;
        }
    }

    public synchronized int getHead() {
        return head;
    }

    public synchronized int getTail() {
        return tail;
    }

    public synchronized int getHeadSlot() {
        return head % capacity;
    }

    public synchronized int getTailSlot() {
        return tail % capacity;
    }

    public synchronized int getCount() {
        return count;
    }

    public synchronized int getCapacity() {
        return capacity;
    }

    public synchronized boolean isFull() {
        return count >= capacity;
    }

    public synchronized boolean isEmpty() {
        return count == 0;
    }

    public synchronized boolean isMutexLocked() {
        return mutexLocked;
    }

    public synchronized int getWrWaitCount() {
        return wrWaitCount;
    }

    public synchronized int getRdWaitCount() {
        return rdWaitCount;
    }

    /**
     * Generates an immutable snapshot of all ring buffer slots.
     */
    public synchronized List<SlotInfo> getSlotsSnapshot() {
        List<SlotInfo> slots = new ArrayList<>(capacity);
        for (int i = 0; i < capacity; i++) {
            MemoryPage page = ring[i];
            String hex = (page != null) 
                ? page.hexAddress() 
                : String.format("0x7fff%04x", (i + 1) * 0x1000);
            slots.add(new SlotInfo(
                i,
                page != null ? page.pageId() : null,
                hex,
                page != null ? page.payload() : null
            ));
        }
        return slots;
    }
}
