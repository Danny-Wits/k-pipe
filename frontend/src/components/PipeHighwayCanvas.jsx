import React, { useRef, useEffect } from 'react';
import { sounds } from '../audio/SoundEffects';

/**
 * 60 FPS HTML5 Canvas physical pipeline simulation:
 * - Dimensional glass tubes with highlights & metal coupling collars
 * - Traveling glowing data capsules with particle trails
 * - Physical queue stacking at the gate when backpressure strikes
 * - Starvation drain when empty
 */
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

  // State refs for animation loop
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

  // Keep state refs updated without restarting the animation loop
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

    // Handle high DPI displays
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

      // Pipe geometry
      const pipeRadius = 18;
      const stationWidth = 140;
      const reservoirWidth = 160;

      // Pipe 1 (Ingress): Left station to reservoir
      const p1Start = stationWidth - 10;
      const p1End = (width - reservoirWidth) / 2;

      // Pipe 2 (Egress): Reservoir to right station
      const p2Start = (width + reservoirWidth) / 2;
      const p2End = width - stationWidth + 10;

      const isBufferFull = state.pageCount >= state.capacity;
      const isBufferEmpty = state.pageCount <= 0;

      // ─── 1. Spawn Ingress Capsules ───
      const writeInterval = Math.max(80, state.writeDelayMs);
      if (state.isWriterRunning && currentTime - state.lastWriteSpawn > writeInterval) {
        state.lastWriteSpawn = currentTime;
        // Don't spawn if queue is completely jammed
        if (state.ingressCapsules.length < 8) {
          state.ingressCapsules.push({
            x: p1Start + 10,
            targetX: p1End - 15,
            speed: (p1End - p1Start) / (writeInterval * 1.8 / 1000), // Speed tied to delay
            size: 11,
            color: '#10b981', // Emerald
            glowColor: 'rgba(16, 185, 129, 0.4)',
            id: Math.random()
          });
          sounds.playWhoosh();
        }
      }

      // ─── 2. Spawn Egress Capsules ───
      const readInterval = Math.max(80, state.readDelayMs);
      if (state.isReaderRunning && !isBufferEmpty && currentTime - state.lastReadSpawn > readInterval) {
        state.lastReadSpawn = currentTime;
        if (state.egressCapsules.length < 8) {
          state.egressCapsules.push({
            x: p2Start + 15,
            targetX: p2End - 10,
            speed: (p2End - p2Start) / (readInterval * 1.8 / 1000),
            size: 11,
            color: '#6366f1', // Indigo
            glowColor: 'rgba(99, 102, 241, 0.4)',
            id: Math.random()
          });
          sounds.playWhoosh();
        }
      }

      // ─── 3. Draw Glass Pipes Background ───
      const drawGlassPipe = (x1, x2, isBlocked, isStarved, flowColor) => {
        const pipeLen = x2 - x1;

        // Pipe outer shadow
        ctx.save();
        ctx.shadowColor = 'rgba(15, 23, 42, 0.08)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 4;

        // Glass pipe casing
        const grad = ctx.createLinearGradient(0, centerY - pipeRadius, 0, centerY + pipeRadius);
        grad.addColorStop(0, '#f1f5f9');
        grad.addColorStop(0.3, '#ffffff');
        grad.addColorStop(0.7, '#e2e8f0');
        grad.addColorStop(1, '#cbd5e1');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x1, centerY - pipeRadius, pipeLen, pipeRadius * 2, 8);
        ctx.fill();
        ctx.restore();

        // Inner chamber (fluid lumen)
        const innerRadius = pipeRadius - 3;
        const innerGrad = ctx.createLinearGradient(0, centerY - innerRadius, 0, centerY + innerRadius);
        if (isBlocked) {
          innerGrad.addColorStop(0, 'rgba(244, 63, 94, 0.08)');
          innerGrad.addColorStop(0.5, 'rgba(244, 63, 94, 0.18)');
          innerGrad.addColorStop(1, 'rgba(244, 63, 94, 0.08)');
        } else if (isStarved) {
          innerGrad.addColorStop(0, 'rgba(241, 245, 249, 0.6)');
          innerGrad.addColorStop(1, 'rgba(226, 232, 240, 0.6)');
        } else {
          innerGrad.addColorStop(0, 'rgba(240, 249, 255, 0.8)');
          innerGrad.addColorStop(0.5, 'rgba(224, 242, 254, 0.9)');
          innerGrad.addColorStop(1, 'rgba(240, 249, 255, 0.8)');
        }

        ctx.fillStyle = innerGrad;
        ctx.beginPath();
        ctx.roundRect(x1 + 3, centerY - innerRadius, pipeLen - 6, innerRadius * 2, 6);
        ctx.fill();

        // Glowing center guide laser
        ctx.strokeStyle = isBlocked
          ? 'rgba(244, 63, 94, 0.35)'
          : isStarved
          ? 'rgba(148, 163, 184, 0.25)'
          : flowColor;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(x1 + 10, centerY);
        ctx.lineTo(x2 - 10, centerY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Specular top highlight (glass reflection shine)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(x1 + 8, centerY - pipeRadius + 4);
        ctx.lineTo(x2 - 8, centerY - pipeRadius + 4);
        ctx.stroke();

        // Metal coupling rings (joint collars)
        const drawRing = (rx) => {
          ctx.fillStyle = '#64748b';
          ctx.beginPath();
          ctx.roundRect(rx - 3, centerY - pipeRadius - 2, 6, pipeRadius * 2 + 4, 2);
          ctx.fill();

          ctx.fillStyle = '#cbd5e1';
          ctx.fillRect(rx - 1, centerY - pipeRadius - 1, 2, pipeRadius * 2 + 2);
        };

        drawRing(x1);
        drawRing(x1 + pipeLen * 0.5);
        drawRing(x2);
      };

      // Draw Pipe 1 (Ingress)
      drawGlassPipe(p1Start, p1End, isBufferFull, false, 'rgba(16, 185, 129, 0.4)');

      // Draw Pipe 2 (Egress)
      drawGlassPipe(p2Start, p2End, false, isBufferEmpty, 'rgba(99, 102, 241, 0.4)');

      // ─── 4. Gate Mechanism at Reservoir Entrance ───
      // If buffer full, close the security gate!
      if (isBufferFull) {
        ctx.save();
        ctx.fillStyle = '#e11d48';
        ctx.shadowColor = 'rgba(225, 29, 72, 0.5)';
        ctx.shadowBlur = 8;
        ctx.fillRect(p1End - 8, centerY - pipeRadius - 3, 6, pipeRadius * 2 + 6);
        ctx.restore();

        // Gate Warning Label
        ctx.fillStyle = '#e11d48';
        ctx.font = 'bold 9px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('LOCKED', p1End - 5, centerY - pipeRadius - 8);
      }

      // ─── 5. Update & Draw Ingress Capsules ───
      for (let i = state.ingressCapsules.length - 1; i >= 0; i--) {
        const cap = state.ingressCapsules[i];

        // Backpressure stacking physics:
        // If buffer full, capsules stop before the gate or behind the preceding capsule
        let stopX = p1End - 15;
        if (isBufferFull) {
          // Calculate queue position
          const queueIndex = state.ingressCapsules.filter((c, idx) => idx > i).length;
          stopX = p1End - 18 - (queueIndex * 26);
        }

        if (cap.x < stopX) {
          cap.x += cap.speed * dt;
          if (cap.x > stopX) cap.x = stopX;
        }

        // Particle trail
        if (Math.random() < 0.35 && cap.x < stopX - 5) {
          state.particles.push({
            x: cap.x - 6,
            y: centerY + (Math.random() * 8 - 4),
            vx: -15,
            vy: (Math.random() - 0.5) * 8,
            life: 1.0,
            color: 'rgba(16, 185, 129, 0.6)'
          });
        }

        // Draw capsule body
        drawCapsule(ctx, cap.x, centerY, cap.size, cap.color, cap.glowColor, isBufferFull && cap.x >= stopX - 2);

        // Remove capsule if it reached the reservoir (when not full)
        if (!isBufferFull && cap.x >= stopX) {
          state.ingressCapsules.splice(i, 1);
          // Spawn entry burst particles into reservoir
          for (let p = 0; p < 5; p++) {
            state.particles.push({
              x: p1End + 5,
              y: centerY + (Math.random() * 12 - 6),
              vx: Math.random() * 40 + 20,
              vy: (Math.random() - 0.5) * 30,
              life: 0.8,
              color: 'rgba(14, 165, 233, 0.8)'
            });
          }
        }
      }

      // ─── 6. Update & Draw Egress Capsules ───
      for (let i = state.egressCapsules.length - 1; i >= 0; i--) {
        const cap = state.egressCapsules[i];
        cap.x += cap.speed * dt;

        // Particle trail
        if (Math.random() < 0.35) {
          state.particles.push({
            x: cap.x - 6,
            y: centerY + (Math.random() * 8 - 4),
            vx: -15,
            vy: (Math.random() - 0.5) * 8,
            life: 1.0,
            color: 'rgba(99, 102, 241, 0.6)'
          });
        }

        drawCapsule(ctx, cap.x, centerY, cap.size, cap.color, cap.glowColor, false);

        // Remove capsule when it enters the reader
        if (cap.x >= p2End - 8) {
          state.egressCapsules.splice(i, 1);
        }
      }

      // ─── 7. Update & Draw Particles ───
      for (let p = state.particles.length - 1; p >= 0; p--) {
        const part = state.particles[p];
        part.x += part.vx * dt;
        part.y += part.vy * dt;
        part.life -= dt * 2.2;

        if (part.life <= 0) {
          state.particles.splice(p, 1);
          continue;
        }

        ctx.fillStyle = part.color;
        ctx.globalAlpha = Math.max(0, part.life);
        ctx.beginPath();
        ctx.arc(part.x, part.y, 1.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
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

// Draw a 3D-styled glowing glass data capsule
function drawCapsule(ctx, x, y, r, color, glow, isStalled) {
  ctx.save();

  // Glow halo
  ctx.shadowColor = isStalled ? 'rgba(244, 63, 94, 0.7)' : glow;
  ctx.shadowBlur = isStalled ? 12 : 8;

  // Outer shell
  const grad = ctx.createRadialGradient(x - 3, y - 3, 1, x, y, r);
  if (isStalled) {
    grad.addColorStop(0, '#fecdd3');
    grad.addColorStop(0.5, '#f43f5e');
    grad.addColorStop(1, '#9f1239');
  } else {
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.3, color);
    grad.addColorStop(1, '#0f172a');
  }

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();

  // Specular gleam (glass reflection)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.beginPath();
  ctx.ellipse(x - 3, y - 3, r * 0.45, r * 0.25, -Math.PI / 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
