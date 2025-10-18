/**
 * Multi-Line Canvas Drawing Tool
 * For drawing multiple lines with different types (e.g., multiple isotherms)
 */

export function initializeMultiLineCanvas(config) {
  const {
    canvasId,
    imageId,
    selectId,
    undoLastBtnId,
    undoAllBtnId,
    saveBtnId,
    saveFilename = "drawing.png",
    lineTypes = {},
  } = config;

  const img = document.getElementById(imageId);
  const canvas = document.getElementById(canvasId);
  const lineSelect = document.getElementById(selectId);

  // If elements don't exist, exit gracefully
  if (!img || !canvas || !lineSelect) {
    console.warn(`Multi-line canvas elements not found`);
    return;
  }

  const ctx = canvas.getContext("2d", { alpha: true });
  const DOT_RADIUS = 6;
  const LABEL_COLOR = "#111111";

  // Initialize lines object - each line type has array of points
  let lines = {};
  Object.keys(lineTypes).forEach((key) => {
    lines[key] = []; // Array of points for this line type
  });

  let currentLineKey = Object.keys(lineTypes)[0];
  let draggingIdx = null;

  /**
   * Set canvas to exact pixel size of image
   */
  function setExactPixelSize() {
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    if (w === 0 || h === 0) return;

    const stage = img.parentElement;
    stage.style.width = w + "px";
    stage.style.height = h + "px";

    canvas.width = w;
    canvas.height = h;

    ctx.imageSmoothingEnabled = false;
    draw();
  }

  /**
   * Draw all lines and current editing handles
   */
  function draw() {
    if (!canvas.width || !canvas.height) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all lines
    Object.keys(lineTypes).forEach((key) => {
      const lineConfig = lineTypes[key];
      const points = lines[key];

      if (points && points.length > 0) {
        drawPath(ctx, points, lineConfig);
      }
    });

    // Draw handles for current line being edited
    const currentPoints = lines[currentLineKey];
    if (currentPoints && currentPoints.length > 0) {
      drawHandles(ctx, currentPoints);
    }
  }

  /**
   * Draw a single path
   */
  function drawPath(g, points, config) {
    if (points.length < 2) return;

    g.save();
    g.strokeStyle = config.color;
    g.lineWidth = config.width || 3;
    g.lineCap = "round";
    g.lineJoin = "round";

    if (config.dash) {
      g.setLineDash(config.dash);
    }

    g.beginPath();
    g.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length - 1; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2;
      const yc = (points[i].y + points[i + 1].y) / 2;
      g.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }

    g.lineTo(points[points.length - 1].x, points[points.length - 1].y);
    g.stroke();
    g.restore();

    // Draw labels if configured
    if (config.label && points.length > 0) {
      drawLabels(g, points, config.label);
    }
  }

  /**
   * Draw labels at start and end of line
   */
  function drawLabels(g, points, labelText) {
    g.save();
    g.font = "bold 16px Arial";
    g.fillStyle = LABEL_COLOR;
    g.strokeStyle = "#fff";
    g.lineWidth = 4;
    g.textAlign = "center";
    g.textBaseline = "bottom";

    const p0 = points[0];
    const pe = points[points.length - 1];

    // Start label
    g.strokeText(labelText, p0.x, p0.y - DOT_RADIUS - 4);
    g.fillText(labelText, p0.x, p0.y - DOT_RADIUS - 4);

    // End label
    g.strokeText(labelText, pe.x, pe.y - DOT_RADIUS - 4);
    g.fillText(labelText, pe.x, pe.y - DOT_RADIUS - 4);

    g.restore();
  }

  /**
   * Draw control point handles
   */
  function drawHandles(g, points) {
    g.strokeStyle = "#ffffff";
    g.lineWidth = 2;

    for (const p of points) {
      g.beginPath();
      g.arc(p.x, p.y, DOT_RADIUS, 0, 2 * Math.PI);
      g.fillStyle = LABEL_COLOR;
      g.fill();
      g.stroke();
    }
  }

  /**
   * Get mouse position in canvas coordinates
   */
  function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  /**
   * Get touch position in canvas coordinates
   */
  function getTouchPos(e) {
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0] || e.changedTouches[0];
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    };
  }

  /**
   * Handle point interaction (mouse or touch)
   */
  function handlePointerDown(pos) {
    const currentPoints = lines[currentLineKey];

    // Check if dragging existing point
    for (let i = 0; i < currentPoints.length; i++) {
      const p = currentPoints[i];
      const dist = Math.sqrt((pos.x - p.x) ** 2 + (pos.y - p.y) ** 2);
      if (dist < DOT_RADIUS * 2) {
        draggingIdx = i;
        return;
      }
    }

    // Add new point
    currentPoints.push(pos);
    draw();
  }

  /**
   * Handle point dragging (mouse or touch)
   */
  function handlePointerMove(pos) {
    if (draggingIdx === null) return;
    const currentPoints = lines[currentLineKey];
    currentPoints[draggingIdx] = pos;
    draw();
  }

  /**
   * Handle point release (mouse or touch)
   */
  function stopDragging() {
    draggingIdx = null;
  }

  // Event Listeners
  lineSelect.addEventListener("change", (e) => {
    currentLineKey = e.target.value;
    draggingIdx = null;
    draw();
  });

  // Mouse Event Listeners
  canvas.addEventListener("mousedown", (e) => {
    const pos = getMousePos(e);
    handlePointerDown(pos);
  });

  canvas.addEventListener("mousemove", (e) => {
    const pos = getMousePos(e);
    handlePointerMove(pos);
  });

  canvas.addEventListener("mouseup", stopDragging);
  canvas.addEventListener("mouseleave", stopDragging);

  // Touch Event Listeners
  canvas.addEventListener("touchstart", (e) => {
    e.preventDefault(); // Prevent scrolling
    const pos = getTouchPos(e);
    handlePointerDown(pos);
  });

  canvas.addEventListener("touchmove", (e) => {
    e.preventDefault(); // Prevent scrolling
    const pos = getTouchPos(e);
    handlePointerMove(pos);
  });

  canvas.addEventListener("touchend", (e) => {
    e.preventDefault();
    stopDragging();
  });

  canvas.addEventListener("touchcancel", (e) => {
    e.preventDefault();
    stopDragging();
  });

  canvas.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    const pos = getMousePos(e);
    const currentPoints = lines[currentLineKey];

    for (let i = currentPoints.length - 1; i >= 0; i--) {
      const p = currentPoints[i];
      const dist = Math.sqrt((pos.x - p.x) ** 2 + (pos.y - p.y) ** 2);
      if (dist < DOT_RADIUS * 2) {
        currentPoints.splice(i, 1);
        draw();
        break;
      }
    }
  });

  // Button handlers
  const undoLastBtn = document.getElementById(undoLastBtnId);
  if (undoLastBtn) {
    undoLastBtn.addEventListener("click", () => {
      const currentPoints = lines[currentLineKey];
      if (currentPoints.length > 0) {
        currentPoints.pop();
        draw();
      }
    });
  }

  const undoAllBtn = document.getElementById(undoAllBtnId);
  if (undoAllBtn) {
    undoAllBtn.addEventListener("click", () => {
      const currentPoints = lines[currentLineKey];
      if (
        currentPoints.length > 0 &&
        confirm("Clear all points for current line?")
      ) {
        lines[currentLineKey] = [];
        draw();
      }
    });
  }

  const saveBtn = document.getElementById(saveBtnId);
  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      // Create temporary canvas
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext("2d", { alpha: true });
      tempCtx.imageSmoothingEnabled = false;

      // Draw background image
      tempCtx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Draw all lines
      Object.keys(lineTypes).forEach((key) => {
        const lineConfig = lineTypes[key];
        const points = lines[key];
        if (points && points.length > 0) {
          drawPath(tempCtx, points, lineConfig);
        }
      });

      // Download
      const link = document.createElement("a");
      link.download = saveFilename;
      link.href = tempCanvas.toDataURL("image/png");
      link.click();
    });
  }

  // Initialize
  img.addEventListener("load", setExactPixelSize);
  if (img.complete) {
    setTimeout(setExactPixelSize, 100);
  }
  window.addEventListener("resize", () => setTimeout(setExactPixelSize, 100));
}
