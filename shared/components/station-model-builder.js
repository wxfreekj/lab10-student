/**
 * Station Model Builder Component
 * Drag-and-drop interface for building weather station models
 */

export function initializeStationModelBuilder(config) {
    const { containerId, weatherData, saveFilename = 'station_model.png' } = config;
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
                    <svg width="48" height="48" viewBox="0 0 48 48" style="pointer-events: none; transform: rotate(45deg);">
                        <g>
                            <line x1="24" y1="44" x2="24" y2="4" stroke="#000" stroke-width="2"></line>
                            <line x1="24" y1="8" x2="40" y2="16" stroke="#000" stroke-width="2"></line>
                            <line x1="24" y1="18" x2="32" y2="22" stroke="#000" stroke-width="2"></line>
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
 * Initialize drag and drop functionality
 */
function initializeDragAndDrop() {
    const labels = document.querySelectorAll('.draggable-label');
    const workspace = document.getElementById('workspace');
    let draggedElement = null;

    labels.forEach(label => {
        label.addEventListener('dragstart', handleDragStart);
        label.addEventListener('dragend', handleDragEnd);
    });

    workspace.addEventListener('dragover', handleDragOver);
    workspace.addEventListener('drop', handleDrop);

    function handleDragStart(e) {
        draggedElement = e.target;
        e.target.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', e.target.innerHTML);
    }

    function handleDragEnd(e) {
        e.target.classList.remove('dragging');
    }

    function handleDragOver(e) {
        if (e.preventDefault) {
            e.preventDefault();
        }
        e.dataTransfer.dropEffect = 'move';
        return false;
    }

    function handleDrop(e) {
        if (e.stopPropagation) {
            e.stopPropagation();
        }
        e.preventDefault();

        const rect = workspace.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Create dropped label
        const droppedLabel = document.createElement('div');
        droppedLabel.className = 'dropped-label';
        droppedLabel.style.left = (x - 30) + 'px';
        droppedLabel.style.top = (y - 15) + 'px';

        if (draggedElement.dataset.type === 'wind-barb') {
            droppedLabel.innerHTML = draggedElement.innerHTML;
            droppedLabel.style.width = '48px';
            droppedLabel.style.height = '48px';
            droppedLabel.setAttribute('data-type', 'wind-barb');
            
            // Add rotation handle
            const rotateHandle = document.createElement('div');
            rotateHandle.className = 'rotate-handle';
            rotateHandle.title = 'Rotate';
            droppedLabel.appendChild(rotateHandle);
            
            enableRotation(droppedLabel, rotateHandle);
        } else if (draggedElement.dataset.type === 'weather') {
            droppedLabel.innerHTML = draggedElement.innerHTML;
            droppedLabel.style.width = '32px';
            droppedLabel.style.height = '32px';
            droppedLabel.setAttribute('data-type', 'weather');
        } else if (draggedElement.dataset.type === 'sky') {
            droppedLabel.innerHTML = draggedElement.innerHTML;
            droppedLabel.setAttribute('data-type', 'sky');
            droppedLabel.style.width = '150px';
            droppedLabel.style.height = '150px';
            const svg = droppedLabel.querySelector('svg');
            if (svg) {
                svg.setAttribute('width', '150');
                svg.setAttribute('height', '150');
            }
        } else {
            droppedLabel.textContent = draggedElement.textContent;
            droppedLabel.style.color = 'black';
            droppedLabel.style.fontSize = '16px';
            droppedLabel.style.fontWeight = 'bold';
        }

        // Make draggable within workspace
        droppedLabel.addEventListener('mousedown', startDragDroppedLabel);
        workspace.appendChild(droppedLabel);
        
        // Remove from label bank
        draggedElement.remove();

        return false;
    }
}

/**
 * Enable rotation for wind barb
 */
function enableRotation(label, handle) {
    let isRotating = false;
    
    handle.addEventListener('mousedown', function(e) {
        e.stopPropagation();
        isRotating = true;
        
        const rect = label.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        function rotateMove(ev) {
            if (!isRotating) return;
            const dx = ev.clientX - centerX;
            const dy = ev.clientY - centerY;
            const angle = Math.atan2(dy, dx) * 180 / Math.PI;
            label.style.transform = `rotate(${angle + 90}deg)`;
        }
        
        function stopRotate() {
            isRotating = false;
            document.removeEventListener('mousemove', rotateMove);
            document.removeEventListener('mouseup', stopRotate);
        }
        
        document.addEventListener('mousemove', rotateMove);
        document.addEventListener('mouseup', stopRotate);
    });
}

/**
 * Handle dragging dropped labels
 */
function startDragDroppedLabel(e) {
    const label = e.target.closest('.dropped-label');
    if (!label) return;
    
    const workspace = document.getElementById('workspace');
    const rect = workspace.getBoundingClientRect();

    const offsetX = e.clientX - label.offsetLeft - rect.left;
    const offsetY = e.clientY - label.offsetTop - rect.top;

    function moveLabel(e) {
        const newX = e.clientX - rect.left - offsetX;
        const newY = e.clientY - rect.top - offsetY;

        const maxX = workspace.offsetWidth - label.offsetWidth;
        const maxY = workspace.offsetHeight - label.offsetHeight;

        label.style.left = Math.max(0, Math.min(newX, maxX)) + 'px';
        label.style.top = Math.max(0, Math.min(newY, maxY)) + 'px';
    }

    function stopDrag() {
        document.removeEventListener('mousemove', moveLabel);
        document.removeEventListener('mouseup', stopDrag);
    }

    document.addEventListener('mousemove', moveLabel);
    document.addEventListener('mouseup', stopDrag);
}

/**
 * Save workspace as image
 */
window.stationModelSave = function() {
    const workspace = document.getElementById('workspace');
    const filename = workspace.dataset.saveFilename || 'station_model.png';
    
    // Use html2canvas to capture the workspace
    if (typeof html2canvas !== 'undefined') {
        html2canvas(workspace, { backgroundColor: null }).then(canvas => {
            const link = document.createElement('a');
            link.download = filename;
            link.href = canvas.toDataURL('image/png');
            link.click();
        });
    } else {
        alert('html2canvas library not loaded. Cannot save image.');
    }
};
