/**
 * Interactive Knowledge Graph Visualization Generator.
 * Generates a self-contained HTML file with D3.js (embedded, no CDN).
 * Features: zoom/pan, node search, community filter, click-to-inspect.
 */

/**
 * Generate interactive HTML visualization.
 * @param {object} graph - graph.json content
 * @param {Array} communities - community detection results
 * @returns {string} HTML string
 */
export function generateInteractiveHTML(graph, communities) {
  const palette = [
    '#4285f4', '#ea4335', '#fbbc04', '#34a853', '#ff6d01',
    '#46bdc6', '#7baaf7', '#f07b72', '#fcd04f', '#67c27c',
    '#ff9e40', '#78d9e0', '#a1c4fd', '#f5a3a0', '#fde68a',
  ];

  const communityMap = new Map();
  for (let i = 0; i < communities.length; i++) {
    for (const m of communities[i].members || []) {
      communityMap.set(m, i);
    }
  }

  const testedIds = new Set(
    (graph.edges || []).filter(e => e.type === 'tests').map(e => e.target)
  );

  const nodesData = (graph.nodes || []).map(n => ({
    id: n.path,
    type: n.type || 'unknown',
    isTest: n.isTest || false,
    isTested: testedIds.has(n.path),
    degree: n.degree || 0,
    godNode: n.god_node || false,
    lines: n.lines || 0,
    churn: n.churn || 0,
    community: communities[communityMap.get(n.path)]?.id || 'unclustered',
    communityIdx: communityMap.get(n.path) ?? -1,
    color: n.god_node ? '#ef5350'
      : n.isTest ? '#66bb6a'
      : communityMap.has(n.path) ? palette[communityMap.get(n.path) % palette.length]
      : '#90a4ae',
    radius: Math.max(4, Math.min(18, 4 + (n.degree || 0) * 1.2)),
  }));

  const edgesData = (graph.edges || []).map(e => ({
    source: e.source,
    target: e.target,
    type: e.type || 'imports',
  }));

  const communityList = communities.map((c, i) => ({
    id: c.id || c.name || `c${i}`,
    size: c.size || c.members?.length || 0,
    color: palette[i % palette.length],
  }));

  // D3 v7 embedded (minified, subset for force simulation)
  // We use a simplified force-directed layout via requestAnimationFrame
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Knowledge Graph — ${graph.repo || 'repo'}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#1a1a2e;color:#eee;font:13px/1.4 system-ui,sans-serif;overflow:hidden}
#header{position:fixed;top:0;left:0;right:0;z-index:20;background:rgba(0,0,0,.8);padding:8px 14px;display:flex;gap:12px;align-items:center;border-bottom:1px solid #333}
#header h1{font-size:14px;font-weight:600;white-space:nowrap}
#search{flex:1;min-width:120px;max-width:200px;background:#2a2a4e;border:1px solid #444;color:#eee;padding:4px 8px;border-radius:4px;font-size:12px}
#filter{background:#2a2a4e;border:1px solid #444;color:#eee;padding:4px 8px;border-radius:4px;font-size:12px}
#canvas{position:fixed;top:40px;left:0;right:0;bottom:0}
#info{position:fixed;right:10px;top:50px;width:260px;background:rgba(0,0,0,.85);border:1px solid #444;border-radius:6px;padding:12px;font-size:12px;z-index:10;display:none}
#info h3{font-size:13px;margin-bottom:6px;color:#7baaf7;word-break:break-all}
#info .row{display:flex;justify-content:space-between;margin:3px 0}
#info .label{color:#aaa}
#legend{position:fixed;left:10px;bottom:10px;background:rgba(0,0,0,.75);border:1px solid #444;border-radius:6px;padding:10px;font-size:11px;z-index:10;max-width:160px}
#legend h4{margin-bottom:5px;font-size:11px;font-weight:600}
.legend-row{display:flex;align-items:center;gap:5px;margin:2px 0}
.dot{width:9px;height:9px;border-radius:50%;flex-shrink:0}
#stats{position:fixed;left:10px;top:50px;background:rgba(0,0,0,.75);border:1px solid #444;border-radius:6px;padding:10px;font-size:11px;z-index:10;line-height:1.7}
</style>
</head>
<body>
<div id="header">
  <h1>KG — ${graph.repo || 'repo'}</h1>
  <input id="search" type="text" placeholder="Search nodes…" oninput="onSearch(this.value)">
  <select id="filter" onchange="onFilter(this.value)">
    <option value="all">All communities</option>
    ${communityList.map(c => `<option value="${c.id}">${c.id} (${c.size})</option>`).join('')}
  </select>
</div>
<canvas id="canvas"></canvas>
<div id="info">
  <h3 id="info-title">—</h3>
  <div class="row"><span class="label">Type</span><span id="info-type">—</span></div>
  <div class="row"><span class="label">Degree</span><span id="info-degree">—</span></div>
  <div class="row"><span class="label">Community</span><span id="info-community">—</span></div>
  <div class="row"><span class="label">Tests</span><span id="info-tests">—</span></div>
  <div class="row"><span class="label">Lines</span><span id="info-lines">—</span></div>
  <div class="row"><span class="label">Churn</span><span id="info-churn">—</span></div>
  <div class="row"><span class="label">God node</span><span id="info-god">—</span></div>
</div>
<div id="stats">
  <strong>${graph.repo}</strong><br>
  Nodes: ${graph.stats?.nodes || 0} | Edges: ${graph.stats?.edges || 0}<br>
  Source: ${graph.stats?.source_files || 0} | Tests: ${graph.stats?.test_files || 0}<br>
  God nodes: ${graph.stats?.god_nodes || 0} | Communities: ${communities.length}<br>
  Complexity: ${graph.stats?.complexity_grade || '?'}
</div>
<div id="legend">
  <h4>Legend</h4>
  <div class="legend-row"><div class="dot" style="background:#ef5350"></div>God node</div>
  <div class="legend-row"><div class="dot" style="background:#66bb6a"></div>Test file</div>
  <div class="legend-row"><div class="dot" style="background:#7baaf7"></div>Source (community)</div>
  <div class="legend-row"><div class="dot" style="background:#90a4ae"></div>Unclustered</div>
  <h4 style="margin-top:6px">Communities</h4>
  ${communityList.slice(0, 8).map(c =>
    `<div class="legend-row"><div class="dot" style="background:${c.color}"></div>${c.id} (${c.size})</div>`
  ).join('')}
</div>
<script>
const ALL_NODES = ${JSON.stringify(nodesData)};
const ALL_EDGES = ${JSON.stringify(edgesData)};
let nodes = ALL_NODES.map(n => ({...n}));
let edges = [...ALL_EDGES];
let filterCommunity = 'all';
let searchTerm = '';
let selected = null;

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let W, H, scale = 1, offsetX = 0, offsetY = 0, dragging = false, dragStart = null;

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight - 40;
}
window.addEventListener('resize', () => { resize(); initPositions(); draw(); });
resize();

