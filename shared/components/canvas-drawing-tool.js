/**
 * Reusable Canvas Drawing Tool for Map Annotation
 * Supports multiple line types (isobars, fronts, etc.)
 */

export function initializeDrawingTool(config) {
    const {
        canvasId = 'draw-canvas',
        imageId = 'bg-img',
        selectId = 'line-select',
        undoLastBtnId = 'undo-last-btn',
        undoAllBtnId = 'undo-all-btn',
        saveBtnId = 'save-btn',
        saveFilename = 'drawing.png',
        lineTypes = {}
    } = config;

    const img = document.getElementById(imageId);
    const canvas = document.getElementById(canvasId);
    const lineSelect = document.getElementById(selectId);

    if (!img || !canvas || !lineSelect) {
        console.error("Drawing tool elements not found.");
        return;
    }

    const ctx = canvas.getContext('2d', { alpha: true });

    // --- STATE VARIABLES ---
    const DOT_RADIUS = 6;
    let lines = {};
    Object.keys(lineTypes).forEach(type => lines[type] = []);

    let currentPoints = [];
    let currentLineType = Object.keys(lineTypes)[0];
    let draggingIdx = null;

    // --- CORE DRAWING FUNCTIONS ---
    function setExactPixelSize() {
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        if (w === 0 || h === 0) return;

        const stage = img.parentElement;
        stage.style.width = w + 'px';
        stage.style.height = h + 'px';

        canvas.width = w;
        canvas.height = h;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        drawAll();
    }

    function drawAll() {
        if (!canvas.width || !canvas.height) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (const type in lines) {
            lines[type].forEach(path => drawPath(ctx, path, type));
        }

        drawPath(ctx, currentPoints, currentLineType);
        drawHandles(ctx, currentPoints);
    }

    function drawPath(g, points, type) {
        if (points.length < 2) return;

        g.beginPath();
        g.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length - 1; i++) {
            const xc = (points[i].x + points[i + 1].x) / 2;
            const yc = (points[i].y + points[i + 1].y) / 2;
            g.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
        }
        g.lineTo(points[points.length - 1].x, points[points.length - 1].y);

        g.lineCap = 'round';
        g.lineJoin = 'round';

        const style = lineTypes[type];
        if (style) {
            g.strokeStyle = style.color;
            g.lineWidth = style.width || 3;
            g.stroke();

            if (style.label) {
                drawLabel(g, points, style.label);
            }
        }
    }

    function drawLabel(g, points, labelText) {
        if (points.length < 1) return;

        const firstPoint = points[0];
        const lastPoint = points[points.length - 1];

        g.save();
        g.font = 'bold 16px Arial';
        g.fillStyle = '#000000';
        g.strokeStyle = 'white';
        g.lineWidth = 4;
        g.textAlign = 'center';
        g.textBaseline = 'bottom';

        g.strokeText(labelText, firstPoint.x, firstPoint.y - 10);
        g.fillText(labelText, firstPoint.x, firstPoint.y - 10);

        g.strokeText(labelText, lastPoint.x, lastPoint.y - 10);
        g.fillText(labelText, lastPoint.x, lastPoint.y - 10);

        g.restore();
    }

    function drawHandles(g, points) {
        g.strokeStyle = '#ffffff';
        g.lineWidth = 2;
        for (const p of points) {
            g.beginPath();
            g.arc(p.x, p.y, DOT_RADIUS, 0, 2 * Math.PI);
            g.fillStyle = '#2c3e50';
            g.fill();
            g.stroke();
        }
    }

    // --- EVENT HANDLERS ---
    lineSelect.addEventListener('change', (e) => {
        if (currentPoints.length > 1) {
            lines[currentLineType].push([...currentPoints]);
        }
        currentPoints = [];
        currentLineType = e.target.value;
        draggingIdx = null;
        drawAll();
    });

    function getMousePos(e) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    }

    canvas.addEventListener('mousedown', e => {
        if (e.button !== 0) return;
        const pos = getMousePos(e);

        for (let i = 0; i < currentPoints.length; i++) {
            const p = currentPoints[i];
            if ((pos.x - p.x) ** 2 + (pos.y - p.y) ** 2 < DOT_RADIUS ** 2 * 4) {
                draggingIdx = i;
                return;
            }
        }
        currentPoints.push(pos);
        drawAll();
    });

    canvas.addEventListener('mousemove', e => {
        if (draggingIdx === null) return;
        currentPoints[draggingIdx] = getMousePos(e);
        drawAll();
    });

    function stopDragging() {
        draggingIdx = null;
    }
    canvas.addEventListener('mouseup', stopDragging);
    canvas.addEventListener('mouseleave', stopDragging);

    canvas.addEventListener('contextmenu', e => {
        e.preventDefault();
        const pos = getMousePos(e);
        for (let i = currentPoints.length - 1; i >= 0; i--) {
            const p = currentPoints[i];
            if ((pos.x - p.x) ** 2 + (pos.y - p.y) ** 2 < DOT_RADIUS ** 2 * 4) {
                currentPoints.splice(i, 1);
                drawAll();
                return;
            }
        }
    });

    document.getElementById(undoLastBtnId).addEventListener('click', () => {
        if (currentPoints.length) {
            currentPoints.pop();
            drawAll();
        }
    });

    document.getElementById(undoAllBtnId).addEventListener('click', () => {
        if (confirm(`Are you sure you want to clear all points for the current line?`)) {
            currentPoints = [];
            drawAll();
        }
    });

    document.getElementById(saveBtnId).addEventListener('click', () => {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tctx = tempCanvas.getContext('2d');

        tctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        for (const type in lines) {
            lines[type].forEach(path => drawPath(tctx, path, type));
        }
        drawPath(tctx, currentPoints, currentLineType);

        const a = document.createElement('a');
        a.download = saveFilename;
        a.href = tempCanvas.toDataURL('image/png');
        a.click();
    });

    // --- INITIALIZATION ---
    img.addEventListener('load', setExactPixelSize);
    if (img.complete) {
        setTimeout(setExactPixelSize, 100);
    }
    window.addEventListener('resize', () => setTimeout(setExactPixelSize, 100));
}