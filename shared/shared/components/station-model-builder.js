/**
 * Station Model Builder Component
 * Drag-and-drop interface for building weather station models
 */

export function initializeStationModelBuilder(config) {
  const {
    containerId,
    weatherData,
    saveFilename = "station_model.png",
  } = config;
  const container = document.getElementById(containerId);

  if (!container) {
    console.warn(`Station model builder container not found: ${containerId}`);
    return;
  }

  // Inject the HTML structure
  container.innerHTML = `
        <div class="label-bank">
            <h3>🏷️ Label Bank</h3>
            <p style="text-align: center; color: #666; font-size: 13px;">Drag these labels to the workspace ↓</p>
            <div class="labels-container" id="labelBank">
                <div class="draggable-label" draggable="true">53</div>
                <div class="draggable-label" draggable="true">51</div>
                <div class="draggable-label" draggable="true">045</div>
                <div class="draggable-label" draggable="true">1004.5</div>

                <!-- Wind Barb -->
                <div class="draggable-label" draggable="true" data-type="wind-barb">
                    <svg width="48" height="48" viewBox="0 0 48 48" style="pointer-events: none;">
                        <g>
                            <line x1="24" y1="64" x2="24" y2="8" stroke="#000" stroke-width="2"></line>
                            <line x1="24" y1="8" x2="40" y2="4" stroke="#000" stroke-width="2"></line>
                            <line x1="24" y1="18" x2="32" y2="15" stroke="#000" stroke-width="2"></line>
                        </g>
                    </svg>
                </div>

                <!-- Weather Symbols -->
                <div class="draggable-label" draggable="true" data-type="weather">
                    <svg width="32" height="32" viewBox="0 0 32 32" style="pointer-events: none;">
                        <circle cx="11" cy="20" r="3" fill="#000"></circle>
                        <circle cx="21" cy="20" r="3" fill="#000"></circle>
                    </svg>
                </div>

                <!-- Sky Coverage -->
                <div class="draggable-label" draggable="true" data-type="sky">
                    <svg width="48" height="48" viewBox="0 0 48 48" style="pointer-events: none;">
                        <circle cx="24" cy="24" r="22" fill="#222" stroke="#000" stroke-width="2"></circle>
                    </svg>
                </div>
            </div>
        </div>

        <div class="workspace" id="workspace" data-save-filename="${saveFilename}"></div>

        <div class="controls">
            <button class="btn-success" onclick="window.stationModelSave()">💾 Save Image</button>
            <button class="btn-secondary" onclick="window.location.reload();">🔄 Reset</button>
        </div>
    `;

  // Initialize drag and drop
  initializeDragAndDrop();
}

/**
 * Initialize drag and drop functionality (desktop and mobile)
 */
