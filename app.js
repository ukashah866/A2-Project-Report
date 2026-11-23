const canvas = document.getElementById('ar-canvas');
const ctx = canvas.getContext('2d');

// Simulated room surface zones
const spatialZones = [
  { id: 'North Wall', x: 100, y: 80,  width: 220, height: 160, glareRisk: 15, viewDist: 2.1, score: 92 },
  { id: 'East Wall',  x: 530, y: 50,  width: 200, height: 240, glareRisk: 85, viewDist: 1.4, score: 45 },
  { id: 'Desk Area',  x: 180, y: 320, width: 240, height: 120, glareRisk: 30, viewDist: 0.8, score: 78 }
];

// State variables
let currentPlacement = null;
let currentZoneIndex = 0;
let hoveredZoneIndex = -1; // Tracks mouse hover over canvas

// Checks if mouse (mx, my) is inside a zone rectangle
function isMouseInZone(mx, my, zone) {
  return mx >= zone.x && mx <= zone.x + zone.width &&
         my >= zone.y && my <= zone.y + zone.height;
}

// Main rendering function
function drawRoom() {
  // Clear & dark background
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Perspective grid (simulated spatial mesh)
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1;
  for (let x = 0; x < canvas.width; x += 40) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += 40) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
  }

  // Window glare source (East Wall)
  const windowRect = { x: 530, y: 50, width: 200, height: 240 };
  ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';
  ctx.fillRect(windowRect.x, windowRect.y, windowRect.width, windowRect.height);
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(windowRect.x, windowRect.y, windowRect.width, windowRect.height);
  ctx.fillStyle = '#38bdf8';
  ctx.font = '12px sans-serif';
  ctx.fillText('Window (Glare Source)', 540, 40);

  // Render candidate surfaces and hover zones
  spatialZones.forEach((zone, i) => {
    const isHovered = (i === hoveredZoneIndex);
    const isSelected = (currentPlacement && currentPlacement.zone.id === zone.id);

    // Hovered zones glow cyan, unhovered are subtle slate
    ctx.strokeStyle = isHovered ? '#38bdf8' : (isSelected ? '#0284c7' : '#475569');
    ctx.lineWidth = isHovered ? 2 : 1;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(zone.x, zone.y, zone.width, zone.height);
    ctx.setLineDash([]);

    ctx.fillStyle = isHovered ? '#38bdf8' : '#94a3b8';
    ctx.font = isHovered ? 'bold 12px sans-serif' : '11px sans-serif';
    ctx.fillText(`Zone: ${zone.id}`, zone.x + 8, zone.y + 18);
  });

  // Render placed AR object and Spatial vector rationale line
  if (currentPlacement) {
    const zone = currentPlacement.zone;

    // Draw vector line connecting Ar object to window glare source
    const objCenterX = zone.x + zone.width / 2;
    const objCenterY = zone.y + zone.height / 2;
    const windowCenterX = windowRect.x + windowRect.width / 2;
    const windowCenterY = windowRect.y + windowRect.height / 2;

    ctx.strokeStyle = 'rgba(244, 63, 94, 0.4)'; // Subtle red line indicating glare evaluation path
    ctx.lineWidth = 1.5;
    ctx.setLineDash([2, 4]);
    ctx.beginPath();
    ctx.moveTo(objCenterX, objCenterY);
    ctx.lineTo(windowCenterX, windowCenterY);
    ctx.stroke();
    ctx.setLineDash([]);

  
    ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
    ctx.fillRect(zone.x + 15, zone.y + 30, zone.width - 30, zone.height - 45);


    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.strokeRect(zone.x + 15, zone.y + 30, zone.width - 30, zone.height - 45);


    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText(`[AR] ${currentPlacement.objectName}`, zone.x + 25, zone.y + 60);


    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.arc(objCenterX, objCenterY, 5, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Updates the HTML sidebar rationale card based on active zone selection
function updateRationaleUI(zone, isDirectClick = false) {
  const selectedObject = document.getElementById('object-select').value;
  
  const statusLabel = isDirectClick ? 'Direct Canvas Override' : 'Auto-Optimized';
  
  document.getElementById('explanation-text').innerHTML = 
    `Positioned <strong>${selectedObject}</strong> in <em>${zone.id}</em>. ` +
    (isDirectClick 
      ? `User selected this surface via direct canvas interaction. Spatial model updated.`
      : `Minimizes glare exposure (${zone.glareRisk}% risk) with optimal viewing distance of ${zone.viewDist}.`);

  document.getElementById('metrics-container').innerHTML = `
    <div class="metric-row"><span>System Confidence:</span><span class="metric-value">${isDirectClick ? 'Manual' : zone.score + '%'}</span></div>
    <div class="metric-row"><span>Glare Risk:</span><span class="metric-value">${zone.glareRisk}%</span></div>
    <div class="metric-row"><span>Control State:</span><span class="metric-value" style="color: ${isDirectClick ? '#38bdf8' : '#34d399'}">${statusLabel}</span></div>
  `;
}

// Mouse movement listener (Hover Highlights)
canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  let foundIndex = -1;
  spatialZones.forEach((zone, index) => {
    if (isMouseInZone(mouseX, mouseY, zone)) {
      foundIndex = index;
    }
  });

  if (hoveredZoneIndex !== foundIndex) {
    hoveredZoneIndex = foundIndex;
    canvas.style.cursor = foundIndex !== -1 ? 'pointer' : 'default';
    drawRoom();
  }
});

// Mouse click listener (Direct Canvas Manipulation)
canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  spatialZones.forEach((zone, index) => {
    if (isMouseInZone(mouseX, mouseY, zone)) {
      const selectedObject = document.getElementById('object-select').value;
      currentZoneIndex = index;
      currentPlacement = {
        objectName: selectedObject,
        zone: zone,
        isOverridden: true
      };

      updateRationaleUI(zone, true);
      drawRoom();
    }
  });
});

// Button event listener: Auto-Place object
document.getElementById('btn-autoplace').addEventListener('click', () => {
  const selectedObject = document.getElementById('object-select').value;
  const glareWeight = parseInt(document.getElementById('glare-pref').value);

  currentZoneIndex = glareWeight > 50 ? 0 : 2;
  const bestZone = spatialZones[currentZoneIndex];

  currentPlacement = {
    objectName: selectedObject,
    zone: bestZone,
    isOverridden: false
  };

  updateRationaleUI(bestZone, false);
  drawRoom();
});

// Button event listener: Manual Override / Shift Spot
document.getElementById('btn-override').addEventListener('click', () => {
  if (!currentPlacement) return;

  currentZoneIndex = (currentZoneIndex + 1) % spatialZones.length;
  const newZone = spatialZones[currentZoneIndex];

  currentPlacement.zone = newZone;
  currentPlacement.isOverridden = true;

  updateRationaleUI(newZone, true);
  drawRoom();
});

// Initial Render
drawRoom();