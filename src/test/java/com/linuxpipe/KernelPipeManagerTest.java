package com.linuxpipe;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.linuxpipe.kernel.KernelPipeManager;
import com.linuxpipe.kernel.PipeScenario;
import com.linuxpipe.model.KernelStateSnapshot;
import com.linuxpipe.model.ProcessControlCommand;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("KernelPipeManager & Telemetry DTO Tests")
class KernelPipeManagerTest {

    private KernelPipeManager manager;
    private final ObjectMapper mapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        manager = new KernelPipeManager(16, PipeScenario.CAT_GREP);
    }

    @AfterEach
    void tearDown() {
        manager.stop();
    }

    @Test
    @DisplayName("Generates valid snapshot with all required kernel fields")
    void testSnapshotStructure() {
        KernelStateSnapshot snapshot = manager.generateSnapshot();

        assertNotNull(snapshot);
        assertTrue(snapshot.timestamp() > 0);
        assertEquals(16, snapshot.capacity());
        assertEquals(0, snapshot.pageCount());
        assertEquals(0.0, snapshot.fillPercentage());
        assertEquals(0, snapshot.headPointer());
        assertEquals(0, snapshot.tailPointer());
        assertFalse(snapshot.mutexLocked());
        assertEquals("CAT_GREP", snapshot.scenario());

        // Producer verification
        assertNotNull(snapshot.producer());
        assertEquals(4102, snapshot.producer().pid());
        assertEquals("cat access.log", snapshot.producer().name());
        assertEquals("TASK_RUNNING", snapshot.producer().state());
        assertEquals("write(pipefd[1], buf, 4096)", snapshot.producer().syscall());

        // Consumer verification
        assertNotNull(snapshot.consumer());
        assertEquals(4103, snapshot.consumer().pid());
        assertEquals("grep 500", snapshot.consumer().name());
        assertEquals("TASK_RUNNING", snapshot.consumer().state());
        assertEquals("read(pipefd[0], buf, 4096)", snapshot.consumer().syscall());

        // Wait queues
        assertNotNull(snapshot.waitQueues());
        assertEquals(0, snapshot.waitQueues().wrWaitCount());
        assertEquals(0, snapshot.waitQueues().rdWaitCount());

        // Pages
        assertNotNull(snapshot.pages());
        assertEquals(16, snapshot.pages().size());
    }

    @Test
    @DisplayName("Serializes KernelStateSnapshot into JSON matching README schema")
    void testSnapshotJsonSerialization() throws Exception {
        KernelStateSnapshot snapshot = manager.generateSnapshot();
        String json = mapper.writeValueAsString(snapshot);

        assertNotNull(json);
        assertTrue(json.contains("\"capacity\":16"));
        assertTrue(json.contains("\"scenario\":\"CAT_GREP\""));
        assertTrue(json.contains("\"producer\""));
        assertTrue(json.contains("\"consumer\""));
        assertTrue(json.contains("\"waitQueues\""));
        assertTrue(json.contains("\"pages\""));
        assertTrue(json.contains("\"pid\":4102"));
        assertTrue(json.contains("\"pid\":4103"));
    }

    @Test
    @DisplayName("Handles CONFIG and PAUSE/RESUME commands properly")
    void testCommandHandling() {
        ProcessControlCommand cmd = new ProcessControlCommand(
            "CONFIG",
            100,
            200,
            8,
            "FFMPEG_X264",
            true
        );

        manager.handleCommand(cmd);

        assertTrue(manager.isPaused());
        assertEquals(PipeScenario.FFMPEG_X264, manager.getCurrentScenario());
        assertEquals(8, manager.getBuffer().getCapacity());
        assertEquals(100, manager.getProducer().getWriteDelayMs());
        assertEquals(200, manager.getConsumer().getReadDelayMs());

        KernelStateSnapshot snapshot = manager.generateSnapshot();
        assertEquals("FFMPEG_X264", snapshot.scenario());
        assertEquals(8, snapshot.capacity());
        assertEquals(5210, snapshot.producer().pid());
        assertEquals(5211, snapshot.consumer().pid());

        // Resume
        manager.handleCommand(new ProcessControlCommand("RESUME", null, null, null, null, false));
        assertFalse(manager.isPaused());
    }

    @Test
    @DisplayName("Deserializes ProcessControlCommand from client JSON")
    void testCommandJsonDeserialization() throws Exception {
        String clientJson = """
            {
              "action": "CONFIG",
              "writeDelayMs": 300,
              "readDelayMs": 600,
              "capacityPages": 32,
              "scenario": "TAR_GZIP",
              "paused": false
            }
            """;

        ProcessControlCommand cmd = mapper.readValue(clientJson, ProcessControlCommand.class);
        assertEquals("CONFIG", cmd.action());
        assertEquals(300, cmd.writeDelayMs());
        assertEquals(600, cmd.readDelayMs());
        assertEquals(32, cmd.capacityPages());
        assertEquals("TAR_GZIP", cmd.scenario());
        assertFalse(cmd.paused());
    }
}
