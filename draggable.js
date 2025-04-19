console.log('🟢 draggable.js loaded');

document.addEventListener('DOMContentLoaded', async () => {
  const track = document.querySelector('.draggable-track');
  const gridArea = document.getElementById('gridArea');

  try {
    const res = await fetch('wordBank.txt');
    const text = await res.text();
    const words = text.split(/\r?\n/).map(w => w.trim()).filter(Boolean);

    console.log(`Loaded ${words.length} words from wordBank.txt`);
    track.innerHTML = '';

    words.slice(0, 10).forEach((word, idx) => {
      const box = document.createElement('div');
      box.className = 'draggable-box';
      box.draggable = true;
      box.id = `draggable-${idx}`; // unique ID for DnD

      for (const letter of word) {
        const span = document.createElement('div');
        span.className = 'letter-box';
        span.textContent = letter;
        box.appendChild(span);
      }

      // Listen for drag start
      box.addEventListener('dragstart', e => {
        e.dataTransfer.setData('text/plain', box.id);
      });

      track.appendChild(box);
    });

    // initDragAndDrop(); // If you're only doing DnD from footer to grid, this isn't needed

  } catch (err) {
    console.error('❌ Failed to load wordBank.txt:', err);
  }
});

// Handle dragover
document.getElementById('gridArea').addEventListener('dragover', (e) => {
  e.preventDefault();
});

// Handle drop on grid
document.getElementById('gridArea').addEventListener('drop', (e) => {
  e.preventDefault();
  const draggedId = e.dataTransfer.getData('text/plain');
  const draggedEl = document.getElementById(draggedId);
  const gridArea = document.getElementById('gridArea');

  const gridRect = gridArea.getBoundingClientRect();
  const cellWidth = gridRect.width / 15;
  const cellHeight = gridRect.height / 15;

  const x = e.clientX - gridRect.left;
  const y = e.clientY - gridRect.top;

  // Make sure it was dropped *inside* the grid
  if (x < 0 || x > gridRect.width || y < 0 || y > gridRect.height) {
    console.log("❌ Drop was outside the grid");
    return;
  }

  // Snap to cell
  const col = Math.floor(x / cellWidth) + 1;
  const row = Math.floor(y / cellHeight) + 1;

  draggedEl.style.position = 'absolute';
  draggedEl.style.left = 'unset';
  draggedEl.style.top = 'unset';
  draggedEl.style.gridColumn = `${col} / span 1`;
  draggedEl.style.gridRow = `${row} / span 1`;

  // ⛔ Don't wipe the grid cells — just move this box into the grid!
  if (!gridArea.contains(draggedEl)) {
    gridArea.appendChild(draggedEl);
  }
});
