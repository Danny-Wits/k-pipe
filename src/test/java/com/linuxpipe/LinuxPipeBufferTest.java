package com.linuxpipe;

import com.linuxpipe.kernel.LinuxPipeBuffer;
import com.linuxpipe.model.MemoryPage;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Timeout;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicReference;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("LinuxPipeBuffer (struct pipe_inode_info) Unit Tests")
class LinuxPipeBufferTest {

    @Test
    @DisplayName("Normal FIFO produce and consume operations")
    void testNormalProduceConsume() throws InterruptedException {
        LinuxPipeBuffer buffer = new LinuxPipeBuffer(4);

        assertTrue(buffer.isEmpty());
        assertEquals(0, buffer.getCount());
        assertEquals(4, buffer.getCapacity());

        MemoryPage page1 = new MemoryPage(1, "0x7fff1000", "payload-1", System.currentTimeMillis());
        MemoryPage page2 = new MemoryPage(2, "0x7fff2000", "payload-2", System.currentTimeMillis());

        buffer.sysWrite(page1);
        buffer.sysWrite(page2);

        assertEquals(2, buffer.getCount());
        assertFalse(buffer.isEmpty());
        assertFalse(buffer.isFull());
        assertEquals(2, buffer.getHead());
        assertEquals(0, buffer.getTail());

        MemoryPage read1 = buffer.sysRead();
        assertNotNull(read1);
        assertEquals(1, read1.pageId());
        assertEquals("payload-1", read1.payload());
        assertEquals(1, buffer.getCount());
        assertEquals(1, buffer.getTail());

        MemoryPage read2 = buffer.sysRead();
        assertNotNull(read2);
        assertEquals(2, read2.pageId());
        assertEquals("payload-2", read2.payload());
        assertEquals(0, buffer.getCount());
        assertTrue(buffer.isEmpty());
        assertEquals(2, buffer.getTail());
    }

    @Test
    @Timeout(value = 5, unit = TimeUnit.SECONDS)
    @DisplayName("sysRead blocks on rd_wait queue when buffer is empty until writer produces")
    void testBlockingWhenEmpty() throws Exception {
        LinuxPipeBuffer buffer = new LinuxPipeBuffer(2);
        CountDownLatch readStarted = new CountDownLatch(1);
        CountDownLatch readCompleted = new CountDownLatch(1);
        AtomicReference<MemoryPage> consumedPage = new AtomicReference<>();
        AtomicBoolean wasBlocked = new AtomicBoolean(false);

        Thread readerThread = new Thread(() -> {
            try {
                readStarted.countDown();
                MemoryPage page = buffer.sysRead(newState -> {
                    if ("TASK_INTERRUPTIBLE".equals(newState)) {
                        wasBlocked.set(true);
                    }
                });
                consumedPage.set(page);
                readCompleted.countDown();
            } catch (InterruptedException ignored) {
            }
        });

        readerThread.start();
        assertTrue(readStarted.await(1, TimeUnit.SECONDS));

        // Allow reader to enter wait state
        Thread.sleep(80);

        assertEquals(1, buffer.getRdWaitCount(), "Reader should be queued on rd_wait");
        assertTrue(wasBlocked.get(), "Reader state listener should record TASK_INTERRUPTIBLE");
        assertEquals(1, readCompleted.getCount(), "Reader should still be blocked");

        // Write page from writer thread
        MemoryPage page = new MemoryPage(101, "0x7fff1000", "log-entry-101", System.currentTimeMillis());
        buffer.sysWrite(page);

        assertTrue(readCompleted.await(2, TimeUnit.SECONDS), "Reader should wake up after write");
        assertNotNull(consumedPage.get());
        assertEquals(101, consumedPage.get().pageId());
        assertEquals(0, buffer.getRdWaitCount(), "rd_wait queue should be empty");

        readerThread.join();
    }

