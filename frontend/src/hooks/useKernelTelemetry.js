import { useState, useEffect, useRef, useCallback } from 'react';

// Scenarios definition
export const SCENARIOS = {
  CAT_GREP: {
    id: 'CAT_GREP',
    name: 'cat access.log | grep 500',
    producerName: 'cat access.log',
    producerPid: 4102,
    consumerName: 'grep "500"',
    consumerPid: 4103,
    description: 'Web Server Log Analysis Pipeline',
    samplePayloads: [
      '192.168.1.10 - - [21/Oct] "GET /api/v1/auth" 200 4096',
      '10.0.0.45 - - [21/Oct] "POST /checkout" 500 128 [INTERNAL ERROR]',
      '172.16.0.8 - - [21/Oct] "GET /static/app.js" 304 0',
      '192.168.1.99 - - [21/Oct] "DELETE /session" 500 512 [DB TIMEOUT]',
      '10.0.0.12 - - [21/Oct] "GET /healthz" 200 64'
    ]
  },
  FFMPEG_X264: {
    id: 'FFMPEG_X264',
    name: 'ffmpeg -i raw.yuv | x264',
    producerName: 'ffmpeg -i raw.yuv',
    producerPid: 5821,
    consumerName: 'x264 --crf 18',
    consumerPid: 5822,
    description: 'Real-Time YUV Video Transcode Stream',
    samplePayloads: [
      'FRAME#1042 YUV420p [1920x1080] QP=22 Slice:I CRC:0x8F21',
      'FRAME#1043 YUV420p [1920x1080] QP=24 Slice:P CRC:0xA3C9',
      'FRAME#1044 YUV420p [1920x1080] QP=25 Slice:B CRC:0x41E0',
      'FRAME#1045 YUV420p [1920x1080] QP=23 Slice:B CRC:0x77D2',
      'FRAME#1046 YUV420p [1920x1080] QP=21 Slice:P CRC:0x09B8'
    ]
  },
  TAR_GZIP: {
    id: 'TAR_GZIP',
    name: 'tar -cf - /var/log | gzip',
    producerName: 'tar -cf - /var/log',
    producerPid: 7914,
    consumerName: 'gzip -9 -c',
    consumerPid: 7915,
    description: 'Multi-Megabyte Archive Compression Stream',
    samplePayloads: [
      'USTAR /var/log/syslog.1.gz offset=0x00040000 chksum=0421',
      'USTAR /var/log/nginx/access.log offset=0x00080000 chksum=0115',
      'USTAR /var/log/kern.log offset=0x000C0000 chksum=0732',
      'USTAR /var/log/auth.log offset=0x00100000 chksum=0254',
      'USTAR /var/log/dpkg.log offset=0x00140000 chksum=0641'
    ]
  }
};

const BASE_PAGE_ADDRESS = 0xffff888100200000n;

function formatHexAddr(slotIndex) {
  const addr = BASE_PAGE_ADDRESS + BigInt(slotIndex * 4096);
  return '0x' + addr.toString(16);
}

// Initial default state
const createInitialTelemetry = (scenarioKey = 'CAT_GREP', capacity = 16) => {
  const scenario = SCENARIOS[scenarioKey] || SCENARIOS.CAT_GREP;
  const initialPages = [];
  const occupiedCount = 6;
  for (let i = 0; i < occupiedCount; i++) {
    const slot = i;
    const payload = scenario.samplePayloads[i % scenario.samplePayloads.length];
    initialPages.push({
      slot,
      pageId: 100 + i,
      hex: formatHexAddr(slot),
      payload,
      timestamp: Date.now() - (occupiedCount - i) * 300
    });
  }

  return {
    timestamp: Date.now(),
    capacity: capacity,
    pageCount: occupiedCount,
    fillPercentage: (occupiedCount / capacity) * 100,
    headPointer: occupiedCount, // next write goes to head % capacity
    tailPointer: 0,             // next read comes from tail % capacity
    mutexLocked: false,
    scenario: scenario.id,
    producer: {
      pid: scenario.producerPid,
      name: scenario.producerName,
      state: 'TASK_RUNNING',
      syscall: 'write(pipefd[1], buf, 4096)',
      rateKbPerSec: 16.4,
      totalWrites: occupiedCount,
      cpuLoad: 24.5
    },
    consumer: {
      pid: scenario.consumerPid,
      name: scenario.consumerName,
      state: 'TASK_RUNNING',
      syscall: 'read(pipefd[0], buf, 4096)',
      rateKbPerSec: 12.8,
      totalReads: 0,
      cpuLoad: 18.2
    },
    waitQueues: {
      wrWaitCount: 0,
      rdWaitCount: 0
    },
    pages: initialPages,
    config: {
      writeDelayMs: 300,
      readDelayMs: 450,
      capacityPages: capacity,
      paused: false
    },
    dmesgLogs: [
      { id: 1, time: '0.000120', src: 'fs/pipe.c:create_pipe_files', msg: `Initialized struct pipe_inode_info [ring capacity=${capacity} pages, ${capacity * 4}KB]` },
      { id: 2, time: '0.000340', src: 'fs/pipe.c:pipe_write', msg: `Process [PID ${scenario.producerPid}] attached to write end pipefd[1]` },
      { id: 3, time: '0.000510', src: 'fs/pipe.c:pipe_read', msg: `Process [PID ${scenario.consumerPid}] attached to read end pipefd[0]` },
      { id: 4, time: '0.001024', src: 'fs/pipe.c:pipe_write', msg: `Initial page cache warm-up: ${occupiedCount} pages buffered` }
    ]
  };
};

