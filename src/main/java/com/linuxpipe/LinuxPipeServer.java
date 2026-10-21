package com.linuxpipe;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.linuxpipe.kernel.KernelPipeManager;
import com.linuxpipe.model.KernelStateSnapshot;
import com.linuxpipe.model.ProcessControlCommand;
import io.javalin.Javalin;
import io.javalin.json.JavalinJackson;
import io.javalin.websocket.WsContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

/**
 * Main application entry point for K-PIPE backend.
 * Starts lightweight Javalin server, handles WebSocket telemetry at 25 FPS,
 * and processes incoming kernel control commands.
 */
public class LinuxPipeServer {

    private static final Logger log = LoggerFactory.getLogger(LinuxPipeServer.class);
    private static final int DEFAULT_PORT = 8080;
    private static final int TELEMETRY_INTERVAL_MS = 40; // 25 FPS

    private final int port;
    private final KernelPipeManager kernelManager;
    private final ObjectMapper objectMapper;
    private final Set<WsContext> activeSessions = ConcurrentHashMap.newKeySet();
    private Javalin app;
    private ScheduledExecutorService broadcastScheduler;

    public LinuxPipeServer(int port) {
        this.port = port;
        this.kernelManager = new KernelPipeManager();
        this.objectMapper = new ObjectMapper();
    }

    public LinuxPipeServer() {
        this(resolvePort());
    }

    private static int resolvePort() {
        String portEnv = System.getenv("PORT");
        if (portEnv != null && !portEnv.isBlank()) {
            try {
                return Integer.parseInt(portEnv.trim());
            } catch (NumberFormatException ignored) {
            }
        }
        return DEFAULT_PORT;
    }

    public synchronized void start() {
        log.info("Starting K-PIPE Linux Kernel Visualizer on port {}...", port);

        // Start kernel simulation subsystem
        kernelManager.start();

        // Configure Javalin with CORS and Jackson JSON mapper
        app = Javalin.create(config -> {
            config.bundledPlugins.enableCors(cors -> cors.addRule(it -> it.anyHost()));
            config.jsonMapper(new JavalinJackson(objectMapper, false));
            config.showJavalinBanner = false;
        });

        // Health check endpoint
        app.get("/health", ctx -> ctx.result("OK"));

        // REST snapshot endpoint for debugging / polling
        app.get("/api/snapshot", ctx -> ctx.json(kernelManager.generateSnapshot()));

        // WebSocket telemetry & control channel
        app.ws("/ws/telemetry", ws -> {
            ws.onConnect(ctx -> {
                activeSessions.add(ctx);
                log.info("Client connected to telemetry stream: sessionId={}", ctx.sessionId());
                try {
                    KernelStateSnapshot initial = kernelManager.generateSnapshot();
                    ctx.send(objectMapper.writeValueAsString(initial));
                } catch (Exception e) {
                    log.error("Error sending initial snapshot: {}", e.getMessage());
                }
            });

            ws.onMessage(ctx -> {
                try {
                    String payload = ctx.message();
                    ProcessControlCommand cmd = objectMapper.readValue(payload, ProcessControlCommand.class);
                    kernelManager.handleCommand(cmd);
                    // Broadcast immediate state update
                    broadcastSnapshot();
                } catch (Exception e) {
                    log.warn("Failed to process incoming WebSocket command: {}", e.getMessage());
                }
            });

            ws.onClose(ctx -> {
                activeSessions.remove(ctx);
                log.info("Client disconnected: sessionId={}", ctx.sessionId());
            });

            ws.onError(ctx -> {
                activeSessions.remove(ctx);
                log.warn("WebSocket session error: sessionId={}, error={}", ctx.sessionId(), ctx.error());
            });
        });

        app.start(port);
        log.info("K-PIPE Kernel Server started successfully at http://localhost:{}/", port);
        log.info("WebSocket telemetry stream live at ws://localhost:{}/ws/telemetry", port);

        // Start 25 FPS broadcast loop
        broadcastScheduler = Executors.newSingleThreadScheduledExecutor(r -> {
            Thread t = new Thread(r, "k-pipe-telemetry-broadcaster");
            t.setDaemon(true);
            return t;
        });

        broadcastScheduler.scheduleAtFixedRate(this::broadcastSnapshot, 0, TELEMETRY_INTERVAL_MS, TimeUnit.MILLISECONDS);

        // Register shutdown hook
        Runtime.getRuntime().addShutdownHook(new Thread(this::stop, "k-pipe-shutdown-hook"));
    }

    public synchronized void stop() {
        log.info("Stopping K-PIPE Kernel Server...");
        if (broadcastScheduler != null && !broadcastScheduler.isShutdown()) {
            broadcastScheduler.shutdownNow();
        }
        kernelManager.stop();
        if (app != null) {
            app.stop();
        }
        log.info("K-PIPE Kernel Server stopped.");
    }

    private void broadcastSnapshot() {
        if (activeSessions.isEmpty()) {
            return;
        }

        try {
            KernelStateSnapshot snapshot = kernelManager.generateSnapshot();
            String json = objectMapper.writeValueAsString(snapshot);

            for (WsContext session : activeSessions) {
                try {
                    if (session.session.isOpen()) {
                        session.send(json);
                    } else {
                        activeSessions.remove(session);
                    }
                } catch (Exception e) {
                    activeSessions.remove(session);
                }
            }
        } catch (Exception e) {
            log.error("Failed to broadcast telemetry frame: {}", e.getMessage());
        }
    }

    public KernelPipeManager getKernelManager() {
        return kernelManager;
    }

    public int getPort() {
        return port;
    }

    public static void main(String[] args) {
        LinuxPipeServer server = new LinuxPipeServer();
        server.start();
    }
}