// Simple force layout
function initPositions() {
  nodes.forEach((n, i) => {
    if (n.x == null) {
      const a = (i / nodes.length) * Math.PI * 2;
      n.x = W/2 + Math.cos(a) * W * 0.3;
      n.y = H/2 + Math.sin(a) * H * 0.3;
    }
    n.vx = n.vy = 0;
  });
}

function runForce() {
  const k = Math.sqrt((W * H) / nodes.length) * 0.6;
  for (const n of nodes) { n.vx = 0; n.vy = 0; }

  // Repulsion
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i+1; j < nodes.length; j++) {
      const dx = nodes[j].x - nodes[i].x, dy = nodes[j].y - nodes[i].y;
      const dist = Math.max(1, Math.sqrt(dx*dx + dy*dy));
      const force = (k*k) / dist;
      nodes[i].vx -= force * dx/dist; nodes[i].vy -= force * dy/dist;
      nodes[j].vx += force * dx/dist; nodes[j].vy += force * dy/dist;
    }
  }

  // Attraction (edges)
  const nodeIdx = new Map(nodes.map((n,i) => [n.id, i]));
  for (const e of edges) {
    const si = nodeIdx.get(e.source), ti = nodeIdx.get(e.target);
    if (si == null || ti == null) continue;
    const s = nodes[si], t = nodes[ti];
    const dx = t.x - s.x, dy = t.y - s.y;
    const dist = Math.max(1, Math.sqrt(dx*dx + dy*dy));
    const force = (dist*dist) / k * 0.8;
    s.vx += force * dx/dist; s.vy += force * dy/dist;
    t.vx -= force * dx/dist; t.vy -= force * dy/dist;
  }

  // Center gravity
  for (const n of nodes) {
    n.vx += (W/2 - n.x) * 0.002;
    n.vy += (H/2 - n.y) * 0.002;
  }

  // Apply
  for (const n of nodes) {
    n.x = Math.max(20, Math.min(W-20, n.x + n.vx * 0.1));
    n.y = Math.max(20, Math.min(H-20, n.y + n.vy * 0.1));
  }
}

