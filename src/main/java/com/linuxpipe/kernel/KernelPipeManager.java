package com.linuxpipe.kernel;

import com.linuxpipe.model.KernelStateSnapshot;
import com.linuxpipe.model.ProcessControlCommand;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

/**
 * Kernel subsystem orchestrator managing the pipe ring buffer,
 * User Space processes (A & B), workload presets, and telemetry generation.
 */
public class KernelPipeManager {

    private static final Logger log = LoggerFactory.getLogger(KernelPipeManager.class);

    private final LinuxPipeBuffer buffer;
    private final ProducerProcess producer;
    private final ConsumerProcess consumer;
    private volatile PipeScenario currentScenario;
    private volatile boolean paused = false;

    public KernelPipeManager(int initialCapacity, PipeScenario initialScenario) {
        this.currentScenario = initialScenario != null ? initialScenario : PipeScenario.CAT_GREP;
        this.buffer = new LinuxPipeBuffer(initialCapacity);
        this.producer = new ProducerProcess(buffer, currentScenario);
        this.consumer = new ConsumerProcess(buffer, currentScenario);
    }

    public KernelPipeManager() {
        this(16, PipeScenario.CAT_GREP);
    }

    public void start() {
        log.info("Initializing Linux Pipe Kernel Subsystem [Scenario: {}]...", currentScenario.getId());
        producer.start();
        consumer.start();
    }

    public void stop() {
        log.info("Stopping Linux Pipe Kernel Subsystem...");
        producer.stop();
        consumer.stop();
    }

    public synchronized void switchScenario(PipeScenario newScenario) {
        if (newScenario == null || newScenario == this.currentScenario) {
            return;
        }
        log.info("Switching scenario from {} to {}", this.currentScenario.getId(), newScenario.getId());
        this.currentScenario = newScenario;
        producer.setScenario(newScenario);
        consumer.setScenario(newScenario);
        buffer.clear();
        producer.resetSequence();
        consumer.resetSequence();
    }

    public synchronized void setPaused(boolean paused) {
        this.paused = paused;
        producer.setPaused(paused);
        consumer.setPaused(paused);
        log.info("Pipeline execution {}", paused ? "PAUSED" : "RESUMED");
    }

    public boolean isPaused() {
        return paused;
    }

    public synchronized void step() {
        producer.step();
        consumer.step();
        log.debug("Pipeline stepped 1 cycle.");
    }

    public synchronized void handleCommand(ProcessControlCommand cmd) {
        if (cmd == null) return;
        log.info("Processing control command: action={}, scenario={}, writeDelayMs={}, readDelayMs={}, capacityPages={}, paused={}",
                cmd.action(), cmd.scenario(), cmd.writeDelayMs(), cmd.readDelayMs(), cmd.capacityPages(), cmd.paused());

        if (cmd.scenario() != null && !cmd.scenario().isBlank()) {
            switchScenario(PipeScenario.fromString(cmd.scenario()));
        }

        if (cmd.writeDelayMs() != null) {
            producer.setWriteDelayMs(cmd.writeDelayMs());
        }

        if (cmd.readDelayMs() != null) {
            consumer.setReadDelayMs(cmd.readDelayMs());
        }

        if (cmd.capacityPages() != null) {
            buffer.resize(cmd.capacityPages());
        }

        if (cmd.paused() != null) {
            setPaused(cmd.paused());
        }

        String action = cmd.action() != null ? cmd.action().trim().toUpperCase() : "";
        switch (action) {
            case "PAUSE" -> setPaused(true);
            case "RESUME" -> setPaused(false);
            case "STEP" -> step();
            case "SCENARIO" -> {
                if (cmd.scenario() != null) {
                    switchScenario(PipeScenario.fromString(cmd.scenario()));
                }
            }
            default -> {
                // CONFIG or unhandled action already applied via attributes
            }
        }
    }

    public KernelStateSnapshot generateSnapshot() {
        long timestamp = System.currentTimeMillis();
        int capacity = buffer.getCapacity();
        int pageCount = buffer.getCount();
        double fillPercentage = capacity > 0 ? ((double) pageCount / capacity) * 100.0 : 0.0;
        fillPercentage = Math.round(fillPercentage * 100.0) / 100.0;
        int headPointer = buffer.getHead();
        int tailPointer = buffer.getTail();
        boolean mutexLocked = buffer.isMutexLocked();

        KernelStateSnapshot.ProcessState prodState = producer.toProcessState();
        KernelStateSnapshot.ProcessState consState = consumer.toProcessState();
        KernelStateSnapshot.WaitQueueState waitQueueState = new KernelStateSnapshot.WaitQueueState(
            buffer.getWrWaitCount(),
            buffer.getRdWaitCount()
        );
        List<KernelStateSnapshot.SlotInfo> slots = buffer.getSlotsSnapshot();

        return new KernelStateSnapshot(
            timestamp,
            capacity,
            pageCount,
            fillPercentage,
            headPointer,
            tailPointer,
            mutexLocked,
            prodState,
            consState,
            waitQueueState,
            slots,
            currentScenario.getId()
        );
    }

    public LinuxPipeBuffer getBuffer() {
        return buffer;
    }

    public ProducerProcess getProducer() {
        return producer;
    }

    public ConsumerProcess getConsumer() {
        return consumer;
    }

    public PipeScenario getCurrentScenario() {
        return currentScenario;
    }
}
