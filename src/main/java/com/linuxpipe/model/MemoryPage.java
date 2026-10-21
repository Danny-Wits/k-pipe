package com.linuxpipe.model;

/**
 * Represents a discrete 4KB memory page within the Linux kernel ring buffer.
 *
 * @param pageId     Sequential monotonically increasing page sequence identifier.
 * @param hexAddress Simulated kernel virtual memory address (e.g., 0x7fff1000).
 * @param payload    Realistic text or binary data snippet held in the page buffer.
 * @param timestamp  Epoch timestamp (ms) when page was allocated/written.
 */
public record MemoryPage(
    int pageId,
    String hexAddress,
    String payload,
    long timestamp
) {
}
