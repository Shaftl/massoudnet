"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import styles from "./PatternLock.module.css";

// Secret pattern: first tap/drag to dot 0 (top‐left), then to dot 1 (top‐center).
const SECRET_PATTERN = [0, 1, 2, 4, 5, 7, 8];

export default function PatternLock({ onSuccess }) {
  // ─── STATE & REFS ────────────────────────────────────────────────
  const [path, setPath] = useState([]); // For adding/removing "active" class on dots
  const pathRef = useRef([]); // Always holds the real-time array of indices
  const drawing = useRef(false); // True while user is dragging or touching
  const dotCenters = useRef([]); // [{x,y}, …] for each of the 9 dot centers
  const canvasRef = useRef(null); // Ref to the <canvas> element
  const containerRef = useRef(null); // Ref to the container <div> holding dots

  // ─── ON MOUNT: Calculate dot centers once ─────────────────────────
  useEffect(() => {
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();

    // Grab all 9 ".dot" divs and compute their (x,y) centers relative to container
    const dotNodes = Array.from(container.querySelectorAll(`.${styles.dot}`));
    dotCenters.current = dotNodes.map((dotEl) => {
      const r = dotEl.getBoundingClientRect();
      return {
        x: r.left - rect.left + r.width / 2,
        y: r.top - rect.top + r.height / 2,
      };
    });

    // Clear the canvas at the start
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, 300, 300);
  }, []); // run only once on mount

  // ─── DRAWING FUNCTION ────────────────────────────────────────────
  const drawPath = useCallback((currentPos = null) => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, 300, 300);
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.beginPath();

    const seq = pathRef.current;
    if (seq.length > 0) {
      const { x: startX, y: startY } = dotCenters.current[seq[0]];
      ctx.moveTo(startX, startY);
    }
    for (let i = 1; i < seq.length; i++) {
      const { x, y } = dotCenters.current[seq[i]];
      ctx.lineTo(x, y);
    }

    // While drawing, draw a “rubberband” line to current pointer/touch position
    if (drawing.current && currentPos) {
      ctx.lineTo(currentPos.x, currentPos.y);
    }

    ctx.stroke();
  }, []);

  // Whenever React's `path` state changes, re‐draw (the freshest array is in pathRef.current)
  useEffect(() => {
    drawPath();
  }, [path, drawPath]);

  // ─── HELPER TO GET RELATIVE (x,y) ──────────────────────────────────
  const getRelativePos = (e) => {
    const rect = containerRef.current.getBoundingClientRect();
    if (e.touches && e.touches.length > 0) {
      // Touch event (onTouchMove/onTouchStart)
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    } else {
      // Pointer or mouse event
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  // ─── EVENT HANDLERS ───────────────────────────────────────────────

  // 1) Start drawing (pointer down or touch start)
  const handleStart = (e) => {
    e.preventDefault();
    pathRef.current = [];
    setPath([]);
    drawing.current = true;

    // If it's a pointer event, capture it so we continue to receive move/up
    if (e.pointerId !== undefined) {
      containerRef.current.setPointerCapture(e.pointerId);
    }
  };

  // 2) Move (pointer move or touch move) → see if we crossed a dot center
  const handleMove = (e) => {
    if (!drawing.current) return;

    const pos = getRelativePos(e);

    // Check each of the 9 dotCenters. If within 30px and not already in pathRef,
    // lock it in by pushing its index.
    dotCenters.current.forEach((dot, idx) => {
      const dist = Math.hypot(dot.x - pos.x, dot.y - pos.y);
      if (dist < 30 && !pathRef.current.includes(idx)) {
        pathRef.current = [...pathRef.current, idx];
        setPath([...pathRef.current]);
      }
    });

    // Draw the line with rubberband to currentPos
    drawPath(pos);
  };

  // 3) End drawing (pointer up or touch end) → finalize and check secret
  const handleEnd = (e) => {
    drawing.current = false;
    if (e.pointerId !== undefined) {
      containerRef.current.releasePointerCapture(e.pointerId);
    }

    // Final draw without rubberband
    drawPath();

    // Log out which indices were captured
    console.log("Final path detected:", pathRef.current);

    // Compare arrays
    if (
      pathRef.current.length === SECRET_PATTERN.length &&
      JSON.stringify(pathRef.current) === JSON.stringify(SECRET_PATTERN)
    ) {
      onSuccess?.();
    } else {
      alert("Wrong pattern, try again.");
      pathRef.current = [];
      setPath([]);
      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, 300, 300);
    }
  };

  // 4) Cancel (pointer cancel or touch cancel): just reset everything
  const handleCancel = () => {
    if (!drawing.current) return;
    drawing.current = false;
    pathRef.current = [];
    setPath([]);
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, 300, 300);
  };

  // ─── RENDER ────────────────────────────────────────────────────────
  return (
    <div
      ref={containerRef}
      className={styles.container}
      /* Pointer events */
      onPointerDown={handleStart}
      onPointerMove={handleMove}
      onPointerUp={handleEnd}
      onPointerCancel={handleCancel}
      /* Touch events */
      onTouchStart={handleStart}
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
      onTouchCancel={handleCancel}
    >
      {/* The 300×300 canvas, positioned behind the dots */}
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        width={300}
        height={300}
      />

      {/* Nine dots (indices 0–8). We apply “active” when path.includes(i). */}
      {[...Array(9)].map((_, i) => (
        <div
          key={i}
          className={`${styles.dot} ${path.includes(i) ? styles.active : ""}`}
        />
      ))}
    </div>
  );
}