export function useKernelTelemetry() {
  const [telemetry, setTelemetry] = useState(() => createInitialTelemetry());
  const [isConnected, setIsConnected] = useState(false);
  const [isMockMode, setIsMockMode] = useState(true);
  const [lastPing, setLastPing] = useState(12);

  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const mockIntervalRef = useRef(null);
  const telemetryRef = useRef(telemetry);
  telemetryRef.current = telemetry;

  // Local config state for mock mode controls
  const localConfigRef = useRef({
    writeDelayMs: 350,
    readDelayMs: 500,
    capacityPages: 16,
    scenario: 'CAT_GREP',
    paused: false
  });

  const writeTimerRef = useRef(0);
  const readTimerRef = useRef(0);

  // Send command to backend (or apply locally if in mock mode)
  const sendCommand = useCallback((command) => {
    // If command is full config or partial
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      try {
        socketRef.current.send(JSON.stringify(command));
      } catch (err) {
        console.warn('Failed to send WebSocket command:', err);
      }
    }

    // Always mirror command locally in mock / client side
    if (command.action === 'CONFIG') {
      localConfigRef.current = {
        ...localConfigRef.current,
        writeDelayMs: command.writeDelayMs ?? localConfigRef.current.writeDelayMs,
        readDelayMs: command.readDelayMs ?? localConfigRef.current.readDelayMs,
        capacityPages: command.capacityPages ?? localConfigRef.current.capacityPages,
        scenario: command.scenario ?? localConfigRef.current.scenario,
        paused: command.paused ?? localConfigRef.current.paused
      };
      setTelemetry((prev) => ({
        ...prev,
        capacity: command.capacityPages ?? prev.capacity,
        config: { ...prev.config, ...localConfigRef.current }
      }));
    } else if (command.action === 'PAUSE') {
      localConfigRef.current.paused = true;
      setTelemetry((prev) => ({
        ...prev,
        config: { ...prev.config, paused: true }
      }));
    } else if (command.action === 'RESUME') {
      localConfigRef.current.paused = false;
      setTelemetry((prev) => ({
        ...prev,
        config: { ...prev.config, paused: false }
      }));
    } else if (command.action === 'SCENARIO') {
      const scenKey = command.scenario;
      if (SCENARIOS[scenKey]) {
        localConfigRef.current.scenario = scenKey;
        const fresh = createInitialTelemetry(scenKey, localConfigRef.current.capacityPages);
        fresh.config = { ...localConfigRef.current };
        setTelemetry(fresh);
      }
    } else if (command.action === 'STEP') {
      // Execute a single simulated step
      stepMockSimulation();
    }
  }, []);

  // Single step mock simulation
  const stepMockSimulation = useCallback(() => {
    setTelemetry((prev) => {
      const config = localConfigRef.current;
      const scenario = SCENARIOS[config.scenario] || SCENARIOS.CAT_GREP;
      const capacity = config.capacityPages || 16;
      let head = prev.headPointer;
      let tail = prev.tailPointer;
      const count = head - tail;
      const pages = [...prev.pages];
      let wrWait = prev.waitQueues.wrWaitCount;
      let rdWait = prev.waitQueues.rdWaitCount;
      let prodState = prev.producer.state;
      let consState = prev.consumer.state;
      let dmesg = [...(prev.dmesgLogs || [])];

      // Mutex lock toggle simulation
      const mutex = Math.random() < 0.3;

      // Check if write can happen
      if (count < capacity) {
        // Write produces a new page
        const slot = head % capacity;
        const pageId = head + 1;
        const sample = scenario.samplePayloads[pageId % scenario.samplePayloads.length];
        
        // Remove old page in slot if any
        const filtered = pages.filter(p => p.slot !== slot);
        filtered.push({
          slot,
          pageId,
          hex: formatHexAddr(slot),
          payload: sample,
          timestamp: Date.now()
        });

        head++;
        prodState = 'TASK_RUNNING';
        wrWait = 0;

        if (dmesg.length > 25) dmesg.shift();
        dmesg.push({
          id: Date.now(),
          time: ((Date.now() % 100000) / 1000).toFixed(6),
          src: 'fs/pipe.c:pipe_write',
          msg: `sys_write(): page #${pageId} -> ring[${slot}], head=${head}`
        });

        return {
          ...prev,
          headPointer: head,
          pageCount: head - tail,
          fillPercentage: ((head - tail) / capacity) * 100,
          pages: filtered,
          mutexLocked: mutex,
          producer: {
            ...prev.producer,
            state: prodState,
            totalWrites: prev.producer.totalWrites + 1
          },
          waitQueues: { wrWaitCount: wrWait, rdWaitCount: rdWait },
          dmesgLogs: dmesg
        };
      } else {
        // Pipe is full! Producer blocked
        prodState = 'TASK_INTERRUPTIBLE';
        wrWait = 1;

        if (dmesg.length > 25) dmesg.shift();
        dmesg.push({
          id: Date.now(),
          time: ((Date.now() % 100000) / 1000).toFixed(6),
          src: 'fs/pipe.c:pipe_write',
          msg: `BACKPRESSURE: ring FULL (${count}/${capacity}). PID ${prev.producer.pid} entering wr_wait`
        });

        return {
          ...prev,
          producer: { ...prev.producer, state: prodState },
          waitQueues: { wrWaitCount: wrWait, rdWaitCount: rdWait },
          dmesgLogs: dmesg
        };
      }
    });
  }, []);

  // Mock simulation tick loop
  useEffect(() => {
    if (!isMockMode) return;

    const interval = setInterval(() => {
      const config = localConfigRef.current;
      if (config.paused) return;

      const now = Date.now();
      const writeDelay = Math.max(50, config.writeDelayMs || 300);
      const readDelay = Math.max(50, config.readDelayMs || 450);

      const shouldWrite = (now - writeTimerRef.current) >= writeDelay;
      const shouldRead = (now - readTimerRef.current) >= readDelay;

      if (!shouldWrite && !shouldRead) return;

      setTelemetry((prev) => {
        let head = prev.headPointer;
        let tail = prev.tailPointer;
        let capacity = config.capacityPages || prev.capacity;
        let pages = [...prev.pages];
        let prodState = prev.producer.state;
        let consState = prev.consumer.state;
        let wrWait = 0;
        let rdWait = 0;
        let dmesg = [...(prev.dmesgLogs || [])];
        const scenario = SCENARIOS[config.scenario] || SCENARIOS.CAT_GREP;

        let totalWrites = prev.producer.totalWrites;
        let totalReads = prev.consumer.totalReads;

        // Perform Write
        if (shouldWrite) {
          writeTimerRef.current = now;
          const currentOccupancy = head - tail;
          if (currentOccupancy >= capacity) {
            // Buffer is full -> Backpressure
            prodState = 'TASK_INTERRUPTIBLE';
            wrWait = 1;
            if (Math.random() < 0.2) {
              if (dmesg.length > 25) dmesg.shift();
              dmesg.push({
                id: Date.now() + 1,
                time: ((now % 100000) / 1000).toFixed(6),
                src: 'fs/pipe.c:pipe_write',
                msg: `wr_wait: ring FULL (${currentOccupancy}/${capacity}). Process ${prev.producer.pid} sleeping`
              });
            }
          } else {
            // Produce page
            const slot = head % capacity;
            const pageId = head + 1;
            totalWrites++;
            pages = pages.filter(p => p.slot !== slot);
            pages.push({
              slot,
              pageId,
              hex: formatHexAddr(slot),
              payload: scenario.samplePayloads[pageId % scenario.samplePayloads.length],
              timestamp: now
            });
            head++;
            prodState = 'TASK_RUNNING';
            wrWait = 0;

            if (currentOccupancy === 0 && dmesg.length < 25) {
              dmesg.push({
                id: Date.now() + 2,
                time: ((now % 100000) / 1000).toFixed(6),
                src: 'fs/pipe.c:wake_up_interruptible',
                msg: `wake_up_interruptible(&pipe->rd_wait) -> Process ${prev.consumer.pid} awoken`
              });
            }
          }
        }

        // Perform Read
        if (shouldRead) {
          readTimerRef.current = now;
          const currentOccupancy = head - tail;
          if (currentOccupancy <= 0) {
            // Buffer is empty -> Starvation
            consState = 'TASK_INTERRUPTIBLE';
            rdWait = 1;
            if (Math.random() < 0.2) {
              if (dmesg.length > 25) dmesg.shift();
              dmesg.push({
                id: Date.now() + 3,
                time: ((now % 100000) / 1000).toFixed(6),
                src: 'fs/pipe.c:pipe_read',
                msg: `rd_wait: ring EMPTY (0/${capacity}). Process ${prev.consumer.pid} sleeping`
              });
            }
          } else {
            // Consume page
            const slot = tail % capacity;
            totalReads++;
            pages = pages.filter(p => p.slot !== slot);
            tail++;
            consState = 'TASK_RUNNING';
            rdWait = 0;

            if (currentOccupancy === capacity && dmesg.length < 25) {
              dmesg.push({
                id: Date.now() + 4,
                time: ((now % 100000) / 1000).toFixed(6),
                src: 'fs/pipe.c:wake_up_interruptible',
                msg: `wake_up_interruptible(&pipe->wr_wait) -> Process ${prev.producer.pid} awoken`
              });
            }
          }
        }

        const count = Math.max(0, head - tail);
        const fillPct = (count / capacity) * 100;
        const writeRate = ((1000 / writeDelay) * 4).toFixed(1);
        const readRate = ((1000 / readDelay) * 4).toFixed(1);

        // Mutex is held transiently during sys_write / sys_read
        const mutexLocked = (shouldWrite || shouldRead) && Math.random() < 0.35;

        return {
          ...prev,
          timestamp: now,
          capacity,
          pageCount: count,
          fillPercentage: fillPct,
          headPointer: head,
          tailPointer: tail,
          mutexLocked,
          producer: {
            ...prev.producer,
            state: prodState,
            rateKbPerSec: prodState === 'TASK_RUNNING' ? parseFloat(writeRate) : 0,
            totalWrites,
            cpuLoad: prodState === 'TASK_RUNNING' ? Math.min(95, 15 + Math.random() * 20) : 0.8
          },
          consumer: {
            ...prev.consumer,
            state: consState,
            rateKbPerSec: consState === 'TASK_RUNNING' ? parseFloat(readRate) : 0,
            totalReads,
            cpuLoad: consState === 'TASK_RUNNING' ? Math.min(85, 10 + Math.random() * 18) : 0.4
          },
          waitQueues: {
            wrWaitCount: wrWait,
            rdWaitCount: rdWait
          },
          pages,
          dmesgLogs: dmesg
        };
      });
    }, 40); // 25 FPS update rate for buttery smooth transitions

    mockIntervalRef.current = interval;
    return () => clearInterval(interval);
  }, [isMockMode]);

  // Connect to backend WebSocket
  useEffect(() => {
    let ws;
    let isCancelled = false;

    const connect = () => {
      if (isCancelled) return;

      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      // Connect to backend (supports direct port 8080 or dev server proxy)
      const wsUrl = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && window.location.port !== '8080'
        ? `ws://localhost:8080/ws/telemetry`
        : `${wsProtocol}//${window.location.host}/ws/telemetry`;

      try {
        ws = new WebSocket(wsUrl);
        socketRef.current = ws;

        ws.onopen = () => {
          if (isCancelled) return;
          console.log('[K-PIPE WS] Connected to Kernel Telemetry at', wsUrl);
          setIsConnected(true);
          setIsMockMode(false);
        };

        ws.onmessage = (event) => {
          if (isCancelled) return;
          try {
            const data = JSON.parse(event.data);
            if (data && typeof data === 'object') {
              setTelemetry(prev => {
                // Merge with fallback logs or properties if backend payload is slightly different
                return {
                  ...prev,
                  ...data,
                  dmesgLogs: data.dmesgLogs || data.logs || prev.dmesgLogs,
                  config: { ...prev.config, ...(data.config || {}) }
                };
              });
            }
          } catch (e) {
            console.error('[K-PIPE WS] Error parsing telemetry payload:', e);
          }
        };

        ws.onclose = () => {
          if (isCancelled) return;
          console.warn('[K-PIPE WS] Disconnected. Falling back to local mock telemetry.');
          setIsConnected(false);
          setIsMockMode(true);
          reconnectTimeoutRef.current = setTimeout(connect, 3000);
        };

        ws.onerror = (err) => {
          // Will trigger onclose and fallback to mock
          console.log('[K-PIPE WS] Socket status notice: Backend not reachable yet, mock engine active.');
        };
      } catch (err) {
        setIsConnected(false);
        setIsMockMode(true);
        reconnectTimeoutRef.current = setTimeout(connect, 3000);
      }
    };

    connect();

    return () => {
      isCancelled = true;
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (ws) {
        ws.close();
      }
    };
  }, []);

  return {
    telemetry,
    isConnected,
    isMockMode,
    sendCommand
  };
}
