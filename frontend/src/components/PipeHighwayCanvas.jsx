import React, { useRef, useEffect } from 'react';
import { sounds } from '../audio/SoundEffects';

export default function PipeHighwayCanvas({
  isWriterRunning,
  isReaderRunning,
  writeDelayMs = 300,
  readDelayMs = 450,
  pageCount = 8,
  capacity = 16,
  fillPercentage = 50
}) {
  const canvasRef = useRef(null);

  const animStateRef = useRef({
    ingressCapsules: [],
    egressCapsules: [],
    particles: [],
    lastWriteSpawn: 0,
    lastReadSpawn: 0,
    isWriterRunning,
    isReaderRunning,
    writeDelayMs,
    readDelayMs,
    pageCount,
    capacity,
    fillPercentage
  });

  useEffect(() => {
    animStateRef.current = {
      ...animStateRef.current,
      isWriterRunning,
      isReaderRunning,
      writeDelayMs,
      readDelayMs,
      pageCount,
      capacity,
      fillPercentage
    };
  }, [isWriterRunning, isReaderRunning, writeDelayMs, readDelayMs, pageCount, capacity, fillPercentage]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let lastTime = performance.now();

    const render = (currentTime) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      ctx.clearRect(0, 0, width, height);

      const state = animStateRef.current;
      const centerY = height / 2;

      const pipeRadius = 16;
      const stationWidth = 140;
      const reservoirWidth = 160;

      const p1Start = stationWidth - 10;
      const p1End = (width - reservoirWidth) / 2;

      const p2Start = (width + reservoirWidth) / 2;
      const p2End = width - stationWidth + 10;

      const isBufferFull = state.pageCount >= state.capacity;
      const isBufferEmpty = state.pageCount <= 0;

      // Spawn Ingress Capsules
      const writeInterval = Math.max(80, state.writeDelayMs);
      if (state.isWriterRunning && currentTime - state.lastWriteSpawn > writeInterval) {
        state.lastWriteSpawn = currentTime;
        if (state.ingressCapsules.length < 8) {
          state.ingressCapsules.push({
            x: p1Start + 10,
            targetX: p1End - 15,
            speed: (p1End - p1Start) / (writeInterval * 1.8 / 1000),
            size: 10,
            color: '#059669',
            id: Math.random()
          });
          sounds.playWhoosh();
        }
      }

      // Spawn Egress Capsules
      const readInterval = Math.max(80, state.readDelayMs);
      if (state.isReaderRunning && !isBufferEmpty && currentTime - state.lastReadSpawn > readInterval) {
        state.lastReadSpawn = currentTime;
        if (state.egressCapsules.length < 8) {
          state.egressCapsules.push({
            x: p2Start + 15,
            targetX: p2End - 10,
            speed: (p2End - p2Start) / (readInterval * 1.8 / 1000),
            size: 10,
            color: '#e11d48',
            id: Math.random()
          });
          sounds.playWhoosh();
        }
      }

      // Draw Glass Pipes
      const drawGlassPipe = (x1, x2, isBlocked, isStarved) => {
        const pipeLen = x2 - x1;

        // Pipe casing
        ctx.fillStyle = '#f8fafc';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.rect(x1, centerY - pipeRadius, pipeLen, pipeRadius * 2);
        ctx.fill();
        ctx.stroke();

        // Inner guide
        ctx.strokeStyle = isBlocked ? '#e11d48' : '#cbd5e1';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(x1 + 10, centerY);
        ctx.lineTo(x2 - 10, centerY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Joint collars
        const drawRing = (rx) => {
          ctx.fillStyle = '#000000';
          ctx.fillRect(rx - 3, centerY - pipeRadius - 3, 6, pipeRadius * 2 + 6);
        };

        drawRing(x1);
        drawRing(x1 + pipeLen * 0.5);
        drawRing(x2);
      };

      // Draw Pipe 1 (Ingress)
      drawGlassPipe(p1Start, p1End, isBufferFull, false);

      // Draw Pipe 2 (Egress)
      drawGlassPipe(p2Start, p2End, false, isBufferEmpty);

      // Gate Mechanism at Reservoir Entrance
      if (isBufferFull) {
        ctx.fillStyle = '#e11d48';
        ctx.fillRect(p1End - 8, centerY - pipeRadius - 4, 6, pipeRadius * 2 + 8);
        ctx.fillStyle = '#e11d48';
        ctx.font = 'bold 9px "Space Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('LOCKED', p1End - 5, centerY - pipeRadius - 8);
      }

      // Ingress Capsules
      for (let i = state.ingressCapsules.length - 1; i >= 0; i--) {
        const cap = state.ingressCapsules[i];
        let stopX = p1End - 15;
        if (isBufferFull) {
          const queueIndex = state.ingressCapsules.filter((c, idx) => idx > i).length;
          stopX = p1End - 18 - (queueIndex * 24);
        }

        if (cap.x < stopX) {
          cap.x += cap.speed * dt;
          if (cap.x > stopX) cap.x = stopX;
        }

        // Draw capsule
        ctx.fillStyle = isBufferFull && cap.x >= stopX - 2 ? '#e11d48' : cap.color;
        ctx.beginPath();
        ctx.arc(cap.x, centerY, cap.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        if (!isBufferFull && cap.x >= stopX) {
          state.ingressCapsules.splice(i, 1);
        }
      }

      // Egress Capsules
      for (let i = state.egressCapsules.length - 1; i >= 0; i--) {
        const cap = state.egressCapsules[i];
        cap.x += cap.speed * dt;

        ctx.fillStyle = cap.color;
        ctx.beginPath();
        ctx.arc(cap.x, centerY, cap.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        if (cap.x >= p2End - 8) {
          state.egressCapsules.splice(i, 1);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <div className="relative w-full h-16 sm:h-20 select-none pointer-events-none">
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
      />
    </div>
  );
}
