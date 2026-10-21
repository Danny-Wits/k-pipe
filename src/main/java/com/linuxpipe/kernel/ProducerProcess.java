package com.linuxpipe.kernel;

import com.linuxpipe.model.KernelStateSnapshot;
import com.linuxpipe.model.MemoryPage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Simulates User Space Process A issuing pipe write() syscalls (e.g. cat access.log, PID 4102).
 */
public class ProducerProcess implements Runnable {

    private static final Logger log = LoggerFactory.getLogger(ProducerProcess.class);

    private final LinuxPipeBuffer buffer;
    private volatile PipeScenario scenario;
    private volatile int writeDelayMs = 250;
    private volatile String state = "TASK_RUNNING";
    private volatile boolean running = true;
    private volatile boolean paused = false;
    private int stepsRequested = 0;
    private final Object pauseLock = new Object();

    private int pageSequence = 1;
    private final AtomicLong pagesWritten = new AtomicLong(0);
    private long lastCalcTimestamp = System.currentTimeMillis();
    private long lastCalcPages = 0;
    private double currentRateKbPerSec = 0.0;
    private Thread workerThread;

    public ProducerProcess(LinuxPipeBuffer buffer, PipeScenario scenario) {
        this.buffer = buffer;
        this.scenario = scenario;
    }

    public synchronized void start() {
        if (workerThread == null || !workerThread.isAlive()) {
            running = true;
            workerThread = new Thread(this, "Process-A-Producer-" + scenario.getProducerPid());
            workerThread.setDaemon(true);
            workerThread.start();
            log.info("Started ProducerProcess [{}] PID {}", scenario.getProducerName(), scenario.getProducerPid());
        }
    }

    public synchronized void stop() {
        running = false;
        synchronized (pauseLock) {
            pauseLock.notifyAll();
        }
        if (workerThread != null) {
            workerThread.interrupt();
        }
    }

    @Override
    public void run() {
        while (running) {
            try {
                synchronized (pauseLock) {
                    while (paused && stepsRequested <= 0 && running) {
                        state = "TASK_INTERRUPTIBLE";
                        pauseLock.wait();
                    }
                    if (!running) break;
                    if (stepsRequested > 0) {
                        stepsRequested--;
                    }
                }

                state = "TASK_RUNNING";
                MemoryPage page = generateNextPage();
                
                buffer.sysWrite(page, newState -> this.state = newState);
                this.state = "TASK_RUNNING";
                pagesWritten.incrementAndGet();

                int delay = writeDelayMs;
                if (delay > 0) {
                    Thread.sleep(delay);
                }
            } catch (InterruptedException e) {
                if (!running) {
                    break;
                }
                Thread.currentThread().interrupt();
                break;
            } catch (Exception e) {
                log.error("Exception in ProducerProcess: {}", e.getMessage(), e);
            }
        }
        log.info("ProducerProcess stopped.");
    }

    private MemoryPage generateNextPage() {
        int id = pageSequence++;
        String hexAddress = String.format("0x%08x", 0x7fff0000L + (long) ((id % 256) + 1) * 0x1000L);
        List<String> payloads = scenario.getSamplePayloads();
        String payload = payloads.get((id - 1) % payloads.size());
        return new MemoryPage(id, hexAddress, payload, System.currentTimeMillis());
    }

    public void setWriteDelayMs(int delayMs) {
        this.writeDelayMs = Math.max(10, delayMs);
    }

    public int getWriteDelayMs() {
        return writeDelayMs;
    }

    public void setScenario(PipeScenario scenario) {
        this.scenario = scenario;
    }

    public PipeScenario getScenario() {
        return scenario;
    }

    public void setPaused(boolean paused) {
        synchronized (pauseLock) {
            this.paused = paused;
            if (!paused) {
                pauseLock.notifyAll();
            }
        }
    }

    public boolean isPaused() {
        return paused;
    }

    public void step() {
        synchronized (pauseLock) {
            stepsRequested++;
            pauseLock.notifyAll();
        }
    }

    public synchronized double getRateKbPerSec() {
        long now = System.currentTimeMillis();
        long elapsed = now - lastCalcTimestamp;
        if (elapsed >= 500) {
            long currentPages = pagesWritten.get();
            long diff = currentPages - lastCalcPages;
            currentRateKbPerSec = Math.round((diff * 4.0 / (elapsed / 1000.0)) * 10.0) / 10.0;
            lastCalcPages = currentPages;
            lastCalcTimestamp = now;
        }
        return currentRateKbPerSec;
    }

    public KernelStateSnapshot.ProcessState toProcessState() {
        return new KernelStateSnapshot.ProcessState(
            scenario.getProducerPid(),
            scenario.getProducerName(),
            state,
            scenario.getProducerSyscall(),
            paused ? 0.0 : getRateKbPerSec()
        );
    }

    public void resetSequence() {
        pageSequence = 1;
        pagesWritten.set(0);
        lastCalcPages = 0;
        lastCalcTimestamp = System.currentTimeMillis();
        currentRateKbPerSec = 0.0;
    }
}
