/**
 * Single Line Canvas Drawing Tool
 * For drawing a single smooth curve (e.g., one isopleth)
 */

export function initializeSingleLineCanvas(config) {
  const {
    canvasId,
    imageId,
    undoLastBtnId,
    undoAllBtnId,
    saveBtnId,
    saveFilename = "drawing.png",
    lineColor = "#FF0000",
    lineWidth = 2,
    lineDash = [6, 10],
  } = config;

  const img = document.getElementById(imageId);
  const canvas = document.getElementById(canvasId);

  // If elements don't exist, exit gracefully
  if (!img || !canvas) {
    console.warn(
      `Single line canvas elements not found: ${canvasId}, ${imageId}`
    );
    return;
  }

  const ctx = canvas.getContext("2d");
  const DOT_RADIUS = 6;

  let points = [];
  let draggingIdx = null;
  let isPinchZoom = false;

  /**
   * Resize canvas to match image dimensions
   */
  function resizeCanvas() {
    canvas.width = img.naturalWidth || img.clientWidth;
    canvas.height = img.naturalHeight || img.clientHeight;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    draw();
  }

  /**
   * Draw the current state
   */
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw smooth curve through points
    if (points.length > 1) {
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = lineWidth;
      ctx.setLineDash(lineDash);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);

      for (let i = 1; i < points.length - 1; i++) {
        const xc = (points[i].x + points[i + 1].x) / 2;
        const yc = (points[i].y + points[i + 1].y) / 2;
        ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
      }

      ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw control points
    for (let p of points) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, DOT_RADIUS, 0, 2 * Math.PI);
      ctx.fillStyle = lineColor;
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  /**
   * Get mouse position relative to canvas
   */
  function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  /**
   * Get touch position relative to canvas
   */
  function getTouchPos(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const touch = e.touches[0] || e.changedTouches[0];
    return {
      x: (touch.clientX - rect.left) * scaleX,
      y: (touch.clientY - rect.top) * scaleY,
    };
  }

  /**
   * Handle point interaction (mouse or touch)
   */
  function handlePointerDown(pos) {
    // Check if clicking near existing point
    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      const dist = Math.sqrt((pos.x - p.x) ** 2 + (pos.y - p.y) ** 2);
      if (dist < DOT_RADIUS * 2) {
        draggingIdx = i;
        return;
      }
    }

    // Add new point
    points.push(pos);
    draw();
  }

  /**
   * Handle point dragging (mouse or touch)
   */
  function handlePointerMove(pos) {
    if (draggingIdx !== null) {
      points[draggingIdx] = pos;
      draw();
    }
  }

  /**
   * Handle point release (mouse or touch)
   */
  function handlePointerUp() {
    draggingIdx = null;
  }

  // Mouse Event Listeners
  canvas.addEventListener("mousedown", (e) => {
    const pos = getMousePos(e);
    handlePointerDown(pos);
  });

  canvas.addEventListener("mousemove", (e) => {
    const pos = getMousePos(e);
    handlePointerMove(pos);
  });

  canvas.addEventListener("mouseup", () => {
    handlePointerUp();
  });

  canvas.addEventListener("mouseleave", () => {
    handlePointerUp();
  });

  // Touch Event Listeners
  canvas.addEventListener(
    "touchstart",
    (e) => {
      if (e.touches && e.touches.length > 1) {
        isPinchZoom = true;
        // Don't preventDefault - allow native pinch zoom
        return;
      }

      isPinchZoom = false;
      e.preventDefault(); // Prevent scrolling for single-touch drawing
      const pos = getTouchPos(e);
      handlePointerDown(pos);
    },
    { passive: false }
  );

  canvas.addEventListener(
    "touchmove",
    (e) => {
      if (e.touches && e.touches.length > 1) {
        isPinchZoom = true;
        // Don't preventDefault - allow native pinch zoom
        return;
      }
      if (isPinchZoom) return;

      e.preventDefault(); // Prevent scrolling for single-touch drawing
      const pos = getTouchPos(e);
      handlePointerMove(pos);
    },
    { passive: false }
  );

  canvas.addEventListener(
    "touchend",
    (e) => {
      if (isPinchZoom) {
        if (!e.touches || e.touches.length === 0) {
          isPinchZoom = false;
        }
        // Don't preventDefault - allow native behavior
        return;
      }

      e.preventDefault();
      handlePointerUp();
    },
    { passive: false }
  );

  canvas.addEventListener(
    "touchcancel",
    (e) => {
      if (isPinchZoom) {
        isPinchZoom = false;
        // Don't preventDefault - allow native behavior
        return;
      }

      e.preventDefault();
      handlePointerUp();
    },
    { passive: false }
  );

  canvas.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    const pos = getMousePos(e);

    // Remove point if right-clicking near it
    for (let i = points.length - 1; i >= 0; i--) {
      const p = points[i];
      const dist = Math.sqrt((pos.x - p.x) ** 2 + (pos.y - p.y) ** 2);
      if (dist < DOT_RADIUS * 2) {
        points.splice(i, 1);
        draw();
        break;
      }
    }
  });

  // Button handlers
  const undoLastBtn = document.getElementById(undoLastBtnId);
  if (undoLastBtn) {
    undoLastBtn.addEventListener("click", () => {
      if (points.length > 0) {
        points.pop();
        draw();
      }
    });
  }

  const undoAllBtn = document.getElementById(undoAllBtnId);
  if (undoAllBtn) {
    undoAllBtn.addEventListener("click", () => {
      if (points.length > 0 && confirm("Clear all points?")) {
        points = [];
        draw();
      }
    });
  }

  const saveBtn = document.getElementById(saveBtnId);
  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      // Create temporary canvas with image + drawing
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext("2d");

      // Draw image
      tempCtx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Draw line
      if (points.length > 1) {
        tempCtx.strokeStyle = lineColor;
        tempCtx.lineWidth = lineWidth;
        tempCtx.setLineDash(lineDash);
        tempCtx.lineCap = "round";
        tempCtx.lineJoin = "round";

        tempCtx.beginPath();
        tempCtx.moveTo(points[0].x, points[0].y);

        for (let i = 1; i < points.length - 1; i++) {
          const xc = (points[i].x + points[i + 1].x) / 2;
          const yc = (points[i].y + points[i + 1].y) / 2;
          tempCtx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
        }

        tempCtx.lineTo(
          points[points.length - 1].x,
          points[points.length - 1].y
        );
        tempCtx.stroke();
      }

      // Download
      const link = document.createElement("a");
      link.download = saveFilename;
      link.href = tempCanvas.toDataURL("image/png");
      link.click();
    });
  }

  // Initialize
  img.addEventListener("load", resizeCanvas);
  if (img.complete) {
    resizeCanvas();
  }
  window.addEventListener("resize", resizeCanvas);
}