function initializeDragAndDrop() {
  const labels = document.querySelectorAll(".draggable-label");
  const workspace = document.getElementById("workspace");
  let draggedElement = null;
  let touchDraggedElement = null;
  let touchClone = null;

  labels.forEach((label) => {
    // Desktop drag and drop
    label.addEventListener("dragstart", handleDragStart);
    label.addEventListener("dragend", handleDragEnd);

    // Mobile touch drag
    label.addEventListener("touchstart", handleTouchStart, { passive: false });
  });

  workspace.addEventListener("dragover", handleDragOver);
  workspace.addEventListener("drop", handleDrop);

  // Desktop handlers
  function handleDragStart(e) {
    draggedElement = e.target;
    e.target.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", e.target.innerHTML);
  }

  function handleDragEnd(e) {
    e.target.classList.remove("dragging");
  }

  function handleDragOver(e) {
    if (e.preventDefault) {
      e.preventDefault();
    }
    e.dataTransfer.dropEffect = "move";
    return false;
  }

  // Mobile touch handlers
  function handleTouchStart(e) {
    e.preventDefault();
    touchDraggedElement = e.target.closest(".draggable-label");
    if (!touchDraggedElement) return;

    // Create a visual clone that follows the finger
    touchClone = touchDraggedElement.cloneNode(true);
    touchClone.style.position = "fixed";
    touchClone.style.pointerEvents = "none";
    touchClone.style.opacity = "0.8";
    touchClone.style.zIndex = "9999";
    touchClone.style.width = touchDraggedElement.offsetWidth + "px";
    touchClone.style.height = touchDraggedElement.offsetHeight + "px";
    document.body.appendChild(touchClone);

    const touch = e.touches[0];
    touchClone.style.left =
      touch.clientX - touchDraggedElement.offsetWidth / 2 + "px";
    touchClone.style.top =
      touch.clientY - touchDraggedElement.offsetHeight / 2 + "px";

    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd);
  }

  function handleTouchMove(e) {
    if (!touchClone) return;
    e.preventDefault();

    const touch = e.touches[0];
    touchClone.style.left = touch.clientX - touchClone.offsetWidth / 2 + "px";
    touchClone.style.top = touch.clientY - touchClone.offsetHeight / 2 + "px";
  }

  function handleTouchEnd(e) {
    if (!touchDraggedElement || !touchClone) return;

    const touch = e.changedTouches[0];
    const workspaceRect = workspace.getBoundingClientRect();

    // Check if touch ended inside workspace
    if (
      touch.clientX >= workspaceRect.left &&
      touch.clientX <= workspaceRect.right &&
      touch.clientY >= workspaceRect.top &&
      touch.clientY <= workspaceRect.bottom
    ) {
      const x = touch.clientX - workspaceRect.left;
      const y = touch.clientY - workspaceRect.top;

      // Create dropped label
      createDroppedLabel(x, y, touchDraggedElement);
    }

    // Cleanup
    if (touchClone) {
      touchClone.remove();
      touchClone = null;
    }
    touchDraggedElement = null;

    document.removeEventListener("touchmove", handleTouchMove);
    document.removeEventListener("touchend", handleTouchEnd);
  }

  function handleDrop(e) {
    if (e.stopPropagation) {
      e.stopPropagation();
    }
    e.preventDefault();

    const rect = workspace.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    createDroppedLabel(x, y, draggedElement);
  }

  function createDroppedLabel(x, y, sourceElement) {
    // Create dropped label
    const droppedLabel = document.createElement("div");
    droppedLabel.className = "dropped-label";
    droppedLabel.style.left = x - 30 + "px";
    droppedLabel.style.top = y - 15 + "px";

    if (sourceElement.dataset.type === "wind-barb") {
      droppedLabel.innerHTML = draggedElement.innerHTML;
      droppedLabel.style.width = "80px";
      droppedLabel.style.height = "80px";
      droppedLabel.setAttribute("data-type", "wind-barb");

      // Scale up the SVG to match the container
      const svg = droppedLabel.querySelector("svg");
      if (svg) {
        svg.setAttribute("width", "80");
        svg.setAttribute("height", "80");
      }

      // Add rotation handle
      const rotateHandle = document.createElement("div");
      rotateHandle.className = "rotate-handle";
      rotateHandle.title = "Rotate";
      droppedLabel.appendChild(rotateHandle);

      enableRotation(droppedLabel, rotateHandle);
    } else if (sourceElement.dataset.type === "weather") {
      droppedLabel.innerHTML = sourceElement.innerHTML;
      droppedLabel.style.width = "32px";
      droppedLabel.style.height = "32px";
      droppedLabel.setAttribute("data-type", "weather");
    } else if (sourceElement.dataset.type === "sky") {
      droppedLabel.innerHTML = sourceElement.innerHTML;
      droppedLabel.setAttribute("data-type", "sky");
      droppedLabel.style.width = "150px";
      droppedLabel.style.height = "150px";
      const svg = droppedLabel.querySelector("svg");
      if (svg) {
        svg.setAttribute("width", "150");
        svg.setAttribute("height", "150");
      }
    } else {
      droppedLabel.textContent = sourceElement.textContent;
      droppedLabel.style.color = "black";
      droppedLabel.style.fontSize = "16px";
      droppedLabel.style.fontWeight = "bold";
    }

    // Make draggable within workspace (mouse and touch)
    droppedLabel.addEventListener("mousedown", startDragDroppedLabel);
    droppedLabel.addEventListener("touchstart", startDragDroppedLabel, {
      passive: false,
    });
    workspace.appendChild(droppedLabel);

    // Remove from label bank
    sourceElement.remove();

    return false;
  }
}

