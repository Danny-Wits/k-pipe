package com.linuxpipe.model;

import java.util.List;

/**
 * Immutable telemetry DTO broadcast to WebSocket clients at ~25 FPS.
 * Strictly reflects Linux kernel internal state (struct pipe_inode_info).
 */
public record KernelStateSnapshot(
    long timestamp,
    int capacity,
    int pageCount,
    double fillPercentage,
    int headPointer,
    int tailPointer,
    boolean mutexLocked,
    ProcessState producer,
    ProcessState consumer,
    WaitQueueState waitQueues,
    List<SlotInfo> pages,
    String scenario
) {
    /**
     * State of a User Space process (Process A or Process B).
     */
    public record ProcessState(
        int pid,
        String name,
        String state,
        String syscall,
        double rateKbPerSec
    ) {}

    /**
     * Linux kernel wait queue counters:
     * wrWaitCount corresponds to pipe->wr_wait (writers sleeping on full buffer).
     * rdWaitCount corresponds to pipe->rd_wait (readers sleeping on empty buffer).
     */
    public record WaitQueueState(
        int wrWaitCount,
        int rdWaitCount
    ) {}

    /**
     * Individual circular buffer slot telemetry.
     */
    public record SlotInfo(
        int slot,
        Integer pageId,
        String hex,
        String payload
    ) {}
}
