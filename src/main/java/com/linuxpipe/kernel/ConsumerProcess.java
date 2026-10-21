package com.linuxpipe.kernel;

import com.linuxpipe.model.KernelStateSnapshot;
import com.linuxpipe.model.MemoryPage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.concurrent.atomic.AtomicLong;

/**
 * Simulates User Space Process B issuing pipe read() syscalls (e.g. grep 500, PID 4103).
 */
public class ConsumerProcess implements Runnable {

    private static final Logger log = LoggerFactory.getLogger(ConsumerProcess.class);

    private final LinuxPipeBuffer buffer;
    private volatile PipeScenario scenario;
    private volatile int readDelayMs = 400;
    private volatile String state = "TASK_RUNNING";
    private volatile boolean running = true;
    private volatile boolean paused = false;
    private int stepsRequested = 0;
    private final Object pauseLock = new Object();

    private final AtomicLong pagesRead = new AtomicLong(0);
    private long lastCalcTimestamp = System.currentTimeMillis();
    private long lastCalcPages = 0;
    private double currentRateKbPerSec = 0.0;
    private Thread workerThread;

    public ConsumerProcess(LinuxPipeBuffer buffer, PipeScenario scenario) {
        this.buffer = buffer;
        this.scenario = scenario;
    }

    public synchronized void start() {
        if (workerThread == null || !workerThread.isAlive()) {
            running = true;
            workerThread = new Thread(this, "Process-B-Consumer-" + scenario.getConsumerPid());
            workerThread.setDaemon(true);
            workerThread.start();
            log.info("Started ConsumerProcess [{}] PID {}", scenario.getConsumerName(), scenario.getConsumerPid());
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
                MemoryPage page = buffer.sysRead(newState -> this.state = newState);
                this.state = "TASK_RUNNING";
                pagesRead.incrementAndGet();

                // Process consumed page (simulating pattern matching / encoding / compression)
                if (page != null) {
                    log.trace("Consumed page {}: {}", page.pageId(), page.payload());
                }

                int delay = readDelayMs;
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
                log.error("Exception in ConsumerProcess: {}", e.getMessage(), e);
            }
        }
        log.info("ConsumerProcess stopped.");
    }

    public void setReadDelayMs(int delayMs) {
        this.readDelayMs = Math.max(10, delayMs);
    }

    public int getReadDelayMs() {
        return readDelayMs;
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
            long currentPages = pagesRead.get();
            long diff = currentPages - lastCalcPages;
            currentRateKbPerSec = Math.round((diff * 4.0 / (elapsed / 1000.0)) * 10.0) / 10.0;
            lastCalcPages = currentPages;
            lastCalcTimestamp = now;
        }
        return currentRateKbPerSec;
    }

    public KernelStateSnapshot.ProcessState toProcessState() {
        return new KernelStateSnapshot.ProcessState(
            scenario.getConsumerPid(),
            scenario.getConsumerName(),
            state,
            scenario.getConsumerSyscall(),
            paused ? 0.0 : getRateKbPerSec()
        );
    }

    public void resetSequence() {
        pagesRead.set(0);
        lastCalcPages = 0;
        lastCalcTimestamp = System.currentTimeMillis();
        currentRateKbPerSec = 0.0;
    }
}