/**
 * Enable rotation for wind barb (mouse and touch)
 */
function enableRotation(label, handle) {
  let isRotating = false;

  function startRotation(e) {
    e.stopPropagation();
    e.preventDefault();
    isRotating = true;

    const rect = label.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    function rotateMove(ev) {
      if (!isRotating) return;

      // Get clientX/Y from touch or mouse event
      const clientX = ev.touches ? ev.touches[0].clientX : ev.clientX;
      const clientY = ev.touches ? ev.touches[0].clientY : ev.clientY;

      const dx = clientX - centerX;
      const dy = clientY - centerY;
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
      label.style.transform = `rotate(${angle + 90}deg)`;
    }

    function stopRotate() {
      isRotating = false;
      document.removeEventListener("mousemove", rotateMove);
      document.removeEventListener("mouseup", stopRotate);
      document.removeEventListener("touchmove", rotateMove);
      document.removeEventListener("touchend", stopRotate);
    }

    document.addEventListener("mousemove", rotateMove);
    document.addEventListener("mouseup", stopRotate);
    document.addEventListener("touchmove", rotateMove, { passive: false });
    document.addEventListener("touchend", stopRotate);
  }

  handle.addEventListener("mousedown", startRotation);
  handle.addEventListener("touchstart", startRotation, { passive: false });
}

/**
 * Handle dragging dropped labels (mouse and touch)
 */
function startDragDroppedLabel(e) {
  const label = e.target.closest(".dropped-label");
  if (!label) return;

  e.preventDefault();

  const workspace = document.getElementById("workspace");
  const rect = workspace.getBoundingClientRect();

  // Get clientX/Y from touch or mouse event
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;

  const offsetX = clientX - label.offsetLeft - rect.left;
  const offsetY = clientY - label.offsetTop - rect.top;

  function moveLabel(ev) {
    // Get clientX/Y from touch or mouse event
    const moveClientX = ev.touches ? ev.touches[0].clientX : ev.clientX;
    const moveClientY = ev.touches ? ev.touches[0].clientY : ev.clientY;

    const newX = moveClientX - rect.left - offsetX;
    const newY = moveClientY - rect.top - offsetY;

    const maxX = workspace.offsetWidth - label.offsetWidth;
    const maxY = workspace.offsetHeight - label.offsetHeight;

    label.style.left = Math.max(0, Math.min(newX, maxX)) + "px";
    label.style.top = Math.max(0, Math.min(newY, maxY)) + "px";
  }

  function stopDrag() {
    document.removeEventListener("mousemove", moveLabel);
    document.removeEventListener("mouseup", stopDrag);
    document.removeEventListener("touchmove", moveLabel);
    document.removeEventListener("touchend", stopDrag);
  }

  document.addEventListener("mousemove", moveLabel);
  document.addEventListener("mouseup", stopDrag);
  document.addEventListener("touchmove", moveLabel, { passive: false });
  document.addEventListener("touchend", stopDrag);
}

/**
 * Save workspace as image
 */
window.stationModelSave = function () {
  const workspace = document.getElementById("workspace");
  const filename = workspace.dataset.saveFilename || "station_model.png";

  // Use html2canvas to capture the workspace
  if (typeof html2canvas !== "undefined") {
    html2canvas(workspace, { backgroundColor: null }).then((canvas) => {
      const link = document.createElement("a");
      link.download = filename;
      link.href = canvas.toDataURL("image/png");
      link.click();
    });
  } else {
    alert("html2canvas library not loaded. Cannot save image.");
  }
};
