package com.linuxpipe.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * Incoming command DTO received over WebSocket from the UI console.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record ProcessControlCommand(
    String action,
    Integer writeDelayMs,
    Integer readDelayMs,
    Integer capacityPages,
    String scenario,
    Boolean paused
) {
}
