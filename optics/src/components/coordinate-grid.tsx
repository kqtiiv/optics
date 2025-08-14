import React, { useRef, useEffect, useCallback } from "react";

type Viewport = {
  cx: number; // world x at canvas center
  cy: number; // world y at canvas center
  scale: number; // pixels per world unit
};

interface CoordinateGridProps {
  initialViewport?: Viewport;
  showAxes?: boolean;
  showGrid?: boolean;
  onViewportChange?: (v: Viewport) => void;
  renderOverlay?: (ctx: CanvasRenderingContext2D, viewport: Viewport) => void;
  className?: string;
  disablePan?: boolean;
  onMouseDown?: (
    e: React.MouseEvent,
    viewport: Viewport,
    canvas: HTMLCanvasElement
  ) => void;
  onMouseMove?: (
    e: React.MouseEvent,
    viewport: Viewport,
    canvas: HTMLCanvasElement
  ) => void;
  onMouseUp?: (e: React.MouseEvent) => void;
}

const CoordinateGrid: React.FC<CoordinateGridProps> = ({
  initialViewport = { cx: 0, cy: 0, scale: 100 },
  showAxes = true,
  showGrid = true,
  onViewportChange,
  renderOverlay,
  className,
  disablePan = false,
  onMouseDown,
  onMouseMove,
  onMouseUp,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const viewportRef = useRef<Viewport>({ ...initialViewport });
  const draggingRef = useRef(false);
  const lastMouseRef = useRef<{ x: number; y: number } | null>(null);

  // Resize canvas to fill parent
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement ?? document.body;
    const ratio = window.devicePixelRatio || 1;
    const w = parent.clientWidth;
    const h = parent.clientHeight;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    canvas.width = Math.max(1, Math.floor(w * ratio));
    canvas.height = Math.max(1, Math.floor(h * ratio));
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    draw();
  }, []);

  const worldToScreen = (
    x: number,
    y: number,
    vp: Viewport,
    canvas: HTMLCanvasElement
  ) => {
    const cw = canvas.clientWidth;
    const ch = canvas.clientHeight;
    const sx = cw / 2 + (x - vp.cx) * vp.scale;
    const sy = ch / 2 - (y - vp.cy) * vp.scale; // y inverted
    return { x: sx, y: sy };
  };

  const screenToWorld = (
    sx: number,
    sy: number,
    vp: Viewport,
    canvas: HTMLCanvasElement
  ) => {
    const cw = canvas.clientWidth;
    const ch = canvas.clientHeight;
    const x = vp.cx + (sx - cw / 2) / vp.scale;
    const y = vp.cy - (sy - ch / 2) / vp.scale;
    return { x, y };
  };

  const niceSpacing = (scale: number) => {
    const targetPx = 80;
    const raw = targetPx / scale;
    const powers = [1, 2, 5, 10];
    let best = powers[0];
    const exponent = Math.floor(Math.log10(raw || 1));
    const mantissa = raw / Math.pow(10, exponent);
    for (const p of powers) {
      if (mantissa <= p) {
        best = p;
        break;
      }
    }
    return best * Math.pow(10, exponent);
  };

  // draw grid + axes
  const drawGrid = (
    ctx: CanvasRenderingContext2D,
    vp: Viewport,
    canvas: HTMLCanvasElement
  ) => {
    const cw = canvas.clientWidth;
    const ch = canvas.clientHeight;
    ctx.clearRect(0, 0, cw, ch);

    const spacing = niceSpacing(vp.scale);
    const minorFactor = spacing / 5;

    // compute world bounds visible
    const topLeft = screenToWorld(0, 0, vp, canvas);
    const bottomRight = screenToWorld(cw, ch, vp, canvas);

    const xMin = Math.floor(topLeft.x / minorFactor) * minorFactor;
    const xMax = Math.ceil(bottomRight.x / minorFactor) * minorFactor;
    const yMax = Math.ceil(topLeft.y / minorFactor) * minorFactor;
    const yMin = Math.floor(bottomRight.y / minorFactor) * minorFactor;

    // draw minor grid lines
    if (showGrid) {
      ctx.lineWidth = 1;
      ctx.strokeStyle = "#2a2a2a"; // subtle minor lines
      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      for (let x = xMin; x <= xMax; x += minorFactor) {
        const s = worldToScreen(x, 0, vp, canvas);
        ctx.moveTo(s.x, 0);
        ctx.lineTo(s.x, ch);
      }
      for (let y = yMin; y <= yMax; y += minorFactor) {
        const s = worldToScreen(0, y, vp, canvas);
        ctx.moveTo(0, s.y);
        ctx.lineTo(cw, s.y);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // draw major grid lines
    if (showGrid) {
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = "#444";
      ctx.beginPath();
      for (
        let x = Math.ceil(xMin / spacing) * spacing;
        x <= xMax;
        x += spacing
      ) {
        const s = worldToScreen(x, 0, vp, canvas);
        ctx.moveTo(s.x, 0);
        ctx.lineTo(s.x, ch);
      }
      for (
        let y = Math.ceil(yMin / spacing) * spacing;
        y <= yMax;
        y += spacing
      ) {
        const s = worldToScreen(0, y, vp, canvas);
        ctx.moveTo(0, s.y);
        ctx.lineTo(cw, s.y);
      }
      ctx.stroke();
    }

    // axes
    if (showAxes) {
      ctx.lineWidth = 2;
      const yAxis = worldToScreen(0, 0, vp, canvas).x;
      ctx.strokeStyle = "white";
      ctx.beginPath();
      ctx.moveTo(yAxis, 0);
      ctx.lineTo(yAxis, ch);
      ctx.stroke();

      const xAxis = worldToScreen(0, 0, vp, canvas).y;
      ctx.beginPath();
      ctx.moveTo(0, xAxis);
      ctx.lineTo(cw, xAxis);
      ctx.stroke();
    }

    // labels
    ctx.fillStyle = "#ddd";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    const labelOffset = 6;
    for (let x = Math.ceil(xMin / spacing) * spacing; x <= xMax; x += spacing) {
      const s = worldToScreen(x, 0, vp, canvas);
      const visible = s.x >= -50 && s.x <= cw + 50;
      if (!visible) continue;
      ctx.fillText(
        formatNumber(x),
        s.x,
        worldToScreen(0, 0, vp, canvas).y + labelOffset
      );
    }

    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    for (let y = Math.ceil(yMin / spacing) * spacing; y <= yMax; y += spacing) {
      const s = worldToScreen(0, y, vp, canvas);
      const visible = s.y >= -50 && s.y <= ch + 50;
      if (!visible) continue;
      ctx.fillText(
        formatNumber(y),
        worldToScreen(0, 0, vp, canvas).x - labelOffset,
        s.y
      );
    }
  };

  // remove long decimals
  const formatNumber = (v: number) => {
    if (Math.abs(v) < 1e-6) return "0";
    const abs = Math.abs(v);
    if (abs >= 1)
      return v.toFixed(abs < 10 ? 2 : abs < 100 ? 1 : 0).replace(/\.0+$/, "");
    return v.toPrecision(3);
  };

  // draw grid
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const vp = viewportRef.current;
    drawGrid(ctx, vp, canvas);
    if (renderOverlay) {
      renderOverlay(ctx, vp);
    }
  }, [renderOverlay]);

  // initialize resize and listeners
  useEffect(() => {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [resizeCanvas]);

  // pointer interactions (pan & zoom)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onPointerDown = (e: PointerEvent) => {
      (e.target as Element).setPointerCapture?.(e.pointerId);
      draggingRef.current = true;
      lastMouseRef.current = { x: e.clientX, y: e.clientY };

      // Call custom mouse handler if provided
      if (onMouseDown && canvasRef.current) {
        const reactEvent = {
          clientX: e.clientX,
          clientY: e.clientY,
          target: e.target,
        } as React.MouseEvent;
        onMouseDown(reactEvent, viewportRef.current, canvasRef.current);
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      // Call custom mouse handler if provided
      if (onMouseMove && canvasRef.current) {
        const reactEvent = {
          clientX: e.clientX,
          clientY: e.clientY,
          target: e.target,
        } as React.MouseEvent;
        onMouseMove(reactEvent, viewportRef.current, canvasRef.current);
      }

      if (!draggingRef.current || !lastMouseRef.current || disablePan) return;
      const dx = e.clientX - lastMouseRef.current.x;
      const dy = e.clientY - lastMouseRef.current.y;
      lastMouseRef.current = { x: e.clientX, y: e.clientY };

      // pan camera
      const vp = viewportRef.current;
      vp.cx -= dx / vp.scale;
      vp.cy += dy / vp.scale;
      viewportRef.current = { ...vp };
      onViewportChange?.(viewportRef.current);
      draw();
    };

    const onPointerUp = (e: PointerEvent) => {
      // Call custom mouse handler if provided
      if (onMouseUp && canvasRef.current) {
        const reactEvent = {
          clientX: e.clientX,
          clientY: e.clientY,
          target: e.target,
        } as React.MouseEvent;
        onMouseUp(reactEvent);
      }

      draggingRef.current = false;
      lastMouseRef.current = null;
      try {
        (e.target as Element).releasePointerCapture?.(e.pointerId);
      } catch {}
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const canvasRect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - canvasRect.left;
      const mouseY = e.clientY - canvasRect.top;
      const vp = viewportRef.current;

      // zoom factor
      const zoomFactor = Math.exp(-e.deltaY * 0.0015);
      const prevScale = vp.scale;
      const newScale = Math.max(10, Math.min(5000, prevScale * zoomFactor));

      const worldBefore = screenToWorld(mouseX, mouseY, vp, canvas);
      vp.scale = newScale;
      const worldAfter = worldBefore;
      const cw = canvas.clientWidth;
      const ch = canvas.clientHeight;
      vp.cx = worldAfter.x - (mouseX - cw / 2) / vp.scale;
      vp.cy = worldAfter.y + (mouseY - ch / 2) / vp.scale;

      viewportRef.current = { ...vp };
      onViewportChange?.(viewportRef.current);
      draw();
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      canvas.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("wheel", onWheel);
    };
  }, [draw, onViewportChange]);

  // initial draw
  useEffect(() => {
    draw();
  }, [draw]);

  return (
    <div
      className={className ?? ""}
      style={{ width: "100%", height: "100%", position: "relative" }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          touchAction: "none",
        }}
      />
    </div>
  );
};

export default CoordinateGrid;
