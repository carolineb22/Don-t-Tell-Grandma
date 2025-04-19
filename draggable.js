console.log('🟢 draggable.js loaded');

document.addEventListener('DOMContentLoaded', async () => {
  const track = document.querySelector('.draggable-track');
  const gridArea = document.getElementById('gridArea');
  const occupiedCells = {}; // Track occupied cells with a dictionary

  // Generate grid cells
  const generateGridCells = () => {
    const rows = 15;
    const cols = 15;
    gridArea.style.display = 'grid';
    gridArea.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    gridArea.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        cell.dataset.row = row;
        cell.dataset.col = col;
        gridArea.appendChild(cell);

        // Default grid cell is white, with no color change
        cell.style.backgroundColor = 'white';
      }
    }
  };

  generateGridCells(); // Generate grid cells once the DOM is ready

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

  } catch (err) {
    console.error('❌ Failed to load wordBank.txt:', err);
  }

  // Handle dragover
  document.getElementById('gridArea').addEventListener('dragover', (e) => {
    e.preventDefault();
  });

  // Handle drop on grid
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

  const col = Math.floor(x / cellWidth);
  const row = Math.floor(y / cellHeight);
  const wordLength = draggedEl.children.length;

  // ✅ Prevent word from going off the right edge
  if (col + wordLength > 15) {
    console.log("❌ Word would overflow grid");
    return;
  }

  let canPlace = true;

  // ✅ Check if each cell is free
  for (let i = 0; i < wordLength; i++) {
    const cellIndex = row * 15 + col + i;
    const cell = gridArea.children[cellIndex];

    // Check if another draggable is already sitting on this spot
    const occupyingElement = [...gridArea.children].find(child => {
      if (!child.classList.contains('draggable-box')) return false;
      const childRow = parseInt(child.style.gridRowStart || child.style.gridRow?.split(" ")[0]);
      const childCol = parseInt(child.style.gridColumnStart || child.style.gridColumn?.split(" ")[0]);
      const childSpan = parseInt(child.style.gridColumn?.split("span ")[1]) || child.children.length;
      return childRow === row + 1 && col + i + 1 >= childCol && col + i + 1 < childCol + childSpan;
    });

    if (occupyingElement) {
      canPlace = false;
      break;
    }
  }

  if (!canPlace) {
    console.log("❌ Can't place here — overlapping another word.");
    return;
  }

  // ✅ Place the word
  draggedEl.style.position = 'absolute';
  draggedEl.style.left = 'unset';
  draggedEl.style.top = 'unset';
  draggedEl.style.gridColumn = `${col + 1} / span ${wordLength}`;
  draggedEl.style.gridRow = `${row + 1} / span 1`;

  if (!gridArea.contains(draggedEl)) {
    gridArea.appendChild(draggedEl);
  }
});

});
