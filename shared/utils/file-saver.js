/**
 * Utility functions for saving student work as files
 */

export function saveAsText(content, filename = 'lab-answer.txt') {
    const blob = new Blob([content], { type: 'text/plain' });
    downloadBlob(blob, filename);
}

export function saveAsPNG(canvas, filename = 'lab-answer.png') {
    canvas.toBlob((blob) => {
        downloadBlob(blob, filename);
    }, 'image/png');
}

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}