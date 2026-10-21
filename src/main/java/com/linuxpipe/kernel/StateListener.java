package com.linuxpipe.kernel;

/**
 * Callback interface invoked when a process enters or leaves a blocked kernel wait queue state.
 */
@FunctionalInterface
public interface StateListener {
    void onStateChange(String newState);

    default void onBlocked() {
        onStateChange("TASK_INTERRUPTIBLE");
    }

    default void onRunning() {
        onStateChange("TASK_RUNNING");
    }
}