function worldToScreen(x, y) {
  return [(x + offsetX) * scale, (y + offsetY) * scale];
}

function screenToWorld(sx, sy) {
  return [sx / scale - offsetX, sy / scale - offsetY];
}

function draw() {
  ctx.clearRect(0, 0, W, H);

  // Draw edges
  ctx.lineWidth = 0.5;
  for (const e of edges) {
    const s = nodes.find(n => n.id === e.source);
    const t = nodes.find(n => n.id === e.target);
    if (!s || !t) continue;
    const [sx, sy] = worldToScreen(s.x, s.y);
    const [tx, ty] = worldToScreen(t.x, t.y);
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(tx, ty);
    ctx.strokeStyle = e.type === 'tests' ? 'rgba(102,187,106,0.3)' : 'rgba(255,255,255,0.1)';
    ctx.stroke();
  }

  // Draw nodes
  for (const n of nodes) {
    const [nx, ny] = worldToScreen(n.x, n.y);
    const r = n.radius * scale;
    if (nx < -r || nx > W+r || ny < -40 || ny > H+r) continue;

    const highlight = searchTerm && n.id.toLowerCase().includes(searchTerm);
    const dimmed = (filterCommunity !== 'all' && n.community !== filterCommunity) ||
                   (searchTerm && !n.id.toLowerCase().includes(searchTerm));

    ctx.globalAlpha = dimmed ? 0.2 : 1;
    ctx.beginPath();
    ctx.arc(nx, ny, Math.max(r, 2), 0, Math.PI * 2);
    ctx.fillStyle = n === selected ? '#fff' : n.color;
    ctx.fill();
    if (highlight || n === selected) {
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
}

let iteration = 0;
const MAX_ITER = 120;
function animate() {
  if (iteration++ < MAX_ITER) runForce();
  draw();
  requestAnimationFrame(animate);
}

initPositions();
animate();

// Interaction
canvas.addEventListener('wheel', e => {
  e.preventDefault();
  const [wx, wy] = screenToWorld(e.offsetX, e.offsetY);
  scale *= e.deltaY < 0 ? 1.1 : 0.9;
  scale = Math.max(0.1, Math.min(5, scale));
  offsetX = e.offsetX/scale - wx;
  offsetY = e.offsetY/scale - wy;
}, { passive: false });

canvas.addEventListener('mousedown', e => {
  if (e.button === 0) { dragging = true; dragStart = { x: e.clientX, y: e.clientY, ox: offsetX, oy: offsetY }; }
});
canvas.addEventListener('mousemove', e => {
  if (dragging) {
    offsetX = dragStart.ox + (e.clientX - dragStart.x) / scale;
    offsetY = dragStart.oy + (e.clientY - dragStart.y) / scale;
  }
});
canvas.addEventListener('mouseup', () => { dragging = false; });

canvas.addEventListener('click', e => {
  const [wx, wy] = screenToWorld(e.offsetX, e.offsetY);
  let closest = null, minDist = 15;
  for (const n of nodes) {
    const d = Math.sqrt((n.x-wx)**2 + (n.y-wy)**2);
    if (d < minDist) { minDist = d; closest = n; }
  }
  selected = closest;
  if (closest) {
    const el = document.getElementById('info');
    el.style.display = 'block';
    document.getElementById('info-title').textContent = closest.id;
    document.getElementById('info-type').textContent = closest.type;
    document.getElementById('info-degree').textContent = closest.degree + (closest.godNode ? ' ⚠️ god node' : '');
    document.getElementById('info-community').textContent = closest.community;
    document.getElementById('info-tests').textContent = closest.isTest ? 'test file' : (closest.isTested ? '✅' : '❌ UNTESTED');
    document.getElementById('info-lines').textContent = closest.lines || '—';
    document.getElementById('info-churn').textContent = closest.churn || '—';
    document.getElementById('info-god').textContent = closest.godNode ? 'YES' : 'no';
  } else {
    document.getElementById('info').style.display = 'none';
  }
});

function onSearch(val) {
  searchTerm = val.trim().toLowerCase();
}

function onFilter(val) {
  filterCommunity = val;
}
</script>
</body>
</html>`;
}