    @Test
    @Timeout(value = 5, unit = TimeUnit.SECONDS)
    @DisplayName("sysWrite blocks on wr_wait queue when buffer is full until reader consumes")
    void testBlockingWhenFull() throws Exception {
        LinuxPipeBuffer buffer = new LinuxPipeBuffer(2);

        // Fill buffer to capacity
        buffer.sysWrite(new MemoryPage(1, "0x7fff1000", "page-1", System.currentTimeMillis()));
        buffer.sysWrite(new MemoryPage(2, "0x7fff2000", "page-2", System.currentTimeMillis()));

        assertTrue(buffer.isFull());
        assertEquals(2, buffer.getCount());

        CountDownLatch writeStarted = new CountDownLatch(1);
        CountDownLatch writeCompleted = new CountDownLatch(1);
        AtomicBoolean wasBlocked = new AtomicBoolean(false);

        Thread writerThread = new Thread(() -> {
            try {
                writeStarted.countDown();
                buffer.sysWrite(
                    new MemoryPage(3, "0x7fff3000", "page-3", System.currentTimeMillis()),
                    newState -> {
                        if ("TASK_INTERRUPTIBLE".equals(newState)) {
                            wasBlocked.set(true);
                        }
                    }
                );
                writeCompleted.countDown();
            } catch (InterruptedException ignored) {
            }
        });

        writerThread.start();
        assertTrue(writeStarted.await(1, TimeUnit.SECONDS));

        // Allow writer to hit full buffer condition and wait
        Thread.sleep(80);

        assertEquals(1, buffer.getWrWaitCount(), "Writer should be queued on wr_wait");
        assertTrue(wasBlocked.get(), "Writer state listener should record TASK_INTERRUPTIBLE");
        assertEquals(1, writeCompleted.getCount(), "Writer should still be blocked");

        // Consume 1 page to create space
        MemoryPage consumed = buffer.sysRead();
        assertNotNull(consumed);
        assertEquals(1, consumed.pageId());

        assertTrue(writeCompleted.await(2, TimeUnit.SECONDS), "Writer should unblock after read");
        assertEquals(0, buffer.getWrWaitCount(), "wr_wait queue should be empty");
        assertEquals(2, buffer.getCount());

        writerThread.join();
    }

    @Test
    @DisplayName("Circular wrap-around indexing maintains correct FIFO ordering")
    void testCircularWrapping() throws InterruptedException {
        LinuxPipeBuffer buffer = new LinuxPipeBuffer(3);

        for (int i = 0; i < 10; i++) {
            buffer.sysWrite(new MemoryPage(i, "0x7fff" + i, "item-" + i, System.currentTimeMillis()));
            MemoryPage read = buffer.sysRead();
            assertEquals(i, read.pageId());
            assertEquals("item-" + i, read.payload());
        }

        assertEquals(10, buffer.getHead());
        assertEquals(10, buffer.getTail());
        assertEquals(0, buffer.getCount());
        assertTrue(buffer.isEmpty());
    }

    @Test
    @DisplayName("Dynamic buffer resizing (fcntl F_SETPIPE_SZ) preserves ordering and wakes waiting writers")
    void testDynamicResizing() throws InterruptedException {
        LinuxPipeBuffer buffer = new LinuxPipeBuffer(2);

        buffer.sysWrite(new MemoryPage(10, "0x1000", "p10", System.currentTimeMillis()));
        buffer.sysWrite(new MemoryPage(20, "0x2000", "p20", System.currentTimeMillis()));

        assertTrue(buffer.isFull());

        // Expand buffer capacity
        buffer.resize(4);

        assertEquals(4, buffer.getCapacity());
        assertEquals(2, buffer.getCount());
        assertFalse(buffer.isFull());

        // Can now write without blocking
        buffer.sysWrite(new MemoryPage(30, "0x3000", "p30", System.currentTimeMillis()));
        buffer.sysWrite(new MemoryPage(40, "0x4000", "p40", System.currentTimeMillis()));

        assertEquals(4, buffer.getCount());
        assertTrue(buffer.isFull());

        assertEquals(10, buffer.sysRead().pageId());
        assertEquals(20, buffer.sysRead().pageId());
        assertEquals(30, buffer.sysRead().pageId());
        assertEquals(40, buffer.sysRead().pageId());
        assertTrue(buffer.isEmpty());
    }

    @Test
    @DisplayName("Buffer slots snapshot returns correct slot metadata")
    void testSlotsSnapshot() throws InterruptedException {
        LinuxPipeBuffer buffer = new LinuxPipeBuffer(4);
        buffer.sysWrite(new MemoryPage(1, "0x7fff1000", "data-1", System.currentTimeMillis()));

        var slots = buffer.getSlotsSnapshot();
        assertEquals(4, slots.size());

        assertEquals(0, slots.get(0).slot());
        assertEquals(1, slots.get(0).pageId());
        assertEquals("0x7fff1000", slots.get(0).hex());
        assertEquals("data-1", slots.get(0).payload());

        assertEquals(1, slots.get(1).slot());
        assertNull(slots.get(1).pageId());
        assertNotNull(slots.get(1).hex());
        assertNull(slots.get(1).payload());
    }
}
